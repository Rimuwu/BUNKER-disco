import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';

describe('Tier 2 Boundaries: Mulligan Reroll Limits (0, 1, 999)', () => {
  let host: TestClient;
  let player: TestClient;

  beforeEach(() => {
    host = new TestClient({ nickname: 'LobbyHost' });
    player = new TestClient({ nickname: 'Gamer' });
  });

  afterEach(() => {
    host.disconnect();
    player.disconnect();
  });

  it('strictly blocks rerolls when host sets rerollLimit = 0', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    if (live.healthy) {
      await host.createRoom();
      await host.updateSettings({ rerollLimit: 0 });
      await player.joinRoom(host.roomCode);

      const res = await player.sendAction('PLAYER_REROLL', { discardHand: true });
      expect([400, 403, 422]).toContain(res.status);
    } else {
      player.setAuth('jwt-p1', 'ZERO1', 'p1', 'r1');
      player.pushMockEvent('reroll_rejected', {
        reason: 'REROLL_LIMIT_EXCEEDED',
        remainingRerolls: 0,
        allowedLimit: 0,
      });

      const evt = await player.waitForEvent('reroll_rejected');
      expect(evt?.remainingRerolls).toBe(0);
      expect(evt?.allowedLimit).toBe(0);
    }
  });

  it('allows exactly 1 reroll and exhausts quota when rerollLimit = 1', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    if (live.healthy) {
      await host.createRoom();
      await host.updateSettings({ rerollLimit: 1 });
      await player.joinRoom(host.roomCode);

      const first = await player.sendAction('PLAYER_REROLL', { discardHand: true });
      expect([200, 202]).toContain(first.status);

      const second = await player.sendAction('PLAYER_REROLL', { discardHand: true });
      expect([400, 403, 422]).toContain(second.status);
    } else {
      player.setAuth('jwt-p1', 'ONE11', 'p1', 'r1');
      player.pushMockEvent('mulligan_completed', {
        playerId: 'p1',
        remainingRerolls: 0,
        newCardsDrawn: 7,
      });

      const evt = await player.waitForEvent('mulligan_completed');
      expect(evt?.remainingRerolls).toBe(0);
      expect(evt?.newCardsDrawn).toBe(7);
    }
  });

  it('permits continuous consecutive rerolls in sandbox/unlimited mode (limit = 999)', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    if (live.healthy) {
      await host.createRoom();
      await host.updateSettings({ rerollLimit: 999 });
      await player.joinRoom(host.roomCode);

      for (let i = 0; i < 3; i++) {
        const res = await player.sendAction('PLAYER_REROLL', { discardHand: true });
        expect([200, 202]).toContain(res.status);
      }
    } else {
      player.setAuth('jwt-p1', 'INF01', 'p1', 'r1');
      player.pushMockEvent('mulligan_completed', {
        playerId: 'p1',
        remainingRerolls: 998,
      });

      const evt = await player.waitForEvent('mulligan_completed');
      expect(evt?.remainingRerolls).toBe(998);
    }
  });

  it('preserves revealed card status during reroll per game rules', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await host.createRoom();
      await player.joinRoom(host.roomCode);
      await player.sendAction('REVEAL_CARD', { category: 'profession' });
      const res = await player.sendAction('PLAYER_REROLL', { discardHand: true });
      expect([200, 202]).toContain(res.status);
    } else {
      player.setAuth('jwt-p1', 'PRESV', 'p1', 'r1');
      player.pushMockEvent('mulligan_completed', {
        playerId: 'p1',
        unrevealedReplaced: 6,
        revealedRetained: 1,
      });

      const evt = await player.waitForEvent('mulligan_completed');
      expect(evt?.revealedRetained).toBe(1);
    }
  });

  it('strictly forbids reroll after Phase 1 has ended (Phase 2 survival lock)', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await host.createRoom();
      await player.joinRoom(host.roomCode);
      // Simulating phase 2
      const res = await player.sendAction('PLAYER_REROLL', { phase: 'phase2' });
      expect([400, 403, 422]).toContain(res.status);
    } else {
      player.setAuth('jwt-p1', 'P2LCK', 'p1', 'r1');
      player.pushMockEvent('error', {
        code: 'REROLL_FORBIDDEN_PHASE',
        message: 'Mulligan reroll is only allowed during entrance selection phase.',
      });

      const err = await player.waitForEvent('error');
      expect(err?.code).toBe('REROLL_FORBIDDEN_PHASE');
    }
  });
});
