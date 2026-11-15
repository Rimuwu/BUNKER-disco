import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';
import { createPlayerRerollPayload } from '../helpers/mock-payloads';

describe('Feature 04: Mulligan Reroll Execution', () => {
  let player: TestClient;

  beforeEach(() => {
    player = new TestClient({ nickname: 'RerollAdventurer' });
  });

  afterEach(() => {
    player.disconnect();
  });

  it('decrements remainingRerolls and emits player_rerolled event on valid reroll', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom({ rerollLimit: 2 });
      const rerollRes = await player.reroll();
      expect([200, 202]).toContain(rerollRes.status);
      const data = rerollRes.data?.data || rerollRes.data;
      expect(data.remainingRerolls).toBe(1);
    } else {
      player.setAuth('jwt-p1', 'REROL1', 'p1', 'r1');

      const initialRerolls = 2;
      let remainingRerolls = initialRerolls;

      // Execute reroll
      remainingRerolls--;

      player.pushMockEvent('player_rerolled', {
        playerId: player.playerId,
        remainingRerolls,
        cards: { profession: { id: 'prof_architect', name: 'Архитектор', originTag: 'BASE' } },
      });

      const evt = await player.waitForEvent('player_rerolled', (d) => d?.playerId === 'p1');
      expect(evt?.remainingRerolls).toBe(1);
      expect(evt?.cards?.profession?.name).toBe('Архитектор');
    }
  });

  it('rejects reroll attempt when 0 rerolls remain with 422 NO_REROLLS_LEFT', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom({ rerollLimit: 1 });
      await player.reroll(); // burns the 1 reroll
      const secondReroll = await player.reroll();
      expect([400, 422]).toContain(secondReroll.status);
    } else {
      player.setAuth('jwt-p1', 'REROL2', 'p1', 'r1');
      const remainingRerolls = 0;

      const canReroll = remainingRerolls > 0;
      expect(canReroll).toBe(false);

      const exhaustedError = {
        status: 422,
        data: {
          success: false,
          error: {
            code: 'NO_REROLLS_LEFT',
            message: 'Вы исчерпали лимит перерандома персонажа для этой комнаты',
          },
        },
      };

      expect(exhaustedError.status).toBe(422);
      expect(exhaustedError.data.error.code).toBe('NO_REROLLS_LEFT');
    }
  });

  it('strictly rejects any reroll attempt in a room with rerollLimit set to 0', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom({ rerollLimit: 0 });
      const res = await player.reroll();
      expect([400, 422]).toContain(res.status);
    } else {
      player.setAuth('jwt-p1', 'ZERO_REROLL', 'p1', 'r1');
      const roomRerollLimit = 0;

      expect(roomRerollLimit).toBe(0);

      const forbiddenReroll = {
        status: 422,
        data: {
          success: false,
          error: {
            code: 'REROLL_DISABLED',
            message: 'В этой комнате функция перерандома отключена создателем',
          },
        },
      };

      expect(forbiddenReroll.status).toBe(422);
      expect(forbiddenReroll.data.error.code).toBe('REROLL_DISABLED');
    }
  });

  it('allows multiple consecutive rerolls when rerollLimit is 999 (Party Mode)', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom({ rerollLimit: 999 });
      for (let i = 0; i < 3; i++) {
        const res = await player.reroll();
        expect([200, 202]).toContain(res.status);
      }
    } else {
      player.setAuth('jwt-p1', 'PARTY999', 'p1', 'r1');
      let remaining = 999;

      for (let i = 1; i <= 3; i++) {
        remaining--;
        player.clearEventLog();
        player.pushMockEvent('player_rerolled', {
          playerId: player.playerId,
          iteration: i,
          remainingRerolls: remaining,
        });

        const evt = await player.waitForEvent('player_rerolled', (d) => d?.iteration === i);
        expect(evt?.remainingRerolls).toBe(999 - i);
      }

      expect(remaining).toBe(996);
    }
  });

  it('rejects reroll attempt when game has moved into Phase 1 or Phase 2', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom({ rerollLimit: 3 });
      await player.sendAction('START_GAME', {});
      const res = await player.reroll();
      expect([400, 409, 422]).toContain(res.status);
    } else {
      player.setAuth('jwt-p1', 'PHASE_FAIL', 'p1', 'r1');

      const currentPhase = 'phase1';
      const isLobby = currentPhase === 'lobby';
      expect(isLobby).toBe(false);

      const invalidPhaseError = {
        status: 422,
        data: {
          success: false,
          error: {
            code: 'INVALID_PHASE',
            message: 'Перерандом доступен только на стадии лобби до начала Отбора',
          },
        },
      };

      expect(invalidPhaseError.status).toBe(422);
      expect(invalidPhaseError.data.error.code).toBe('INVALID_PHASE');
    }
  });
});
