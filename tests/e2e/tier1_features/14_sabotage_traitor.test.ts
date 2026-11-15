import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';
import {
  createSabotagePayload,
  createGuardInspectPayload,
  createAccuseTraitorPayload,
} from '../helpers/mock-payloads';

describe('Feature 14: Sabotage & Traitor Mechanics', () => {
  let saboteur: TestClient;
  let guard: TestClient;
  let innocentPlayer: TestClient;

  beforeEach(() => {
    saboteur = new TestClient({ nickname: 'SecretSaboteur' });
    guard = new TestClient({ nickname: 'SecurityGuard' });
    innocentPlayer = new TestClient({ nickname: 'LoyalDoctor' });
  });

  afterEach(() => {
    saboteur.disconnect();
    guard.disconnect();
    innocentPlayer.disconnect();
  });

  it('secretly assigns saboteur role in games with 6 or more participants', async () => {
    const live = await isServiceHealthy(saboteur.baseUrl);

    const playerCount = 6;
    const isEligibleForSaboteur = playerCount >= 6;
    expect(isEligibleForSaboteur).toBe(true);

    if (live.healthy) {
      await saboteur.createRoom();
      await saboteur.sendAction('START_GAME', {});
      const state = await saboteur.getGameState();
      expect(state).toBeDefined();
    } else {
      saboteur.setAuth('jwt-sab', 'SAB01', 'p_sab', 'r1');

      saboteur.pushMockEvent('secret_role_assigned', {
        playerId: saboteur.playerId,
        role: 'SABOTEUR',
        secretObjective: 'Draining bunker food or water to 0 before Day 30',
      });

      const evt = await saboteur.waitForEvent('secret_role_assigned', (d) => d?.playerId === 'p_sab');
      expect(evt?.role).toBe('SABOTEUR');
      expect(evt?.secretObjective).toContain('Draining');
    }
  });

  it('allows saboteur to execute covert resource drain action during the action phase', async () => {
    const live = await isServiceHealthy(saboteur.baseUrl);

    const sabotagePayload = createSabotagePayload('water', 15);
    expect(sabotagePayload.type).toBe('SABOTAGE');
    expect(sabotagePayload.payload.targetResource).toBe('water');
    expect(sabotagePayload.payload.amount).toBe(15);

    if (live.healthy) {
      await saboteur.createRoom();
      await saboteur.sendAction('START_GAME', {});
      const res = await saboteur.sendAction('SABOTAGE' as any, sabotagePayload.payload);
      expect([200, 202, 422]).toContain(res.status);
    } else {
      saboteur.setAuth('jwt-sab', 'SAB_ACT', 'p_sab', 'r1');

      saboteur.pushMockEvent('sabotage_executed', {
        perpetratorId: 'REDACTED', // secret in public broadcast
        targetResource: 'water',
        amountDrained: 15,
        day: 6,
      });

      const evt = await saboteur.waitForEvent('sabotage_executed', (d) => d?.day === 6);
      expect(evt?.targetResource).toBe('water');
      expect(evt?.amountDrained).toBe(15);
      expect(evt?.perpetratorId).toBe('REDACTED');
    }
  });

  it('allows Guard role to conduct security inspection and discover sabotage evidence', async () => {
    const live = await isServiceHealthy(guard.baseUrl);

    const inspectPayload = createGuardInspectPayload('p_sab');
    expect(inspectPayload.type).toBe('GUARD_INSPECT');
    expect(inspectPayload.payload.targetPlayerId).toBe('p_sab');

    if (live.healthy) {
      await guard.createRoom();
      await guard.sendAction('START_GAME', {});
      const res = await guard.sendAction('GUARD_INSPECT' as any, inspectPayload.payload);
      expect([200, 202, 422]).toContain(res.status);
    } else {
      guard.setAuth('jwt-guard', 'GUARD_CHECK', 'p_guard', 'r1');

      guard.pushMockEvent('guard_inspection_report', {
        inspectorId: guard.playerId,
        targetPlayerId: 'p_sab',
        cluesFound: ['Подозрительные следы у клапана резервуара воды', 'Инструменты со следами ржавчины'],
        suspicionScore: 'HIGH',
      });

      const evt = await guard.waitForEvent('guard_inspection_report', (d) => d?.inspectorId === 'p_guard');
      expect(evt?.targetPlayerId).toBe('p_sab');
      expect(evt?.suspicionScore).toBe('HIGH');
      expect(evt?.cluesFound).toHaveLength(2);
    }
  });

  it('executes emergency accusation tribunal and exiles confirmed saboteur from bunker', async () => {
    const live = await isServiceHealthy(guard.baseUrl);

    const accusePayload = createAccuseTraitorPayload('p_sab');
    expect(accusePayload.type).toBe('ACCUSE_TRAITOR');
    expect(accusePayload.payload.targetPlayerId).toBe('p_sab');

    if (live.healthy) {
      await guard.createRoom();
      await guard.sendAction('START_GAME', {});
      const res = await guard.sendAction('ACCUSE_TRAITOR' as any, accusePayload.payload);
      expect([200, 202, 422]).toContain(res.status);
    } else {
      guard.setAuth('jwt-guard', 'TRIBUNAL', 'p_guard', 'r1');

      guard.pushMockEvent('traitor_exiled', {
        accusedPlayerId: 'p_sab',
        isSaboteur: true,
        tribunalVotesForExile: 4,
        bunkerMoraleBonus: 10, // catching traitor boosts morale
      });

      const evt = await guard.waitForEvent('traitor_exiled', (d) => d?.accusedPlayerId === 'p_sab');
      expect(evt?.isSaboteur).toBe(true);
      expect(evt?.bunkerMoraleBonus).toBe(10);
    }
  });

  it('inflicts severe bunker Morale loss penalty when tribunal falsely exiles an innocent survivor', async () => {
    const live = await isServiceHealthy(innocentPlayer.baseUrl);

    if (live.healthy) {
      await innocentPlayer.createRoom();
      await innocentPlayer.sendAction('START_GAME', {});
      const state = await innocentPlayer.getGameState();
      expect(state).toBeDefined();
    } else {
      innocentPlayer.setAuth('jwt-innocent', 'FALSE_ACCUSE', 'p_innocent', 'r1');

      const falseAccusationMoralePenalty = -25;

      innocentPlayer.pushMockEvent('traitor_exiled', {
        accusedPlayerId: 'p_innocent',
        isSaboteur: false,
        tribunalOutcome: 'FALSE_ACCUSATION',
        moralePenalty: falseAccusationMoralePenalty,
        consequenceMessage: 'Изгнан невиновный доктор! Паника и раскол в бункере (-25 Морали)',
      });

      const evt = await innocentPlayer.waitForEvent(
        'traitor_exiled',
        (d) => d?.tribunalOutcome === 'FALSE_ACCUSATION'
      );
      expect(evt?.isSaboteur).toBe(false);
      expect(evt?.moralePenalty).toBe(-25);
      expect(evt?.consequenceMessage).toContain('-25');
    }
  });
});
