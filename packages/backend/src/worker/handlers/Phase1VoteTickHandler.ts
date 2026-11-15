import { IGameTask } from '@bunker/shared';
import { WorkerContext } from '../TaskWorker.js';
import { GMPacing } from '../../engine/gm/gm-pacing.js';
import { TimerCoordinator } from '../../engine/gm/timer-coordinator.js';

export class Phase1VoteTickHandler {
  public async handle(task: IGameTask, context: WorkerContext): Promise<any> {
    const { roomId, payload } = task;
    const { repositories, broadcaster, producer } = context;

    const gameState = await repositories.games.findByRoomId(roomId);
    if (!gameState || gameState.phase !== 'phase1' || !gameState.phase1) {
      return { skipped: true, reason: 'Game not in phase 1.' };
    }

    const room = await repositories.rooms.findById(roomId);
    const pacingConfig = GMPacing.getConfig((room?.settings as any)?.pacingMode || 'standard');
    const now = Date.now();
    const phase1 = gameState.phase1;

    // 1. If currently in voting session
    if (phase1.votingSession && phase1.votingSession.isOpen) {
      const remainingSeconds = Math.max(0, Math.ceil((phase1.votingSession.timerExpiresAt - now) / 1000));
      const isExpired = remainingSeconds <= 0 || TimerCoordinator.isExpired(roomId, 'voting');

      if (isExpired) {
        // Voting expired -> Enqueue resolution immediately
        TimerCoordinator.clearTimer(roomId, 'voting');
        await producer.enqueueTask({
          taskId: `resolve_vote_${roomId}_${Date.now()}`,
          type: 'PHASE1_RESOLVE_VOTING',
          roomId,
          queuedAt: Date.now(),
        });

        return { session: 'voting', status: 'expired_queued_resolution' };
      } else {
        broadcaster.broadcastDebateTick(roomId, {
          timerType: 'voting',
          remainingSeconds,
          totalSeconds: pacingConfig.votingDurationSeconds,
        });

        return { session: 'voting', remainingSeconds };
      }
    }

    // 2. Currently in debate turn
    const debateExpiresAt = phase1.debateTimerExpiresAt ?? 0;
    const remainingDebateSeconds = Math.max(0, Math.ceil((debateExpiresAt - now) / 1000));
    const isDebateExpired = remainingDebateSeconds <= 0 || TimerCoordinator.isExpired(roomId, 'debate');

    if (isDebateExpired) {
      const players = await repositories.players.findByRoomId(roomId);
      const activeSurvivors = players.filter((p) => !p.isEliminated).map((p) => p.playerId);

      const spokenSpeakers: string[] = (phase1 as any).spokenSpeakers || [];
      if (phase1.activeSpeakerId && !spokenSpeakers.includes(phase1.activeSpeakerId)) {
        spokenSpeakers.push(phase1.activeSpeakerId);
      }

      // Check if there are active survivors who haven't had their speaker turn yet
      const forceVote = Boolean(payload?.forceVote) || Boolean((phase1 as any).allSpeakersCompleted);
      const nextSpeaker = !forceVote
        ? activeSurvivors.find((id) => !spokenSpeakers.includes(id))
        : undefined;

      if (nextSpeaker) {
        // Rotate to next speaker
        phase1.activeSpeakerId = nextSpeaker;
        spokenSpeakers.push(nextSpeaker);
        (phase1 as any).spokenSpeakers = spokenSpeakers;

        const debateDuration = room?.settings?.discussionTimerSeconds ?? pacingConfig.discussionDurationSeconds;
        phase1.debateTimerExpiresAt = now + debateDuration * 1000;
        TimerCoordinator.startTimer(roomId, 'debate', debateDuration);

        await repositories.games.update(roomId, { phase1 });

        broadcaster.broadcastDebateTick(roomId, {
          timerType: 'debate',
          remainingSeconds: debateDuration,
          totalSeconds: debateDuration,
          activeSpeakerId: nextSpeaker,
        });

        broadcaster.broadcastSceneDirective(roomId, {
          cameraMode: 'SPEAKER_FOCUS',
        });

        return {
          session: 'debate_next_speaker',
          activeSpeakerId: nextSpeaker,
          spokenCount: spokenSpeakers.length,
          totalSurvivors: activeSurvivors.length,
        };
      }

      // All active survivors have completed their debate turn -> Open voting session!
      (phase1 as any).spokenSpeakers = [];
      const votingDuration = room?.settings?.votingTimerSeconds ?? pacingConfig.votingDurationSeconds;
      const votingTimerExpiresAt = now + votingDuration * 1000;
      TimerCoordinator.startTimer(roomId, 'voting', votingDuration);

      const vetoedIds = (phase1 as any).vetoedPlayerIds || [];
      const eligibleNominees = activeSurvivors.filter((id) => !vetoedIds.includes(id));

      phase1.votingSession = {
        isOpen: true,
        timerExpiresAt: votingTimerExpiresAt,
        ballots: {},
        nominees: eligibleNominees,
        vetoedPlayerIds: vetoedIds,
        vetoAppliedBy: undefined,
      } as any;

      await repositories.games.update(roomId, { phase1 });

      broadcaster.broadcastVoteStarted(roomId, {
        nomineeId: eligibleNominees[0],
        timeLimit: votingDuration,
        voterIds: activeSurvivors,
      });

      broadcaster.broadcastSceneDirective(roomId, {
        cameraMode: 'VOTE_ARENA',
      });

      return { session: 'debate_transition_to_vote', activeNominees: eligibleNominees };
    } else {
      broadcaster.broadcastDebateTick(roomId, {
        timerType: 'debate',
        remainingSeconds: remainingDebateSeconds,
        totalSeconds: pacingConfig.discussionDurationSeconds,
        activeSpeakerId: phase1.activeSpeakerId,
      });

      return { session: 'debate', remainingSeconds: remainingDebateSeconds };
    }
  }
}
