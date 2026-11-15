import { describe, it, expect } from 'vitest';
import {
  ResourceManager,
  WorkstationManager,
  CraftingEngine,
  CrisisResolver,
  SaboteurEngine,
  VictoryEvaluator,
  QuestEvaluator,
  SimulationEngine,
} from '../../../src/engine/phase2/index.js';
import { IPlayerDocument } from '../../../src/db/repositories/player.repository.js';
import { IGameStateDocument } from '@bunker/shared';

function createMockPlayer(id: string, nick: string): IPlayerDocument {
  return {
    playerId: id,
    roomId: 'TEST_ROOM_P2',
    nickname: nick,
    avatarSeed: 'seed_p2',
    isHost: false,
    role: 'player',
    token: `token_${id}`,
    remainingRerolls: 0,
    isConnected: true,
    isEliminated: false,
    isInBunker: true,
    actionPoints: 3,
    cards: {},
    stats: { health: 100, morale: 100, energy: 100 },
    inventory: [],
    abilities: [],
    secretQuests: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('Unit: Phase 2 Survival Simulation Engine', () => {
  describe('Resource Management & Deficits', () => {
    it('calculates daily per-capita consumption and applies deltas', () => {
      const { consumption, deltas } = ResourceManager.calculateDailyConsumption(4, 2);
      expect(consumption.food).toBe(4.0);
      expect(consumption.water).toBe(6.0);
      expect(consumption.power).toBe(4.0);

      const initial = { food: 20, water: 20, air: 100, medicine: 10, power: 20, morale: 50 };
      const { updated } = ResourceManager.applyDeltas(initial, deltas);
      expect(updated.food).toBe(16.0);
      expect(updated.water).toBe(14.0);
      expect(updated.power).toBe(16.0);
    });

    it('triggers deficit penalties for zero food, zero water, and zero air', () => {
      // 1. Food zero for 3 days -> starvation casualty
      const trackerFood = { foodZeroDays: 2, waterZeroDays: 0, airZeroDays: 0, moraleZeroDays: 0 };
      const resFoodZero = { food: 0, water: 10, air: 100, medicine: 10, power: 10, morale: 50 };
      const evalFood = ResourceManager.evaluateDeficits(resFoodZero, trackerFood);
      expect(evalFood.penalties.starvationCasualties).toBe(1);

      // 2. Water zero for 2 days -> dehydration damage
      const trackerWater = { foodZeroDays: 0, waterZeroDays: 1, airZeroDays: 0, moraleZeroDays: 0 };
      const resWaterZero = { food: 10, water: 0, air: 100, medicine: 10, power: 10, morale: 50 };
      const evalWater = ResourceManager.evaluateDeficits(resWaterZero, trackerWater);
      expect(evalWater.penalties.dehydrationDamage).toBe(30);

      // 3. Air zero -> instant air catastrophe
      const resAirZero = { food: 10, water: 10, air: 0, medicine: 10, power: 10, morale: 50 };
      const evalAir = ResourceManager.evaluateDeficits(resAirZero, { foodZeroDays: 0, waterZeroDays: 0, airZeroDays: 0, moraleZeroDays: 0 });
      expect(evalAir.penalties.airCatastrophe).toBe(true);
    });
  });

  describe('Workstations & 16 Bunker Rooms', () => {
    it('produces resources based on worker assignments', () => {
      const p1 = createMockPlayer('p1', 'Farmer');
      p1.cards = { profession: { cardId: 'prof_agronomist' } };
      const p2 = createMockPlayer('p2', 'Engineer');
      p2.cards = { profession: { cardId: 'prof_engineer' } };

      const assignments = {
        p1: 'room_02_hydroponics_bay',
        p2: 'room_03_generator_core',
      };

      const yields = WorkstationManager.calculateDailyRoomYields(assignments, [p1, p2]);
      expect(yields.resourceDeltas.food).toBe(4); // 3 base + 1 Agronomist bonus
      expect(yields.resourceDeltas.power).toBe(12); // 10 base + 2 Engineer bonus
    });
  });

  describe('Crafting Engine (20 Recipes)', () => {
    it('validates required ingredients, removes them from inventory, and completes craft in 1 day', () => {
      const crafter = createMockPlayer('p_crafter', 'Crafter');
      crafter.inventory = [
        { itemId: 'item_medkit_car', name: 'Автоаптечка', weight: 1, quantity: 1 },
        { itemId: 'item_antibiotics', name: 'Антибиотики', weight: 1, quantity: 1 },
      ];

      // Queue craft_adv_medkit
      const queued = CraftingEngine.queueRecipe(crafter, 'craft_adv_medkit');
      expect(queued.recipeId).toBe('craft_adv_medkit');
      expect(queued.daysRemaining).toBe(1);
      // Ingredients removed from crafter inventory
      expect(crafter.inventory.length).toBe(0);

      // Advance craft queue 1 day
      const { updatedQueue, completedItems } = CraftingEngine.processQueueTick([queued], [crafter]);
      expect(updatedQueue.length).toBe(0);
      expect(completedItems.length).toBe(1);
      expect(crafter.inventory.length).toBe(1);
      expect(crafter.inventory[0].name).toBe('Расширенная медсумка');
    });

    it('rejects crafting when ingredients are missing', () => {
      const crafter = createMockPlayer('p_crafter', 'Crafter');
      crafter.inventory = [{ itemId: 'item_medkit_car', name: 'Автоаптечка', weight: 1, quantity: 1 }];

      expect(() => CraftingEngine.queueRecipe(crafter, 'craft_adv_medkit')).toThrow(/Missing required item/);
    });
  });

  describe('Crisis Resolver & Specialist Counters', () => {
    it('neutralizes threat with 0 penalty when matching specialist is alive in bunker', () => {
      const doctor = createMockPlayer('p_doc', 'Doctor');
      doctor.cards = { profession: { cardId: 'prof_doctor', name: 'Врач' } };

      const mockThreat = {
        cardId: 'threat_epidemic',
        category: 'threat',
        originTag: 'BASE',
        name: 'Эпидемия',
        nameEn: 'Epidemic',
        description: 'Опасный вирус',
        metadata: {
          counterSpecialists: ['prof_doctor', 'prof_surgeon'],
          mechanicalPenalty: { foodDamage: 5, hpDamage: 20 },
        },
      } as any;

      const resolution = CrisisResolver.resolveThreat(mockThreat, [doctor]);
      expect(resolution.countered).toBe(true);
      expect(resolution.hpDamage).toBe(0);
      expect(Object.keys(resolution.resourceDamage).length).toBe(0);
    });

    it('applies full mechanical damage when no counter specialist exists', () => {
      const artist = createMockPlayer('p_art', 'Artist');
      artist.cards = { profession: { cardId: 'prof_artist' } };

      const mockThreat = {
        cardId: 'threat_fire',
        category: 'threat',
        originTag: 'BASE',
        name: 'Пожар',
        nameEn: 'Fire',
        description: 'Возгорание',
        metadata: {
          counterSpecialists: ['prof_firefighter'],
          mechanicalPenalty: { powerDamage: 5, hpDamage: 15 },
        },
      } as any;

      const resolution = CrisisResolver.resolveThreat(mockThreat, [artist]);
      expect(resolution.countered).toBe(false);
      expect(resolution.hpDamage).toBe(15);
      expect(resolution.resourceDamage.power).toBe(-5);
    });
  });

  describe('Saboteur & Traitor Mechanics', () => {
    it('only assigns saboteurs when K >= 6 and traitor enabled', () => {
      // 5 survivors -> no saboteur
      const p5 = Array.from({ length: 5 }, (_, i) => createMockPlayer(`p_${i}`, `P_${i}`));
      expect(SaboteurEngine.assignSaboteurs(p5, true)).toHaveLength(0);

      // 6 survivors -> 1 saboteur assigned
      const p6 = Array.from({ length: 6 }, (_, i) => createMockPlayer(`p_${i}`, `P_${i}`));
      const s6 = SaboteurEngine.assignSaboteurs(p6, true);
      expect(s6).toHaveLength(1);
    });

    it('executes covert sabotage actions and resolves accusations', () => {
      const saboteur = createMockPlayer('p_sab', 'Saboteur');
      saboteur.cards = { saboteur: { isSaboteur: true } };
      saboteur.actionPoints = 3;

      const victim = createMockPlayer('p_vic', 'Victim');

      const sabotageRes = SaboteurEngine.executeSabotage(saboteur, 'SABOTAGE_WATER', [victim]);
      expect(sabotageRes.success).toBe(true);
      expect(sabotageRes.resourceDeltas.water).toBe(-3);
      expect(saboteur.actionPoints).toBe(1); // 3 - 2 = 1 AP

      // Accusation: guilty
      const accGuilty = SaboteurEngine.resolveAccusation(saboteur, true);
      expect(accGuilty.accusedWasSaboteur).toBe(true);
      expect(saboteur.isEliminated).toBe(true);

      // Accusation: innocent
      const accInnocent = SaboteurEngine.resolveAccusation(victim, true);
      expect(accInnocent.accusedWasSaboteur).toBe(false);
      expect(accInnocent.penaltyApplies).toBe(true);
      expect(accInnocent.moraleDelta).toBe(-10);
    });
  });

  describe('Victory and Defeat Evaluator', () => {
    it('evaluates victory on Day 30', () => {
      const p = [createMockPlayer('p1', 'P1')];
      const res = { food: 10, water: 10, air: 100, medicine: 10, power: 10, morale: 50 };
      const tracker = { foodZeroDays: 0, waterZeroDays: 0, airZeroDays: 0, moraleZeroDays: 0 };

      const gameEnd = VictoryEvaluator.evaluateGameEnd(30, res, tracker, p);
      expect(gameEnd.isGameOver).toBe(true);
      expect(gameEnd.outcome).toBe('VICTORY');
    });

    it('evaluates defeat immediately when Air == 0', () => {
      const p = [createMockPlayer('p1', 'P1')];
      const res = { food: 10, water: 10, air: 0, medicine: 10, power: 10, morale: 50 };
      const tracker = { foodZeroDays: 0, waterZeroDays: 0, airZeroDays: 1, moraleZeroDays: 0 };

      const gameEnd = VictoryEvaluator.evaluateGameEnd(5, res, tracker, p);
      expect(gameEnd.isGameOver).toBe(true);
      expect(gameEnd.outcome).toBe('DEFEAT');
      expect(gameEnd.reason).toContain('Air=0');
    });
  });

  describe('7-Step Daily Simulation Loop', () => {
    it('executes the full daily cycle smoothly', () => {
      const p1 = createMockPlayer('p1', 'P1');
      const p2 = createMockPlayer('p2', 'P2');

      const gameState: IGameStateDocument = {
        roomId: 'ROOM_SIM_1',
        phase: 'phase2',
        phase2: {
          currentDay: 1,
          resources: { food: 50, water: 60, air: 100, medicine: 20, power: 50, morale: 75 },
          roomAssignments: { p1: 'room_02_hydroponics_bay', p2: 'room_03_generator_core' },
          activeThreats: [],
          activeDefects: [],
          craftQueue: [],
        },
        updatedAt: new Date(),
      };

      const { updatedGameState, result } = SimulationEngine.executeDayTick(gameState, [p1, p2]);
      expect(result.day).toBe(1);
      expect(updatedGameState.phase2?.currentDay).toBe(2);
      expect(result.resourcesAfter.food).toBeDefined();
      expect(result.dayLog.length).toBeGreaterThan(0);
    });
  });
});
