import { IGameTask } from '@bunker/shared';
import { WorkerContext } from '../TaskWorker.js';
import { CrisisResolver } from '../../engine/phase2/crisis-resolver.js';
import { ResourceManager } from '../../engine/phase2/resource-manager.js';
import { VictoryEvaluator } from '../../engine/phase2/victory-evaluator.js';

export class Phase2CrisisCheckHandler {
  public async handle(task: IGameTask, context: WorkerContext): Promise<any> {
    const { roomId, payload } = task;
    const { repositories, broadcaster } = context;

    const gameState = await repositories.games.findByRoomId(roomId);
    if (!gameState || !gameState.phase2) {
      throw new Error(`INVALID_PHASE: Room ${roomId} has no active Phase 2 state.`);
    }

    const phase2 = gameState.phase2;
    const players = await repositories.players.findByRoomId(roomId);
    const aliveSurvivors = players.filter((p) => !p.isEliminated);

    const forceRoll = Boolean(payload?.forceRoll);
    if (!CrisisResolver.shouldTriggerDailyCrisis(forceRoll)) {
      return { triggered: false, message: 'День прошел без чрезвычайных ситуаций.' };
    }

    // Roll threat
    const threat = CrisisResolver.rollThreat();

    // Broadcast incoming threat with 30s reaction timer
    broadcaster.broadcastThreatIncoming(roomId, {
      threatId: threat.cardId,
      name: threat.name,
      description: threat.description,
      counterSpecialists: threat.metadata?.counterSpecialists || [],
      reactionSeconds: 30,
    });

    // Resolve threat against specialist counters
    const resolution = CrisisResolver.resolveThreat(threat, aliveSurvivors);

    if (resolution.countered) {
      broadcaster.broadcastThreatResolved(roomId, {
        threatId: threat.cardId,
        countered: true,
        counteredBy: resolution.counteredBy?.playerId,
        message: resolution.message,
      });
    } else {
      // Apply resource damage
      phase2.resources = ResourceManager.applyDeltas(phase2.resources, resolution.resourceDamage).updated;
      phase2.activeThreats.push(threat.cardId);

      // Apply HP damage to survivors
      for (const s of aliveSurvivors) {
        s.stats.health = Math.max(0, s.stats.health - resolution.hpDamage);
        if (s.stats.health <= 0) {
          s.isEliminated = true;
          s.role = 'spectator';
        }
        await repositories.players.update(s.playerId, {
          stats: s.stats,
          isEliminated: s.isEliminated,
          role: s.role,
        });
      }

      await repositories.games.update(roomId, { phase2 });

      broadcaster.broadcastThreatResolved(roomId, {
        threatId: threat.cardId,
        countered: false,
        damageApplied: resolution.resourceDamage,
        message: resolution.message,
      });

      // Check instant defeat on Air=0
      if (phase2.resources.air <= 0) {
        const gameEnd = VictoryEvaluator.evaluateGameEnd(
          phase2.currentDay,
          phase2.resources,
          { foodZeroDays: 0, waterZeroDays: 0, airZeroDays: 1, moraleZeroDays: 0 },
          aliveSurvivors
        );

        broadcaster.broadcastGameOver(roomId, {
          outcome: 'DEFEAT',
          reason: gameEnd.reason!,
          daysSurvived: phase2.currentDay,
          survivors: [],
        });

        await repositories.rooms.updateStatus(roomId, 'ended');
      }
    }

    return {
      triggered: true,
      threatId: threat.cardId,
      threatName: threat.name,
      countered: resolution.countered,
      message: resolution.message,
    };
  }
}
