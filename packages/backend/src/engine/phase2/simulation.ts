import { IPlayerDocument } from '../../db/repositories/player.repository.js';
import { IGameStateDocument } from '@bunker/shared';
import { IBunkerResources, IResourceDeficitTracker, ResourceManager } from './resource-manager.js';
import { WorkstationManager } from './workstation-manager.js';
import { CraftingEngine, ICraftQueueItem } from './crafting-engine.js';
import { CrisisResolver, ICrisisResolutionResult } from './crisis-resolver.js';
import { VictoryEvaluator, IGameEndStatus } from './victory-evaluator.js';
import { APEconomy } from '../phase1/ap-economy.js';

export interface IDaySimulationResult {
  day: number;
  resourcesBefore: IBunkerResources;
  resourcesAfter: IBunkerResources;
  crisisResult?: ICrisisResolutionResult;
  completedCrafts: any[];
  gameEndStatus: IGameEndStatus;
  casualtyPlayerIds: string[];
  dayLog: string[];
}

export class SimulationEngine {
  public static executeDayTick(
    gameState: IGameStateDocument,
    survivors: IPlayerDocument[],
    deficitTracker: IResourceDeficitTracker = { foodZeroDays: 0, waterZeroDays: 0, airZeroDays: 0, moraleZeroDays: 0 },
    forceCrisis = false
  ): {
    updatedGameState: IGameStateDocument;
    updatedTracker: IResourceDeficitTracker;
    result: IDaySimulationResult;
  } {
    const day = gameState.phase2?.currentDay ?? 1;
    const currentResources: IBunkerResources = gameState.phase2?.resources ?? {
      food: 50,
      water: 60,
      air: 100,
      medicine: 20,
      power: 50,
      morale: 75,
    };

    const resourcesBefore: IBunkerResources = { ...currentResources };
    const dayLog: string[] = [`День ${day} начался.`];
    const casualtyPlayerIds: string[] = [];

    const aliveSurvivors = survivors.filter((s) => !s.isEliminated);
    const roomAssignments = gameState.phase2?.roomAssignments ?? {};

    // -------------------------------------------------------------
    // Step 1: Production (Workstation Rooms)
    // -------------------------------------------------------------
    const roomYields = WorkstationManager.calculateDailyRoomYields(roomAssignments, aliveSurvivors);
    let workingResources = ResourceManager.applyDeltas(currentResources, roomYields.resourceDeltas).updated;
    dayLog.push('Производственные модули завершили дневной цикл.');

    // -------------------------------------------------------------
    // Step 2: Events & Crises
    // -------------------------------------------------------------
    let crisisResult: ICrisisResolutionResult | undefined;
    if (CrisisResolver.shouldTriggerDailyCrisis(forceCrisis)) {
      const threat = CrisisResolver.rollThreat();
      crisisResult = CrisisResolver.resolveThreat(threat, aliveSurvivors);
      dayLog.push(crisisResult.message);

      if (!crisisResult.countered) {
        workingResources = ResourceManager.applyDeltas(workingResources, crisisResult.resourceDamage).updated;
        // Apply HP damage to survivors
        for (const s of aliveSurvivors) {
          s.stats.health = Math.max(0, s.stats.health - crisisResult.hpDamage);
          if (s.stats.health <= 0) {
            s.isEliminated = true;
            s.role = 'spectator';
            casualtyPlayerIds.push(s.playerId);
            dayLog.push(`${s.nickname} погиб в результате чрезвычайного происшествия!`);
          }
        }
      }
    }

    // -------------------------------------------------------------
    // Step 3: Consumption
    // -------------------------------------------------------------
    const activeAlive = aliveSurvivors.filter((s) => !s.isEliminated);
    const { deltas: consumptionDeltas } = ResourceManager.calculateDailyConsumption(
      activeAlive.length,
      2, // active room power draw
      { isVentilationOnline: roomYields.isVentilationActive }
    );

    workingResources = ResourceManager.applyDeltas(workingResources, consumptionDeltas).updated;
    dayLog.push(`Расход ресурсов на ${activeAlive.length} выживших учтен.`);

    // -------------------------------------------------------------
    // Step 4: Health & Deficits
    // -------------------------------------------------------------
    const { updatedTracker, penalties } = ResourceManager.evaluateDeficits(workingResources, deficitTracker);

    if (penalties.starvationCasualties > 0 && activeAlive.length > 0) {
      const victim = activeAlive[Math.floor(Math.random() * activeAlive.length)];
      victim.isEliminated = true;
      victim.role = 'spectator';
      casualtyPlayerIds.push(victim.playerId);
      dayLog.push(`${victim.nickname} скончался от истощения (нехватка еды).`);
    }

    if (penalties.dehydrationDamage > 0) {
      for (const s of activeAlive) {
        s.stats.health = Math.max(0, s.stats.health - penalties.dehydrationDamage);
        if (s.stats.health <= 0) {
          s.isEliminated = true;
          s.role = 'spectator';
          casualtyPlayerIds.push(s.playerId);
          dayLog.push(`${s.nickname} погиб от обезвоживания.`);
        }
      }
    }

    // Healing for resting / medbay survivors
    for (const pid of roomYields.healingPlayerIds) {
      const p = activeAlive.find((s) => s.playerId === pid);
      if (p && !p.isEliminated) {
        p.stats.health = Math.min(100, p.stats.health + 5);
      }
    }

    // -------------------------------------------------------------
    // Step 5: Craft Queue
    // -------------------------------------------------------------
    const currentQueue: ICraftQueueItem[] = gameState.phase2?.craftQueue ?? [];
    const { updatedQueue, completedItems } = CraftingEngine.processQueueTick(currentQueue, aliveSurvivors);
    for (const c of completedItems) {
      dayLog.push(`Мастерская: завершено изготовление предмета "${c.outputName}".`);
    }

    // -------------------------------------------------------------
    // Step 6: Win / Loss Check
    // -------------------------------------------------------------
    const gameEndStatus = VictoryEvaluator.evaluateGameEnd(
      day,
      workingResources,
      updatedTracker,
      aliveSurvivors,
      roomYields.sosProgress >= 100
    );

    if (gameEndStatus.isGameOver) {
      dayLog.push(gameEndStatus.reason || 'Игра завершена.');
    }

    // -------------------------------------------------------------
    // Step 7: Next Day Transition
    // -------------------------------------------------------------
    const nextDay = gameEndStatus.isGameOver ? day : day + 1;

    // Refresh AP for next day
    for (const s of aliveSurvivors) {
      if (!s.isEliminated) {
        APEconomy.refreshRoundAP(s);
      }
    }

    const updatedGameState: IGameStateDocument = {
      ...gameState,
      phase: gameEndStatus.isGameOver ? 'ended' : 'phase2',
      phase2: {
        ...gameState.phase2,
        currentDay: nextDay,
        resources: workingResources,
        roomAssignments: gameState.phase2?.roomAssignments ?? {},
        activeThreats: crisisResult && !crisisResult.countered ? [crisisResult.threat!.cardId] : [],
        activeDefects: gameState.phase2?.activeDefects ?? [],
        craftQueue: updatedQueue,
        deficitTracker: updatedTracker,
        bunkerRoles: (gameState.phase2 as any)?.bunkerRoles,
      } as any,
      updatedAt: new Date(),
    };

    return {
      updatedGameState,
      updatedTracker,
      result: {
        day,
        resourcesBefore,
        resourcesAfter: workingResources,
        crisisResult,
        completedCrafts: completedItems,
        gameEndStatus,
        casualtyPlayerIds,
        dayLog,
      },
    };
  }
}
