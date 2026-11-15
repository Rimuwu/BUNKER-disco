import { IGameTask } from '@bunker/shared';
import { WorkerContext } from '../TaskWorker.js';
import { ExileDraftEngine } from '../../engine/phase1/exile-draft.js';
import { APEconomy } from '../../engine/phase1/ap-economy.js';

export class Phase1ExileHandler {
  public async handle(task: IGameTask, context: WorkerContext): Promise<any> {
    const { roomId, payload } = task;
    const { repositories, broadcaster, producer } = context;

    const eliminatedPlayerId = payload?.eliminatedPlayerId || task.playerId;
    if (!eliminatedPlayerId) {
      throw new Error('MISSING_PLAYER_ID: No player specified for exile.');
    }

    const gameState = await repositories.games.findByRoomId(roomId);
    if (!gameState || !gameState.phase1) {
      throw new Error(`GAME_STATE_NOT_FOUND: Room ${roomId} has no active Phase 1 state.`);
    }

    const player = await repositories.players.findById(eliminatedPlayerId);
    if (!player) {
      throw new Error(`PLAYER_NOT_FOUND: Player ${eliminatedPlayerId} not found.`);
    }

    // 1. Execute dramatic exile sequence
    const { exiledCards, availableLoot } = ExileDraftEngine.executeExileSequence(player);
    await repositories.players.update(player.playerId, {
      isEliminated: true,
      role: 'spectator',
      cards: player.cards,
      inventory: [],
    });

    const phase1 = gameState.phase1;
    if (!phase1.exiledPlayers.includes(eliminatedPlayerId)) {
      phase1.exiledPlayers.push(eliminatedPlayerId);
    }
    phase1.survivorsCount = Math.max(0, phase1.survivorsCount - 1);

    // 2. Broadcast exile event & loot draft
    broadcaster.broadcastPlayerEliminated(roomId, {
      playerId: player.playerId,
      nickname: player.nickname,
      finalCards: Object.values(exiledCards),
    });

    const allPlayers = await repositories.players.findByRoomId(roomId);
    const aliveSurvivors = allPlayers.filter((p) => !p.isEliminated);

    if (availableLoot.length > 0) {
      broadcaster.broadcastLootDraftStarted(roomId, {
        exiledPlayerId: player.playerId,
        items: availableLoot,
        draftOrder: aliveSurvivors.map((s) => s.playerId),
        timeLimitSeconds: 30,
      });
    }

    // 3. Check Transition Invariant: survivors == targetCapacityK
    const targetK = phase1.targetCapacityK;
    if (phase1.survivorsCount === targetK) {
      // TRANSITION TO PHASE 2!
      await repositories.games.update(roomId, { phase1 });

      await producer.enqueueTask({
        taskId: `phase2_start_${roomId}_${Date.now()}`,
        type: 'PHASE2_START',
        roomId,
        queuedAt: Date.now(),
      });

      return {
        status: 'transition_to_phase2',
        survivorsRemaining: phase1.survivorsCount,
        targetCapacityK: targetK,
        exiledPlayer: player.nickname,
      };
    } else {
      // Advance to next Phase 1 round
      phase1.currentRound += 1;
      (phase1 as any).vetoedPlayerIds = [];
      delete (phase1 as any).vetoAppliedBy;
      if (phase1.votingSession) {
        delete (phase1.votingSession as any).vetoAppliedBy;
        (phase1.votingSession as any).vetoedPlayerIds = [];
        phase1.votingSession.ballots = {};
        phase1.votingSession.isOpen = false;
        (phase1.votingSession as any).nominees = aliveSurvivors.map((s) => s.playerId);
      }

      const debateDuration = 60;
      phase1.debateTimerExpiresAt = Date.now() + debateDuration * 1000;
      phase1.activeSpeakerId = aliveSurvivors[0]?.playerId;

      await repositories.games.update(roomId, { phase1 });

      // Refresh AP to 3 for all surviving players
      for (const survivor of aliveSurvivors) {
        APEconomy.refreshRoundAP(survivor);
        await repositories.players.update(survivor.playerId, {
          actionPoints: 3,
        });
      }

      broadcaster.broadcastPhase1Start(roomId, {
        round: phase1.currentRound,
        revealOrder: ['profession', 'biology', 'health', 'hobby', 'item'],
      });

      return {
        status: 'advanced_round',
        currentRound: phase1.currentRound,
        survivorsRemaining: phase1.survivorsCount,
        targetCapacityK: targetK,
      };
    }
  }
}
