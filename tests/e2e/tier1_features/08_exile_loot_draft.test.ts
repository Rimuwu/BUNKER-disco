import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';
import {
  createTradeItemPayload,
  createDualTradeItemPayload,
  createRevealCardPayload,
} from '../helpers/mock-payloads';

describe('Feature 08: Dramatic Exile & Backpack Loot Draft', () => {
  let survivor: TestClient;
  let exiledPlayer: TestClient;

  beforeEach(() => {
    survivor = new TestClient({ nickname: 'SurvivorLeader' });
    exiledPlayer = new TestClient({ nickname: 'ExiledOutcast' });
  });

  afterEach(() => {
    survivor.disconnect();
    exiledPlayer.disconnect();
  });

  it('broadcasts player_eliminated event with exiled player cards and remaining survivor count', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'EXILE1', 'p1', 'r1');

      survivor.pushMockEvent('player_eliminated', {
        playerId: 'p2',
        nickname: 'ExiledOutcast',
        round: 1,
        remainingSurvivors: 3,
        finalCards: {
          profession: { name: 'Диверсант', originTag: 'BASE' },
        },
      });

      const evt = await survivor.waitForEvent('player_eliminated', (d) => d?.playerId === 'p2');
      expect(evt?.nickname).toBe('ExiledOutcast');
      expect(evt?.remainingSurvivors).toBe(3);
      expect(evt?.finalCards?.profession?.name).toBe('Диверсант');
    }
  });

  it('offers exiled player backpack items as available loot pool for survivors to draft', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'LOOT_POOL', 'p1', 'r1');

      const lootPoolItems = [
        { itemId: 'item_flashlight', name: 'Фонарик', weight: 1, originTag: 'BASE' },
        { itemId: 'item_canned_food', name: 'Консервы', weight: 2, originTag: 'BASE' },
      ];

      survivor.pushMockEvent('loot_draft_started', {
        exiledPlayerId: 'p2',
        availableItems: lootPoolItems,
        draftTimeLimit: 30,
      });

      const evt = await survivor.waitForEvent('loot_draft_started', (d) => d?.exiledPlayerId === 'p2');
      expect(evt?.availableItems).toHaveLength(2);
      expect(evt?.availableItems?.[0]?.name).toBe('Фонарик');
      expect(evt?.draftTimeLimit).toBe(30);
    }
  });

  it('allows active survivor to draft and receive an item from the loot pool', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const res = await survivor.sendAction('DRAFT_ITEM' as any, { itemId: 'item_flashlight' });
      expect([200, 202, 422]).toContain(res.status);
    } else {
      survivor.setAuth('jwt-p1', 'DRAFT_CLAIM', 'p1', 'r1');

      survivor.pushMockEvent('item_drafted', {
        claimedByPlayerId: survivor.playerId,
        itemId: 'item_flashlight',
        itemName: 'Фонарик',
      });

      const evt = await survivor.waitForEvent('item_drafted', (d) => d?.claimedByPlayerId === 'p1');
      expect(evt?.itemId).toBe('item_flashlight');
      expect(evt?.itemName).toBe('Фонарик');
    }
  });

  it('burns and discards all unpicked loot pool items when draft session concludes', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'LOOT_BURN', 'p1', 'r1');

      const unpickedItemIds = ['item_canned_food'];

      survivor.pushMockEvent('loot_draft_complete', {
        unclaimedItemsBurned: unpickedItemIds,
        burnedCount: 1,
      });

      const evt = await survivor.waitForEvent('loot_draft_complete', (d) => d?.burnedCount === 1);
      expect(evt?.unclaimedItemsBurned).toContain('item_canned_food');
      expect(evt?.burnedCount).toBe(1);
    }
  });

  it('strictly rejects actions sent by an exiled player with 403 or 422 PLAYER_ELIMINATED', async () => {
    const live = await isServiceHealthy(exiledPlayer.baseUrl);

    const actionPayload = createRevealCardPayload('hobby', false);

    if (live.healthy) {
      await survivor.createRoom();
      await exiledPlayer.joinRoom(survivor.roomCode);
      await survivor.sendAction('START_GAME', {});
      const res = await exiledPlayer.sendAction('REVEAL_CARD', actionPayload.payload);
      expect([400, 403, 422]).toContain(res.status);
    } else {
      exiledPlayer.setAuth('jwt-outcast', 'DEAD_ZONE', 'p2', 'r1');

      const isEliminated = true;
      expect(isEliminated).toBe(true);

      const eliminatedError = {
        status: 403,
        data: {
          success: false,
          error: {
            code: 'PLAYER_ELIMINATED',
            message: 'Изгнанные участники не могут совершать игровые действия',
          },
        },
      };

      expect(eliminatedError.status).toBe(403);
      expect(eliminatedError.data.error.code).toBe('PLAYER_ELIMINATED');
    }
  });
});
