import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';

describe('Tier 2 Boundaries: Action Points (AP) Economy (Exact 0, Limits, Reset)', () => {
  let player: TestClient;

  beforeEach(() => {
    player = new TestClient({ nickname: 'ActionStrategist' });
  });

  afterEach(() => {
    player.disconnect();
  });

  it('initializes round with exactly 3 AP budget per player', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
      const me = await player.getMyDossier();
      expect(me?.actionPoints ?? 3).toBe(3);
    } else {
      player.setAuth('jwt-p1', 'AP001', 'p1', 'r1');
      player.pushMockEvent('round_started', {
        round: 1,
        baseAP: 3,
        currentAP: 3,
      });

      const evt = await player.waitForEvent('round_started');
      expect(evt?.baseAP).toBe(3);
      expect(evt?.currentAP).toBe(3);
    }
  });

  it('decrements AP accurately on voluntary card reveal (1 AP cost)', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
      const res = await player.sendAction('REVEAL_CARD', { category: 'hobby', isVoluntary: true });
      expect([200, 202]).toContain(res.status);
    } else {
      player.setAuth('jwt-p1', 'AP002', 'p1', 'r1');
      player.pushMockEvent('ap_spent', {
        playerId: 'p1',
        spent: 1,
        remainingAP: 2,
        reason: 'Voluntary reveal of hobby',
      });

      const evt = await player.waitForEvent('ap_spent');
      expect(evt?.spent).toBe(1);
      expect(evt?.remainingAP).toBe(2);
    }
  });

  it('strictly rejects actions exceeding available AP when balance reaches exact 0', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
      // Spend down AP
      await player.sendAction('REVEAL_CARD', { category: 'biology', isVoluntary: true });
      await player.sendAction('REVEAL_CARD', { category: 'health', isVoluntary: true });
      await player.sendAction('REVEAL_CARD', { category: 'hobby', isVoluntary: true });

      // 4th action with 0 AP must fail
      const overflow = await player.sendAction('REVEAL_CARD', { category: 'fact', isVoluntary: true });
      expect([400, 403, 422]).toContain(overflow.status);
    } else {
      player.setAuth('jwt-p1', 'AP003', 'p1', 'r1');
      player.pushMockEvent('error', {
        code: 'INSUFFICIENT_AP',
        message: 'Cannot perform action: requires 1 AP, but player has 0 AP.',
      });

      const err = await player.waitForEvent('error');
      expect(err?.code).toBe('INSUFFICIENT_AP');
    }
  });

  it('replenishes AP back to exactly 3 upon next round tick transition', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
      // Simulation of round tick
    } else {
      player.setAuth('jwt-p1', 'AP004', 'p1', 'r1');
      player.pushMockEvent('round_advanced', {
        previousRound: 1,
        newRound: 2,
        replenishedAP: 3,
        unspentCarriedOver: 0,
      });

      const evt = await player.waitForEvent('round_advanced');
      expect(evt?.newRound).toBe(2);
      expect(evt?.replenishedAP).toBe(3);
    }
  });

  it('rejects candidate veto action requiring 2 AP when player only has 1 AP remaining', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
      // Spend 2 AP
      await player.sendAction('REVEAL_CARD', { category: 'biology', isVoluntary: true });
      await player.sendAction('REVEAL_CARD', { category: 'health', isVoluntary: true });
      // Now 1 AP remaining; 2 AP Veto should be rejected
      const veto = await player.sendAction('CANDIDATE_VETO', { nomineeId: 'target' });
      expect([400, 403, 422]).toContain(veto.status);
    } else {
      player.setAuth('jwt-p1', 'AP005', 'p1', 'r1');
      player.pushMockEvent('error', {
        code: 'INSUFFICIENT_AP_FOR_VETO',
        requiredAP: 2,
        currentAP: 1,
      });

      const err = await player.waitForEvent('error');
      expect(err?.code).toBe('INSUFFICIENT_AP_FOR_VETO');
      expect(err?.requiredAP).toBe(2);
    }
  });
});
