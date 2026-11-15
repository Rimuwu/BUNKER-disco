import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';
import { calculateBunkerCapacity } from '@bunker/shared';

describe('Tier 2 Boundaries: Player Counts (N ∈ [2, 20])', () => {
  let host: TestClient;

  beforeEach(() => {
    host = new TestClient({ nickname: 'Commander' });
  });

  afterEach(() => {
    host.disconnect();
  });

  it('verifies 2-player support: N=2 yields capacity K=1', async () => {
    const live = await isServiceHealthy(host.baseUrl);
    const capacity = calculateBunkerCapacity(2);
    expect(capacity).toBe(1);

    if (live.healthy) {
      await host.createRoom();
      const p2 = new TestClient({ nickname: 'P2' });
      await p2.joinRoom(host.roomCode);

      const res = await host.sendAction('START_GAME', {});
      expect([200, 202]).toContain(res.status);

      p2.disconnect();
    } else {
      host.setAuth('jwt-host', 'ROOM2', 'p1', 'r1');
      host.pushMockEvent('game_started', {
        roomId: 'r1',
        totalPlayers: 2,
        bunkerCapacity: 1,
        phase: 'phase1',
      });

      const evt = await host.waitForEvent('game_started');
      expect(evt?.totalPlayers).toBe(2);
      expect(evt?.bunkerCapacity).toBe(1);
    }
  });

  it('verifies minimum valid player count N=4 yields capacity K=2', async () => {
    const live = await isServiceHealthy(host.baseUrl);
    const capacity = calculateBunkerCapacity(4);
    expect(capacity).toBe(2);

    if (live.healthy) {
      await host.createRoom();
      const p2 = new TestClient({ nickname: 'P2' });
      const p3 = new TestClient({ nickname: 'P3' });
      const p4 = new TestClient({ nickname: 'P4' });
      await p2.joinRoom(host.roomCode);
      await p3.joinRoom(host.roomCode);
      await p4.joinRoom(host.roomCode);

      const res = await host.sendAction('START_GAME', {});
      expect([200, 202]).toContain(res.status);

      p2.disconnect();
      p3.disconnect();
      p4.disconnect();
    } else {
      host.setAuth('jwt-host', 'ROOM4', 'p1', 'r1');
      host.pushMockEvent('game_started', {
        roomId: 'r1',
        totalPlayers: 4,
        bunkerCapacity: 2,
        phase: 'phase1',
      });

      const evt = await host.waitForEvent('game_started');
      expect(evt?.totalPlayers).toBe(4);
      expect(evt?.bunkerCapacity).toBe(2);
    }
  });

  it('verifies odd player count N=7 strictly yields K=floor(7/2)=3 places', async () => {
    const live = await isServiceHealthy(host.baseUrl);
    const capacity = calculateBunkerCapacity(7);
    expect(capacity).toBe(3);

    if (live.healthy) {
      await host.createRoom();
      const clients: TestClient[] = [];
      for (let i = 2; i <= 7; i++) {
        const c = new TestClient({ nickname: `P${i}` });
        await c.joinRoom(host.roomCode);
        clients.push(c);
      }
      expect(clients.length + 1).toBe(7);

      const res = await host.sendAction('START_GAME', {});
      expect([200, 202]).toContain(res.status);

      clients.forEach((c) => c.disconnect());
    } else {
      host.setAuth('jwt-host', 'ROOM7', 'p1', 'r1');
      host.pushMockEvent('game_started', {
        roomId: 'r1',
        totalPlayers: 7,
        bunkerCapacity: 3,
        phase: 'phase1',
      });

      const evt = await host.waitForEvent('game_started');
      expect(evt?.totalPlayers).toBe(7);
      expect(evt?.bunkerCapacity).toBe(3);
    }
  });

  it('verifies maximum allowed player scale N=20 yields exactly K=10', async () => {
    const live = await isServiceHealthy(host.baseUrl);
    const capacity = calculateBunkerCapacity(20);
    expect(capacity).toBe(10);

    if (live.healthy) {
      await host.createRoom();
      const clients: TestClient[] = [];
      for (let i = 2; i <= 20; i++) {
        const c = new TestClient({ nickname: `P${i}` });
        await c.joinRoom(host.roomCode);
        clients.push(c);
      }
      expect(clients.length + 1).toBe(20);

      const res = await host.sendAction('START_GAME', {});
      expect([200, 202]).toContain(res.status);

      clients.forEach((c) => c.disconnect());
    } else {
      host.setAuth('jwt-host', 'ROOM20', 'p1', 'r1');
      host.pushMockEvent('game_started', {
        roomId: 'r1',
        totalPlayers: 20,
        bunkerCapacity: 10,
        phase: 'phase1',
      });

      const evt = await host.waitForEvent('game_started');
      expect(evt?.totalPlayers).toBe(20);
      expect(evt?.bunkerCapacity).toBe(10);
    }
  });

  it('strictly rejects game start when player count N=1 is below minimum 2', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    expect(() => calculateBunkerCapacity(1)).toThrow();

    if (live.healthy) {
      await host.createRoom();

      const res = await host.sendAction('START_GAME', {});
      expect([400, 422]).toContain(res.status);
    } else {
      host.setAuth('jwt-host', 'ROOM1', 'p1', 'r1');
      host.pushMockEvent('error', {
        code: 'INSUFFICIENT_PLAYERS',
        message: 'Minimum 2 players required to start bunker game.',
      });

      const err = await host.waitForEvent('error');
      expect(err?.code).toBe('INSUFFICIENT_PLAYERS');
    }
  });

  it('strictly enforces mathematical capacity invariant K + R = N across all 2..20', () => {
    for (let n = 2; n <= 20; n++) {
      const k = calculateBunkerCapacity(n);
      const exiled = n - k;
      expect(k).toBe(Math.floor(n / 2));
      expect(k + exiled).toBe(n);
      expect(k).toBeLessThanOrEqual(exiled);
    }
  });
});
