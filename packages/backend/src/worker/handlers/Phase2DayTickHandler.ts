import { IGameTask } from '@bunker/shared';
import { WorkerContext } from '../TaskWorker.js';
import { SimulationEngine } from '../../engine/phase2/simulation.js';
import { QuestEvaluator } from '../../engine/phase2/quest-evaluator.js';
import { ScenarioRunner } from '../../engine/gm/scenario-runner.js';

export class Phase2DayTickHandler {
  public async handle(task: IGameTask, context: WorkerContext): Promise<any> {
    const { roomId, payload } = task;
    const { repositories, broadcaster } = context;

    const gameState = await repositories.games.findByRoomId(roomId);
    if (!gameState || gameState.phase !== 'phase2' || !gameState.phase2) {
      throw new Error(`INVALID_PHASE: Room ${roomId} is not in Phase 2.`);
    }

    const room = await repositories.rooms.findById(roomId);
    const players = await repositories.players.findByRoomId(roomId);
    const forceCrisis = Boolean(payload?.forceCrisis);

    // 1. Check Scenario Runner for custom timeline events
    const currentDay = gameState.phase2.currentDay;
    const scenarioEvent = await ScenarioRunner.getDayEvent(currentDay, (room as any)?.scenarioId, repositories);
    if (scenarioEvent?.threatCardId) {
      gameState.phase2.activeThreats = [scenarioEvent.threatCardId];
    }

    // 2. Read persistent deficit tracker
    const existingTracker = (gameState.phase2 as any).deficitTracker || {
      foodZeroDays: 0,
      waterZeroDays: 0,
      airZeroDays: 0,
      moraleZeroDays: 0,
    };

    // 3. Execute 7-step daily simulation loop
    const { updatedGameState, updatedTracker, result } = SimulationEngine.executeDayTick(
      gameState,
      players,
      existingTracker,
      forceCrisis || Boolean(scenarioEvent?.threatCardId)
    );

    // Persist deficit tracker
    (updatedGameState.phase2 as any).deficitTracker = updatedTracker;

    // Persist updated GameState
    await repositories.games.update(roomId, updatedGameState);

    // Persist player stat mutations and casualties
    for (const p of players) {
      await repositories.players.update(p.playerId, {
        stats: p.stats,
        isEliminated: p.isEliminated,
        role: p.role,
        actionPoints: p.actionPoints,
        inventory: p.inventory,
      });
    }

    // Broadcast Day events
    const dayAnnouncement = scenarioEvent?.customNarration
      ? `${scenarioEvent.customNarration} ${result.dayLog.join(' ')}`
      : result.dayLog.join(' ');

    broadcaster.broadcastDayStart(roomId, {
      day: result.day,
      resources: result.resourcesAfter,
      announcement: dayAnnouncement,
    });

    broadcaster.broadcastResourceUpdate(roomId, {
      resources: result.resourcesAfter as any,
      deltas: {
        food: result.resourcesAfter.food - result.resourcesBefore.food,
        water: result.resourcesAfter.water - result.resourcesBefore.water,
        power: result.resourcesAfter.power - result.resourcesBefore.power,
        air: result.resourcesAfter.air - result.resourcesBefore.air,
        morale: result.resourcesAfter.morale - result.resourcesBefore.morale,
      },
      reason: `Конец дня ${result.day}`,
    });

    // Check Win/Loss Game Over
    if (result.gameEndStatus.isGameOver) {
      const isVictory = result.gameEndStatus.outcome === 'VICTORY';
      const questResults = QuestEvaluator.evaluateAllQuests(players, updatedGameState, isVictory);

      broadcaster.broadcastGameOver(roomId, {
        outcome: result.gameEndStatus.outcome!,
        reason: result.gameEndStatus.reason!,
        daysSurvived: result.gameEndStatus.daysSurvived,
        survivors: result.gameEndStatus.survivors,
        questLeaderboard: questResults.map((q) => ({
          playerId: q.playerId,
          questName: q.questName,
          fulfilled: q.fulfilled,
          scoreBonus: q.scoreBonus,
        })),
      });

      await repositories.rooms.updateStatus(roomId, 'ended');
    }

    return {
      success: true,
      day: result.day,
      resources: result.resourcesAfter,
      isGameOver: result.gameEndStatus.isGameOver,
      outcome: result.gameEndStatus.outcome,
      log: result.dayLog,
      deficitTracker: updatedTracker,
    };
  }
}
