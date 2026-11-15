import { describe, it, expect } from 'vitest';
import {
  dealInitialCards,
  executeMulliganReroll,
  APEconomy,
  AbilityRegistry,
  resolvePickpocketMiniGame,
  VotingEngine,
  ExileDraftEngine,
} from '../../../src/engine/phase1/index.js';
import { IPlayerDocument } from '../../../src/db/repositories/player.repository.js';

function createMockPlayer(id: string, nick: string): IPlayerDocument {
  return {
    playerId: id,
    roomId: 'TEST_ROOM',
    nickname: nick,
    avatarSeed: 'seed_1',
    isHost: false,
    role: 'player',
    token: `token_${id}`,
    remainingRerolls: 1,
    isConnected: true,
    isEliminated: false,
    isInBunker: false,
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

describe('Unit: Phase 1 Selection Engine', () => {
  describe('Card Dealer & Invariants', () => {
    it('strictly enforces capacity K = floor(N/2) and rounds R = ceil(N/2) for 4 <= N <= 20', () => {
      const testCases = [
        { n: 4, expectedK: 2, expectedR: 2 },
        { n: 5, expectedK: 2, expectedR: 3 },
        { n: 6, expectedK: 3, expectedR: 3 },
        { n: 7, expectedK: 3, expectedR: 4 },
        { n: 10, expectedK: 5, expectedR: 5 },
        { n: 11, expectedK: 5, expectedR: 6 },
        { n: 20, expectedK: 10, expectedR: 10 },
      ];

      for (const tc of testCases) {
        const players = Array.from({ length: tc.n }, (_, i) => createMockPlayer(`p_${i}`, `Player_${i}`));
        const deal = dealInitialCards(players);
        expect(deal.targetCapacityK).toBe(tc.expectedK);
        expect(deal.eliminationRoundsTotal).toBe(tc.expectedR);
        expect(deal.playerHands.size).toBe(tc.n);
      }
    });

    it('rejects player counts outside [2..20]', () => {
      const p1 = [createMockPlayer('p1', 'P1')];
      expect(() => dealInitialCards(p1)).toThrow(/Invalid player count/);

      const p21 = Array.from({ length: 21 }, (_, i) => createMockPlayer(`p_${i}`, `P_${i}`));
      expect(() => dealInitialCards(p21)).toThrow(/Invalid player count/);
    });

    it('enforces origin tags on all dealt cards', () => {
      const players = Array.from({ length: 4 }, (_, i) => createMockPlayer(`p_${i}`, `P_${i}`));
      const deal = dealInitialCards(players);

      expect(['BASE', 'ALPHA', 'EXPANSION', 'NEW']).toContain(deal.catastrophe.originTag);
      expect(['BASE', 'ALPHA', 'EXPANSION', 'NEW']).toContain(deal.bunkerArchetype.originTag);

      for (const hand of deal.playerHands.values()) {
        for (const card of Object.values(hand.cards)) {
          expect(['BASE', 'ALPHA', 'EXPANSION', 'NEW']).toContain(card.originTag);
        }
      }
    });

    it('respects lobby deck toggles (enableSuperpowers, enablePhobias, enableCharacter)', () => {
      const players = Array.from({ length: 4 }, (_, i) => createMockPlayer(`p_${i}`, `P_${i}`));

      // Default: superpowers disabled
      const dealDefault = dealInitialCards(players, { enableSuperpowers: false });
      for (const hand of dealDefault.playerHands.values()) {
        expect(hand.cards.superpower).toBeUndefined();
        expect(hand.cards.phobia).toBeDefined();
        expect(hand.cards.character).toBeDefined();
      }

      // Party mode: superpowers enabled
      const dealParty = dealInitialCards(players, {
        enableSuperpowers: true,
        enablePhobias: false,
        enableCharacter: false,
      });
      for (const hand of dealParty.playerHands.values()) {
        expect(hand.cards.superpower).toBeDefined();
        expect(hand.cards.phobia).toBeUndefined();
        expect(hand.cards.character).toBeUndefined();
      }
    });

    it('executes mulligan reroll within limit and decrements remaining rerolls', () => {
      const player = createMockPlayer('p_reroll', 'RerollingPlayer');
      player.remainingRerolls = 1;

      const freshHand = executeMulliganReroll(player);
      expect(freshHand.cards.profession).toBeDefined();
      expect(freshHand.inventory.length).toBeGreaterThan(0);

      player.remainingRerolls = 0;
      expect(() => executeMulliganReroll(player)).toThrow('NO_REROLLS_LEFT');
    });
  });

  describe('AP Economy & Reveals', () => {
    it('refreshes AP to 3 per round non-accumulatively', () => {
      const player = createMockPlayer('p1', 'Player1');
      player.actionPoints = 1; // 1 left from previous round

      APEconomy.refreshRoundAP(player);
      expect(player.actionPoints).toBe(3); // does not accumulate to 4
    });

    it('spends AP and throws INSUFFICIENT_AP when cost exceeds balance', () => {
      const player = createMockPlayer('p1', 'Player1');
      player.actionPoints = 2;

      APEconomy.spendAP(player, 2);
      expect(player.actionPoints).toBe(0);

      expect(() => APEconomy.spendAP(player, 1)).toThrow(/Insufficient Action Points/);
    });

    it('enforces mandatory reveal schedule at 0 AP and voluntary reveals at 1 AP', () => {
      // Round 1: Profession mandatory -> 0 AP
      expect(APEconomy.getRevealCost('profession', 1, false)).toBe(0);
      // Round 1: Health voluntary -> 1 AP
      expect(APEconomy.getRevealCost('health', 1, true)).toBe(1);
      // Round 2: Biology mandatory -> 0 AP
      expect(APEconomy.getRevealCost('biology_age', 2, false)).toBe(0);
      // Secret quests can NEVER be revealed
      expect(() => APEconomy.getRevealCost('special_condition', 1, false)).toThrow(/Secret quests can never be revealed/);
    });
  });

  describe('Profession Abilities & Pickpocket Mini-Game', () => {
    it('executes Doctor inspection and reveals target health card', async () => {
      const doctor = createMockPlayer('p_doc', 'Doctor');
      doctor.actionPoints = 3;
      doctor.abilities = [
        { abilityId: 'prof_doctor', name: 'Медицинский осмотр', actionPoints: 1, cooldownRemaining: 0, usesRemaining: 999 },
      ];

      const target = createMockPlayer('p_target', 'Target');
      target.cards = {
        health: { cardId: 'health_asthma', isRevealed: false },
      };

      const result = await AbilityRegistry.execute('prof_doctor', {
        roomId: 'ROOM_1',
        sourcePlayer: doctor,
        targetPlayer: target,
        gameState: { roomId: 'ROOM_1', phase: 'phase1', updatedAt: new Date() },
      });

      expect(result.success).toBe(true);
      expect(doctor.actionPoints).toBe(2);
      expect(target.cards.health.isRevealed).toBe(true);
    });

    it('executes Paramedic emergency shield', async () => {
      const paramedic = createMockPlayer('p_med', 'Medic');
      paramedic.actionPoints = 3;

      const result = await AbilityRegistry.execute('prof_paramedic', {
        roomId: 'ROOM_1',
        sourcePlayer: paramedic,
        targetPlayer: paramedic,
        gameState: { roomId: 'ROOM_1', phase: 'phase1', updatedAt: new Date() },
      });

      expect(result.success).toBe(true);
      expect(result.shieldedPlayerId).toBe('p_med');
    });

    it('resolves pickpocket mini-game tiers (5/5 clean, 3-4/5 alert, <3/5 fail)', () => {
      const thief = createMockPlayer('p_thief', 'Thief');
      thief.actionPoints = 3;
      const victim = createMockPlayer('p_victim', 'Victim');
      victim.inventory = [{ itemId: 'item_gold_watch', name: 'Золотые часы', weight: 1, quantity: 1 }];

      // Tier 1: 5/5 hits clean theft
      const res5 = resolvePickpocketMiniGame({
        score: 5,
        sourcePlayer: thief,
        targetPlayer: victim,
        targetItemId: 'item_gold_watch',
      });
      expect(res5.cleanTheft).toBe(true);
      expect(res5.thiefRevealed).toBe(false);
      expect(thief.inventory.some((i) => i.itemId === 'item_gold_watch')).toBe(true);

      // Return item for next test
      victim.inventory = [{ itemId: 'item_lighter', name: 'Зажигалка', weight: 1, quantity: 1 }];

      // Tier 2: 3/5 hits theft with alert
      const res3 = resolvePickpocketMiniGame({
        score: 3,
        sourcePlayer: thief,
        targetPlayer: victim,
        targetItemId: 'item_lighter',
      });
      expect(res3.cleanTheft).toBe(false);
      expect(res3.alertTriggered).toBe(true);
      expect(res3.thiefRevealed).toBe(false);

      // Tier 3: <3 hits failure with thief revealed and -1 AP penalty
      victim.inventory = [{ itemId: 'item_knife', name: 'Нож', weight: 1, quantity: 1 }];
      thief.actionPoints = 2;

      const res2 = resolvePickpocketMiniGame({
        score: 2,
        sourcePlayer: thief,
        targetPlayer: victim,
        targetItemId: 'item_knife',
      });
      expect(res2.success).toBe(false);
      expect(res2.thiefRevealed).toBe(true);
      expect(thief.actionPoints).toBe(1); // -1 AP penalty
    });
  });

  describe('Voting Engine & Candidate Veto', () => {
    it('strictly forbids self-voting', () => {
      const session = VotingEngine.createSession(['p1', 'p2', 'p3'], 60);
      const voter1 = createMockPlayer('p1', 'P1');

      expect(() => VotingEngine.castVote(session, voter1, 'p1')).toThrow(
        /strictly forbidden from voting for themselves/
      );
    });

    it('enforces candidate veto for 2 AP and forbids it in final round', () => {
      const session = VotingEngine.createSession(['p1', 'p2', 'p3', 'p4'], 60);
      const player1 = createMockPlayer('p1', 'P1');
      player1.actionPoints = 3;

      // 4 survivors, target capacity K = 2. Not final round (final round would have 3 survivors)
      VotingEngine.activateCandidateVeto(session, player1, 4, 2);
      expect(player1.actionPoints).toBe(1); // 3 - 2 = 1 AP
      expect(session.vetoedPlayerIds).toContain('p1');
      expect(session.nominees).not.toContain('p1');

      // Final round attempt: survivors = 3, target K = 2 -> survivors <= K + 1
      const player2 = createMockPlayer('p2', 'P2');
      player2.actionPoints = 3;
      expect(() => VotingEngine.activateCandidateVeto(session, player2, 3, 2)).toThrow(
        /cannot be invoked in the final elimination round/
      );
    });

    it('resolves simple majority, triggers revote on first tie, and coin toss on revote tie', () => {
      // 1. Simple majority
      const session1 = VotingEngine.createSession(['p1', 'p2', 'p3'], 60);
      session1.ballots = { v1: 'p2', v2: 'p2', v3: 'p3' };
      const tally1 = VotingEngine.tally(session1);
      expect(tally1.eliminatedNomineeId).toBe('p2');
      expect(tally1.isTie).toBe(false);

      // 2. First tie: needs revote
      const sessionTie1 = VotingEngine.createSession(['p1', 'p2', 'p3'], 60);
      sessionTie1.ballots = { v1: 'p1', v2: 'p2' };
      const tallyTie1 = VotingEngine.tally(sessionTie1);
      expect(tallyTie1.isTie).toBe(true);
      expect(tallyTie1.needsRevote).toBe(true);
      expect(tallyTie1.eliminatedNomineeId).toBeNull();

      // 3. Second tie in revote round: resolved by coin toss
      const sessionRevoteTie = VotingEngine.createSession(['p1', 'p2'], 60, true, ['p1', 'p2']);
      sessionRevoteTie.ballots = { v1: 'p1', v2: 'p2' };
      const tallyRevote = VotingEngine.tally(sessionRevoteTie);
      expect(tallyRevote.isTie).toBe(true);
      expect(tallyRevote.needsRevote).toBe(false);
      expect(tallyRevote.resolvedByCoinToss).toBe(true);
      expect(['p1', 'p2']).toContain(tallyRevote.eliminatedNomineeId);
    });
  });

  describe('Exile & Loot Draft', () => {
    it('executes exile sequence, reveals non-secret cards, and drafts items', () => {
      const exiled = createMockPlayer('p_exile', 'ExiledGuy');
      exiled.cards = {
        profession: { cardId: 'prof_mechanic', isRevealed: false },
        health: { cardId: 'health_cold', isRevealed: false },
        special_condition: { cardId: 'sc_01_patient_zero', isRevealed: false, isSecret: true },
      };
      exiled.inventory = [{ itemId: 'item_crowbar', name: 'Монтировка', weight: 2, quantity: 1 }];

      const { exiledCards, availableLoot } = ExileDraftEngine.executeExileSequence(exiled);
      expect(exiled.isEliminated).toBe(true);
      expect(exiled.role).toBe('spectator');
      expect(exiledCards.profession.isRevealed).toBe(true);
      expect(exiledCards.health.isRevealed).toBe(true);
      expect(exiledCards.special_condition.isRevealed).toBe(false); // Secret quest stays unrevealed!
      expect(availableLoot.length).toBe(1);

      // Survivor drafts item
      const survivor = createMockPlayer('p_surv', 'Survivor');
      const draftSession = ExileDraftEngine.createDraftSession(exiled.playerId, availableLoot, [survivor.playerId]);

      const drafted = ExileDraftEngine.draftItem(draftSession, survivor, 'item_crowbar');
      expect(drafted.itemId).toBe('item_crowbar');
      expect(survivor.inventory.some((i) => i.itemId === 'item_crowbar')).toBe(true);
      expect(draftSession.items.length).toBe(0);
    });
  });
});
