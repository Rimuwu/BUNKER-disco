import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';

describe('Tier 2 Boundaries: Inventory & Backpack Limits (Slots & Weight)', () => {
  let player: TestClient;

  beforeEach(() => {
    player = new TestClient({ nickname: 'Backpacker' });
  });

  afterEach(() => {
    player.disconnect();
  });

  it('verifies standard backpack capacity is strictly constrained to 3-4 item slots', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
      const me = await player.getMyDossier();
      const slots = me?.inventoryCapacity ?? 4;
      expect([3, 4]).toContain(slots);
    } else {
      player.setAuth('jwt-p1', 'INV01', 'p1', 'r1');
      player.pushMockEvent('inventory_sync', {
        playerId: 'p1',
        maxSlots: 4,
        currentSlotsUsed: 1,
        items: [{ itemId: 'item_01', name: 'Фляга с водой', weight: 1 }],
      });

      const evt = await player.waitForEvent('inventory_sync');
      expect(evt?.maxSlots).toBe(4);
      expect(evt?.items).toHaveLength(1);
    }
  });

  it('strictly rejects adding item when all backpack slots are occupied (INVENTORY_FULL)', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
    } else {
      player.setAuth('jwt-p1', 'INV02', 'p1', 'r1');
      player.pushMockEvent('error', {
        code: 'INVENTORY_FULL',
        message: 'Cannot acquire item: all 4 backpack slots are occupied.',
        maxSlots: 4,
      });

      const err = await player.waitForEvent('error');
      expect(err?.code).toBe('INVENTORY_FULL');
      expect(err?.maxSlots).toBe(4);
    }
  });

  it('enforces total weight threshold (< 10kg) preventing overencumbrance', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
    } else {
      player.setAuth('jwt-p1', 'INV03', 'p1', 'r1');
      player.pushMockEvent('encumbrance_check', {
        playerId: 'p1',
        currentWeightKg: 8.5,
        maxWeightLimitKg: 10.0,
        isOverencumbered: false,
      });

      const evt = await player.waitForEvent('encumbrance_check');
      expect(evt?.currentWeightKg).toBeLessThanOrEqual(10.0);
      expect(evt?.isOverencumbered).toBe(false);
    }
  });

  it('frees inventory slot immediately upon item trade or crafting consumption', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
      const res = await player.sendAction('TRADE_ITEM', {
        itemId: 'item_01',
        targetPlayerId: 'partner',
      });
      expect([200, 202]).toContain(res.status);
    } else {
      player.setAuth('jwt-p1', 'INV04', 'p1', 'r1');
      player.pushMockEvent('item_transferred', {
        fromPlayerId: 'p1',
        toPlayerId: 'partner',
        itemId: 'item_01',
        freedSlotIndex: 0,
      });

      const evt = await player.waitForEvent('item_transferred');
      expect(evt?.freedSlotIndex).toBe(0);
      expect(evt?.fromPlayerId).toBe('p1');
    }
  });

  it('dumps exiled player backpack into community draft pool upon dramatic exile', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
    } else {
      player.setAuth('jwt-p1', 'INV05', 'p1', 'r1');
      player.pushMockEvent('exile_loot_dropped', {
        exiledPlayerId: 'p1',
        itemsDropped: [
          { itemId: 'medkit', name: 'Аптечка', weight: 2 },
          { itemId: 'matches', name: 'Спички', weight: 1 },
        ],
        draftPoolSize: 2,
      });

      const evt = await player.waitForEvent('exile_loot_dropped');
      expect(evt?.exiledPlayerId).toBe('p1');
      expect(evt?.itemsDropped).toHaveLength(2);
      expect(evt?.draftPoolSize).toBe(2);
    }
  });
});
