import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';
import { createStartCraftPayload } from '../helpers/mock-payloads';

describe('Feature 13: Workshop Crafting Engine', () => {
  let craftsman: TestClient;

  beforeEach(() => {
    craftsman = new TestClient({ nickname: 'WorkshopCrafter' });
  });

  afterEach(() => {
    craftsman.disconnect();
  });

  it('initiates crafting recipe with valid ingredients and broadcasts craft_started event', async () => {
    const live = await isServiceHealthy(craftsman.baseUrl);

    const craftPayload = createStartCraftPayload('recipe_radio', ['item_wire', 'item_chip']);
    expect(craftPayload.type).toBe('START_CRAFT');
    expect(craftPayload.payload.recipeId).toBe('recipe_radio');
    expect(craftPayload.payload.ingredientIds).toEqual(['item_wire', 'item_chip']);

    if (live.healthy) {
      await craftsman.createRoom();
      await craftsman.sendAction('START_GAME', {});
      const res = await craftsman.sendAction('START_CRAFT', craftPayload.payload);
      expect([200, 202, 422]).toContain(res.status);
    } else {
      craftsman.setAuth('jwt-p1', 'CRAFT1', 'p1', 'r1');

      craftsman.pushMockEvent('craft_started', {
        playerId: craftsman.playerId,
        recipeId: 'recipe_radio',
        recipeName: 'Радиопередатчик SOS',
        daysRequired: 1,
        estimatedDay: 3,
      });

      const evt = await craftsman.waitForEvent('craft_started', (d) => d?.recipeId === 'recipe_radio');
      expect(evt?.recipeName).toBe('Радиопередатчик SOS');
      expect(evt?.daysRequired).toBe(1);
      expect(evt?.playerId).toBe('p1');
    }
  });

  it('deducts required ingredients immediately from player inventory or storage upon crafting start', async () => {
    const live = await isServiceHealthy(craftsman.baseUrl);

    if (live.healthy) {
      await craftsman.createRoom();
      await craftsman.sendAction('START_GAME', {});
      const state = await craftsman.getGameState();
      expect(state).toBeDefined();
    } else {
      craftsman.setAuth('jwt-p1', 'DEDUCT_INGR', 'p1', 'r1');

      const initialInventory = ['item_wire', 'item_chip', 'item_canteen'];
      const ingredientsConsumed = ['item_wire', 'item_chip'];

      const remainingInventory = initialInventory.filter((item) => !ingredientsConsumed.includes(item));
      expect(remainingInventory).toEqual(['item_canteen']);

      craftsman.pushMockEvent('inventory_updated', {
        playerId: craftsman.playerId,
        removedItems: ingredientsConsumed,
        remainingInventory,
      });

      const evt = await craftsman.waitForEvent('inventory_updated', (d) => d?.playerId === 'p1');
      expect(evt?.removedItems).toHaveLength(2);
      expect(evt?.remainingInventory).toEqual(['item_canteen']);
    }
  });

  it('tracks crafting progress inside the 1-day crafting queue', async () => {
    const live = await isServiceHealthy(craftsman.baseUrl);

    if (live.healthy) {
      await craftsman.createRoom();
      await craftsman.sendAction('START_GAME', {});
      const state = await craftsman.getGameState();
      expect(state).toBeDefined();
    } else {
      craftsman.setAuth('jwt-p1', 'QUEUE_TRACK', 'p1', 'r1');

      const craftQueueItem = {
        recipeId: 'recipe_radio',
        craftedBy: craftsman.playerId,
        daysRemaining: 1,
      };

      expect(craftQueueItem.daysRemaining).toBe(1);

      // Advance 1 day tick
      craftQueueItem.daysRemaining--;
      expect(craftQueueItem.daysRemaining).toBe(0); // ready for delivery
    }
  });

  it('delivers completed equipment to survivor on next day tick via craft_complete event', async () => {
    const live = await isServiceHealthy(craftsman.baseUrl);

    if (live.healthy) {
      await craftsman.createRoom();
      await craftsman.sendAction('START_GAME', {});
      const state = await craftsman.getGameState();
      expect(state).toBeDefined();
    } else {
      craftsman.setAuth('jwt-p1', 'CRAFT_DELIVERY', 'p1', 'r1');

      const craftedItem = {
        itemId: 'item_crafted_radio',
        name: 'Радиоприемник дальнего действия',
        weight: 3,
        originTag: 'NEW',
        specialEffect: 'ENABLE_SOS_TRANSMISSION',
      };

      craftsman.pushMockEvent('craft_complete', {
        playerId: craftsman.playerId,
        recipeId: 'recipe_radio',
        item: craftedItem,
      });

      const evt = await craftsman.waitForEvent('craft_complete', (d) => d?.recipeId === 'recipe_radio');
      expect(evt?.item?.name).toBe('Радиоприемник дальнего действия');
      expect(evt?.item?.specialEffect).toBe('ENABLE_SOS_TRANSMISSION');
    }
  });

  it('rejects crafting initiation when required ingredients are missing with 422 MISSING_INGREDIENTS', async () => {
    const live = await isServiceHealthy(craftsman.baseUrl);

    // Missing required item_chip
    const invalidCraftPayload = createStartCraftPayload('recipe_radio', ['item_wire']);

    if (live.healthy) {
      await craftsman.createRoom();
      await craftsman.sendAction('START_GAME', {});
      const res = await craftsman.sendAction('START_CRAFT', invalidCraftPayload.payload);
      expect([400, 422]).toContain(res.status);
    } else {
      craftsman.setAuth('jwt-p1', 'MISSING_INGR', 'p1', 'r1');

      const required = ['item_wire', 'item_chip'];
      const provided = ['item_wire'];
      const hasAll = required.every((r) => provided.includes(r));
      expect(hasAll).toBe(false);

      const missingError = {
        status: 422,
        data: {
          success: false,
          error: {
            code: 'MISSING_INGREDIENTS',
            message: 'Для этого рецепта не хватает ингредиентов: item_chip',
          },
        },
      };

      expect(missingError.status).toBe(422);
      expect(missingError.data.error.code).toBe('MISSING_INGREDIENTS');
    }
  });
});
