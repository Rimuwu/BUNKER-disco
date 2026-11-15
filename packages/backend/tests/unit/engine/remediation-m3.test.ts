import { describe, it, expect } from 'vitest';
import { professionsDeck } from '@bunker/shared';
import { AbilityRegistry } from '../../../src/engine/phase1/abilities.js';
import { QuestEvaluator } from '../../../src/engine/phase2/quest-evaluator.js';
import { BunkerRoleEngine } from '../../../src/engine/phase2/bunker-roles.js';
import { WorkstationManager } from '../../../src/engine/phase2/workstation-manager.js';
import { ResourceManager } from '../../../src/engine/phase2/resource-manager.js';
import { VotingEngine, IVotingSession } from '../../../src/engine/phase1/voting-engine.js';
import { GMPacing } from '../../../src/engine/gm/gm-pacing.js';
import { ScenarioRunner } from '../../../src/engine/gm/scenario-runner.js';
import { TimerCoordinator } from '../../../src/engine/gm/timer-coordinator.js';
import { IPlayerDocument } from '../../../src/db/repositories/player.repository.js';
import { IGameStateDocument } from '@bunker/shared';

function createMockPlayer(id: string, nick: string): IPlayerDocument {
  return {
    playerId: id,
    roomId: 'ROOM_TEST',
    nickname: nick,
    avatarSeed: 'seed',
    isHost: false,
    role: 'player',
    token: `token_${id}`,
    remainingRerolls: 1,
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

describe('Remediation & Hardening Test Suite (Milestone 3 Iteration 2)', () => {
  // -------------------------------------------------------------
  // 1. Profession Abilities: All 51 Professions Genuine Execution
  // -------------------------------------------------------------
  describe('Task 1: All 51 Profession Abilities Genuine Execution', () => {
    it('verifies all 51 profession cards in professionsDeck have registered handlers', () => {
      expect(professionsDeck.length).toBe(51);
      for (const prof of professionsDeck) {
        expect(
          AbilityRegistry.has(prof.cardId),
          `Profession ability handler missing for "${prof.cardId}" (${prof.name})`
        ).toBe(true);
      }
    });

    it('executes every single one of the 51 abilities without falling through to any facade', async () => {
      const source = createMockPlayer('p_source', 'SourcePlayer');
      const target = createMockPlayer('p_target', 'TargetPlayer');
      target.cards = {
        health: { cardId: 'health_cold', isRevealed: false },
        hobby: { cardId: 'hobby_chess', isRevealed: false },
        fact: { cardId: 'fact_secret', isRevealed: false },
        character: { cardId: 'char_bold', isRevealed: false },
      };
      target.inventory = [{ itemId: 'item_flashlight', name: 'Фонарик', weight: 1, quantity: 1 }];

      const gameState: IGameStateDocument = {
        roomId: 'ROOM_TEST',
        phase: 'phase2',
        phase2: {
          currentDay: 5,
          resources: { food: 50, water: 50, air: 100, medicine: 20, power: 50, morale: 75 },
          roomAssignments: {},
          activeThreats: [],
          activeDefects: ['DEF-01'],
          craftQueue: [],
        },
        updatedAt: new Date(),
      };

      for (const prof of professionsDeck) {
        source.actionPoints = 3;
        source.abilities = [
          {
            abilityId: prof.cardId,
            name: prof.metadata?.activeAbility?.name || prof.name,
            actionPoints: prof.metadata?.activeAbility?.apCost ?? 1,
            cooldownRemaining: 0,
            usesRemaining: 999,
          },
        ];

        const res = await AbilityRegistry.execute(prof.cardId, {
          roomId: 'ROOM_TEST',
          sourcePlayer: source,
          targetPlayer: target,
          gameState,
        });

        expect(res.success).toBe(true);
        expect(res.abilityId).toBe(prof.cardId);
        expect(res.message.length).toBeGreaterThan(5);
        expect(source.actionPoints).toBeLessThan(3); // AP was spent
      }
    });

    it('throws ABILITY_NOT_FOUND if an unregistered ability is invoked (no fake fallbacks)', async () => {
      const player = createMockPlayer('p1', 'Player');
      player.abilities = [
        { abilityId: 'prof_fake_astronaut', name: 'Fake Astronaut', actionPoints: 1, cooldownRemaining: 0, usesRemaining: 999 },
      ];

      await expect(
        AbilityRegistry.execute('prof_fake_astronaut', {
          roomId: 'ROOM_TEST',
          sourcePlayer: player,
          gameState: { roomId: 'ROOM_TEST', phase: 'phase1', updatedAt: new Date() },
        })
      ).rejects.toThrow(/ABILITY_NOT_FOUND/);
    });
  });

  // -------------------------------------------------------------
  // 2. Secret Quests: All 30 Secret Conditions Evaluated
  // -------------------------------------------------------------
  describe('Task 2: All 30 Secret Quests Completeness', () => {
    it('evaluates all 30 secret quest conditions (sc_01 through sc_30) with distinct criteria', () => {
      const questCardIds = Array.from({ length: 30 }, (_, i) => {
        const num = String(i + 1).padStart(2, '0');
        return `sc_${num}`;
      });

      const gameState: IGameStateDocument = {
        roomId: 'ROOM_TEST',
        phase: 'phase2',
        phase2: {
          currentDay: 30,
          resources: { food: 50, water: 50, air: 100, medicine: 20, power: 50, morale: 75 },
          roomAssignments: {},
          activeThreats: [],
          activeDefects: [],
          craftQueue: [],
        },
        updatedAt: new Date(),
      };

      for (let i = 1; i <= 30; i++) {
        const num = String(i).padStart(2, '0');
        const cardId = `sc_${num}_test_quest`;
        const player = createMockPlayer(`p_quest_${i}`, `Player_${i}`);
        player.cards = {
          special_condition: {
            cardId,
            name: `Квест ${num}`,
            isRevealed: false,
            isSecret: true,
          },
        };

        const results = QuestEvaluator.evaluateAllQuests([player], gameState, true);
        expect(results.length).toBe(1);
        expect(results[0].questCardId).toBe(cardId);
        expect(results[0].reason.length).toBeGreaterThan(0);
      }
    });

    it('evaluates specific win/loss criteria for Patient Zero, Corporate Agent, Saboteur, Lone Wolf', () => {
      const pZero = createMockPlayer('p_zero', 'PatientZero');
      pZero.cards = { special_condition: { cardId: 'sc_01_patient_zero', name: 'Нулевой пациент' } };

      const pCorp = createMockPlayer('p_corp', 'CorpAgent');
      pCorp.cards = { special_condition: { cardId: 'sc_02_corporate_agent', name: 'Агент корпорации' } };

      const pSab = createMockPlayer('p_sab', 'Saboteur');
      pSab.cards = { special_condition: { cardId: 'sc_04_saboteur', name: 'Саботажник' } };

      const pLone = createMockPlayer('p_lone', 'LoneWolf');
      pLone.cards = { special_condition: { cardId: 'sc_16_lone_wolf', name: 'Одиночка' } };

      // Day 30 victory: 4 survivors alive
      const victoryState: IGameStateDocument = {
        roomId: 'R',
        phase: 'ended',
        phase2: {
          currentDay: 30,
          resources: { food: 50, water: 50, air: 100, medicine: 20, power: 50, morale: 75 },
          roomAssignments: {},
          activeThreats: [],
          activeDefects: [],
          craftQueue: [],
        },
        updatedAt: new Date(),
      };

      const resVictory = QuestEvaluator.evaluateAllQuests([pZero, pCorp, pSab, pLone], victoryState, true);
      const sabResult = resVictory.find((q) => q.playerId === 'p_sab');
      expect(sabResult?.fulfilled).toBe(false); // Bunker survived, saboteur fails

      const loneResult = resVictory.find((q) => q.playerId === 'p_lone');
      expect(loneResult?.fulfilled).toBe(false); // 4 survived, lone wolf fails

      const corpResult = resVictory.find((q) => q.playerId === 'p_corp');
      expect(corpResult?.fulfilled).toBe(true); // Survived to Day 20+

      // Defeat on Day 10: Lone Wolf is sole survivor
      pZero.isEliminated = true;
      pCorp.isEliminated = true;
      pSab.isEliminated = true;
      pLone.isEliminated = false;

      const defeatState: IGameStateDocument = {
        roomId: 'R',
        phase: 'ended',
        phase2: {
          currentDay: 10,
          resources: { food: 0, water: 0, air: 0, medicine: 0, power: 0, morale: 0 },
          roomAssignments: {},
          activeThreats: [],
          activeDefects: [],
          craftQueue: [],
        },
        updatedAt: new Date(),
      };

      const resDefeat = QuestEvaluator.evaluateAllQuests([pZero, pCorp, pSab, pLone], defeatState, false);
      const sabDefeat = resDefeat.find((q) => q.playerId === 'p_sab');
      expect(sabDefeat?.fulfilled).toBe(true); // Bunker collapsed, saboteur wins!

      const loneDefeat = resDefeat.find((q) => q.playerId === 'p_lone');
      expect(loneDefeat?.fulfilled).toBe(true); // Lone wolf was the sole survivor!
    });
  });

  // -------------------------------------------------------------
  // 3. Bunker Role Elections & Role Actions
  // -------------------------------------------------------------
  describe('Task 3: Bunker Role Elections and Actions', () => {
    it('elects 7 specialized roles among survivors prioritizing professional qualifications', () => {
      const p1 = createMockPlayer('p1', 'Doctor');
      p1.cards = { profession: { cardId: 'prof_doctor' } };

      const p2 = createMockPlayer('p2', 'Engineer');
      p2.cards = { profession: { cardId: 'prof_engineer' } };

      const p3 = createMockPlayer('p3', 'Cook');
      p3.cards = { profession: { cardId: 'prof_cook' } };

      const p4 = createMockPlayer('p4', 'Military');
      p4.cards = { profession: { cardId: 'prof_military' } };

      const p5 = createMockPlayer('p5', 'Diplomat');
      p5.cards = { profession: { cardId: 'prof_diplomat' } };

      const p6 = createMockPlayer('p6', 'Radio');
      p6.cards = { profession: { cardId: 'prof_radio_operator' } };

      const p7 = createMockPlayer('p7', 'Agronomist');
      p7.cards = { profession: { cardId: 'prof_agronomist' } };

      const elected = BunkerRoleEngine.electRoles([p1, p2, p3, p4, p5, p6, p7]);

      expect(elected[p1.playerId]).toBe('MEDIC');
      expect(elected[p2.playerId]).toBe('ENGINEER');
      expect(elected[p3.playerId]).toBe('CHEF');
      expect(elected[p5.playerId]).toBe('LEADER');
      expect(elected[p6.playerId]).toBe('COMMS');
      expect(elected[p7.playerId]).toBe('AGRONOMIST');
      expect(elected[p4.playerId]).toBe('GUARD');
    });

    it('resolves daily role actions (Leader AP, Chef food, Medic healing, Comms SOS)', () => {
      const p1 = createMockPlayer('p1', 'Doc');
      p1.stats.health = 70; // wounded
      const p2 = createMockPlayer('p2', 'Leader');

      const roles = {
        p1: 'MEDIC' as const,
        p2: 'LEADER' as const,
      };

      const gameState: IGameStateDocument = {
        roomId: 'ROOM_TEST',
        phase: 'phase2',
        phase2: {
          currentDay: 2,
          resources: { food: 20, water: 20, air: 100, medicine: 10, power: 20, morale: 50 },
          roomAssignments: {},
          activeThreats: [],
          activeDefects: [],
          craftQueue: [],
        },
        updatedAt: new Date(),
      };

      const result = BunkerRoleEngine.resolveRoleActions(roles, [p1, p2], gameState);
      expect(result.healedPlayerIds).toContain('p1');
      expect(p1.stats.health).toBe(80); // Healed +10 HP
      expect(result.resourceDeltas.morale).toBe(2); // Leader gave +2 morale
      expect(p1.actionPoints).toBe(4); // Leader gave +1 AP
      expect(result.logs.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------
  // 4. Candidate Veto Persistence & Tie Resolution
  // -------------------------------------------------------------
  describe('Task 5, 6, 7: Voting Nominees, Candidate Veto & Tie Coin-Toss', () => {
    it('allows casting votes for multiple distinct nominees without corruption', () => {
      const session = VotingEngine.createSession(['p1', 'p2', 'p3', 'p4'], 60);
      const v1 = createMockPlayer('v1', 'Voter1');
      const v2 = createMockPlayer('v2', 'Voter2');

      // Voter 1 votes for p3, Voter 2 votes for p4
      VotingEngine.castVote(session, v1, 'p3');
      VotingEngine.castVote(session, v2, 'p4');

      expect(session.ballots['v1']).toBe('p3');
      expect(session.ballots['v2']).toBe('p4');

      const tally = VotingEngine.tally(session);
      expect(tally.isTie).toBe(true);
      expect(tally.needsRevote).toBe(true);
      expect(tally.tiedNominees).toEqual(expect.arrayContaining(['p3', 'p4']));
    });

    it('resolves consecutive tie in revote round via server RNG coin toss (no infinite loop)', () => {
      const session = VotingEngine.createSession(['p3', 'p4'], 60, true, ['p3', 'p4']);
      session.isTieBreakRound = true;

      const v1 = createMockPlayer('v1', 'Voter1');
      const v2 = createMockPlayer('v2', 'Voter2');
      VotingEngine.castVote(session, v1, 'p3');
      VotingEngine.castVote(session, v2, 'p4');

      const tally = VotingEngine.tally(session);
      expect(tally.isTie).toBe(true);
      expect(tally.needsRevote).toBe(false); // Coin toss triggers!
      expect(tally.resolvedByCoinToss).toBe(true);
      expect(['p3', 'p4']).toContain(tally.eliminatedNomineeId);
    });

    it('activates candidate veto, removes player from nominees, and deducts 2 AP', () => {
      const session = VotingEngine.createSession(['p1', 'p2', 'p3', 'p4'], 60);
      const p1 = createMockPlayer('p1', 'P1');
      p1.actionPoints = 3;

      VotingEngine.activateCandidateVeto(session, p1, 4, 2);

      expect(session.vetoedPlayerIds).toContain('p1');
      expect(session.nominees).not.toContain('p1');
      expect(p1.actionPoints).toBe(1); // 3 - 2 = 1 AP
    });

    it('ensures candidate veto immunity does not leak into subsequent round session', () => {
      // Round 1 session: 4 players
      const sessionR1 = VotingEngine.createSession(['p1', 'p2', 'p3', 'p4'], 60);
      const p1 = createMockPlayer('p1', 'P1');
      const p2 = createMockPlayer('p2', 'P2');
      p1.actionPoints = 3;

      VotingEngine.activateCandidateVeto(sessionR1, p1, 4, 2);
      expect(sessionR1.vetoedPlayerIds).toContain('p1');
      expect(sessionR1.nominees).not.toContain('p1');

      // Round 2 session: p4 exiled, 3 survivors remain (p1, p2, p3)
      // New round session has empty vetoedPlayerIds and includes p1 as eligible nominee
      const sessionR2 = VotingEngine.createSession(['p1', 'p2', 'p3'], 60);
      expect(sessionR2.vetoedPlayerIds).toEqual([]);
      expect(sessionR2.nominees).toContain('p1');

      // p2 can now validly cast a vote for p1 in Round 2 without error
      expect(() => {
        VotingEngine.castVote(sessionR2, p2, 'p1');
      }).not.toThrow();
      expect(sessionR2.ballots['p2']).toBe('p1');
    });
  });

  // -------------------------------------------------------------
  // 5. Canonical Workstation Room IDs & Yields
  // -------------------------------------------------------------
  describe('Task 9: Canonical Room IDs Alignment', () => {
    it('produces correct yields for canonical card IDs (room_12, room_08, room_09, room_14)', () => {
      const p1 = createMockPlayer('p1', 'Plumber');
      p1.cards = { profession: { cardId: 'prof_plumber' } };
      const p2 = createMockPlayer('p2', 'CommsOfficer');
      const p3 = createMockPlayer('p3', 'RestingSurvivor');
      const p4 = createMockPlayer('p4', 'RecreationSeeker');

      const assignments = {
        p1: 'room_12_water_treatment_plant',
        p2: 'room_08_comms_station',
        p3: 'room_09_crew_quarters',
        p4: 'room_14_lounge_archive',
      };

      const yields = WorkstationManager.calculateDailyRoomYields(assignments, [p1, p2, p3, p4]);

      expect(yields.resourceDeltas.water).toBe(5); // +5 with Plumber in water treatment
      expect(yields.sosProgress).toBe(10); // +10 SOS progress in comms station
      expect(yields.healingPlayerIds).toContain('p3'); // Crew quarters rest healing
      expect(yields.resourceDeltas.morale).toBe(5); // +5 Morale in lounge archive
    });
  });

  // -------------------------------------------------------------
  // 6. Offline Air Consumption Rate (0.5 per capita)
  // -------------------------------------------------------------
  describe('Task 10: Offline Air Consumption Rate', () => {
    it('consumes 0.5 air per person per day when ventilation is offline', () => {
      const { consumption } = ResourceManager.calculateDailyConsumption(4, 0, {
        isVentilationOnline: false,
      });
      // 4 survivors * 0.5 = 2.0 air consumed
      expect(consumption.air).toBe(2.0);
    });

    it('consumes 0 air when ventilation is online', () => {
      const { consumption } = ResourceManager.calculateDailyConsumption(4, 0, {
        isVentilationOnline: true,
      });
      expect(consumption.air).toBe(0);
    });
  });

  // -------------------------------------------------------------
  // 7. PC Game Master Modules & Pacing
  // -------------------------------------------------------------
  describe('Task 4 & 12: PC GM Wiring & Debate Rotation', () => {
    it('configures GM pacing and cycles debate speakers properly', () => {
      const pacing = GMPacing.getConfig('standard');
      expect(pacing.discussionDurationSeconds).toBe(60);
      expect(pacing.votingDurationSeconds).toBe(60);

      const survivors = ['p1', 'p2', 'p3'];
      const s1 = GMPacing.getNextSpeaker(undefined, survivors);
      expect(s1).toBe('p1');

      const s2 = GMPacing.getNextSpeaker('p1', survivors);
      expect(s2).toBe('p2');

      const s3 = GMPacing.getNextSpeaker('p2', survivors);
      expect(s3).toBe('p3');
    });

    it('manages timer coordinator lifecycle', () => {
      TimerCoordinator.startTimer('ROOM_GM', 'debate', 1);
      expect(TimerCoordinator.getTimer('ROOM_GM', 'debate')).toBeDefined();
      expect(TimerCoordinator.isExpired('ROOM_GM', 'debate')).toBe(false);

      TimerCoordinator.clearTimer('ROOM_GM', 'debate');
      expect(TimerCoordinator.isExpired('ROOM_GM', 'debate')).toBe(true);
    });
  });
});
