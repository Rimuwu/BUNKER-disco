import { IGameTask } from '@bunker/shared';
import { WorkerContext } from '../TaskWorker.js';
import { VotingEngine, IVotingSession } from '../../engine/phase1/voting-engine.js';
import { TimerCoordinator } from '../../engine/gm/timer-coordinator.js';

export class Phase1ResolveVotingHandler {
  public async handle(task: IGameTask, context: WorkerContext): Promise<any> {
    const { roomId } = task;
    const { repositories, broadcaster, producer } = context;

    const gameState = await repositories.games.findByRoomId(roomId);
    if (!gameState || !gameState.phase1?.votingSession) {
      throw new Error(`NO_ACTIVE_VOTING_SESSION: Room ${roomId} has no active voting session.`);
    }

    const phase1 = gameState.phase1;
    const sessionDoc = phase1.votingSession!;

    const players = await repositories.players.findByRoomId(roomId);
    const activeSurvivors = players.filter((p) => !p.isEliminated).map((p) => p.playerId);

    const vetoedIds = (sessionDoc as any).vetoedPlayerIds || (phase1 as any).vetoedPlayerIds || [];
    const isTieBreakRound = Boolean((sessionDoc as any).isTieBreakRound);
    const tiedCandidates = (sessionDoc as any).tiedCandidates || [];

    // Filter out vetoed candidates from nominees
    const baseNominees = ((sessionDoc as any).nominees && (sessionDoc as any).nominees.length > 0)
      ? (sessionDoc as any).nominees
      : (isTieBreakRound && tiedCandidates.length > 0 ? tiedCandidates : activeSurvivors);

    const eligibleNominees = baseNominees.filter((id: string) => !vetoedIds.includes(id));

    const session: IVotingSession = {
      isOpen: sessionDoc.isOpen,
      timerExpiresAt: sessionDoc.timerExpiresAt,
      ballots: sessionDoc.ballots || {},
      nominees: eligibleNominees,
      vetoedPlayerIds: vetoedIds,
      isTieBreakRound,
      tiedCandidates,
    };

    const tallyResult = VotingEngine.tally(session);

    if (tallyResult.needsRevote) {
      // First tie detected: Open 60s revote round limited to tied nominees
      phase1.votingSession = {
        isOpen: true,
        timerExpiresAt: Date.now() + 60 * 1000,
        ballots: {},
        nominees: tallyResult.tiedNominees,
        vetoedPlayerIds: vetoedIds,
        isTieBreakRound: true,
        tiedCandidates: tallyResult.tiedNominees,
      } as any;

      await repositories.games.update(roomId, { phase1 });

      broadcaster.broadcastVoteResult(roomId, {
        nomineeId: tallyResult.tiedNominees[0],
        votesFor: tallyResult.voteCounts[tallyResult.tiedNominees[0]] || 0,
        votesAgainst: 0,
        eliminated: false,
        tieBreak: true,
      });

      return {
        status: 'tie_break_revote',
        tiedNominees: tallyResult.tiedNominees,
      };
    }

    // A nominee is selected for elimination (either clear majority or coin toss)
    const eliminatedId = tallyResult.eliminatedNomineeId;
    if (!eliminatedId) {
      throw new Error('NO_NOMINEE_ELIMINATED: Failed to resolve eliminated nominee.');
    }

    // Verify candidate veto: if veto was applied by this candidate, cancel exile
    const vetoAppliedBy = (sessionDoc as any).vetoAppliedBy;
    if (vetoAppliedBy && vetoAppliedBy === eliminatedId) {
      if (phase1.votingSession) {
        phase1.votingSession.isOpen = false;
      }
      await repositories.games.update(roomId, { phase1 });
      TimerCoordinator.clearTimer(roomId, 'voting');

      return {
        status: 'voting_resolved',
        eliminatedPlayerId: null,
        vetoApplied: true,
        message: 'Кандидат использовал вето. Изгнание в этом раунде аннулировано.',
      };
    }

    // Close voting session & clear GM timer
    if (phase1.votingSession) {
      phase1.votingSession.isOpen = false;
    }
    await repositories.games.update(roomId, { phase1 });
    TimerCoordinator.clearTimer(roomId, 'voting');

    const eliminatedPlayer = players.find((p) => p.playerId === eliminatedId);

    broadcaster.broadcastVoteResult(roomId, {
      nomineeId: eliminatedId,
      votesFor: tallyResult.voteCounts[eliminatedId] || 0,
      votesAgainst: tallyResult.totalVotes - (tallyResult.voteCounts[eliminatedId] || 0),
      eliminated: true,
      tieBreak: tallyResult.resolvedByCoinToss,
    });

    // Enqueue exile execution
    await producer.enqueueTask({
      taskId: `exile_${roomId}_${eliminatedId}_${Date.now()}`,
      type: 'PHASE1_EXILE',
      roomId,
      playerId: eliminatedId,
      payload: { eliminatedPlayerId: eliminatedId },
      queuedAt: Date.now(),
    });

    return {
      status: 'voting_resolved',
      eliminatedPlayerId: eliminatedId,
      nickname: eliminatedPlayer?.nickname,
      resolvedByCoinToss: tallyResult.resolvedByCoinToss,
    };
  }
}
