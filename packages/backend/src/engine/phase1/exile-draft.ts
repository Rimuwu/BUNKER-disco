import { IPlayerDocument } from '../../db/repositories/player.repository.js';
import { getBackpackCapacity, calculateItemSlots } from '@bunker/shared';

export interface IDraftPoolItem {
  itemId: string;
  name: string;
  weight: number;
  quantity: number;
  description?: string;
}

export interface ILootDraftSession {
  exiledPlayerId: string;
  items: IDraftPoolItem[];
  draftingPlayerIds: string[];
  currentTurnIndex: number;
  picks: Record<string, string>; // playerId -> itemId
  burnedItems: IDraftPoolItem[];
}

export class ExileDraftEngine {
  public static executeExileSequence(exiledPlayer: IPlayerDocument): {
    exiledCards: Record<string, any>;
    availableLoot: IDraftPoolItem[];
  } {
    exiledPlayer.isEliminated = true;
    exiledPlayer.role = 'spectator';

    // Reveal all cards EXCEPT secret quest
    const revealedCards: Record<string, any> = {};
    for (const [category, card] of Object.entries(exiledPlayer.cards || {})) {
      if (category !== 'special_condition' && !card.isSecret) {
        card.isRevealed = true;
      }
      revealedCards[category] = card;
    }

    // Extract items to draft pool
    const availableLoot = [...exiledPlayer.inventory];
    exiledPlayer.inventory = [];

    return {
      exiledCards: revealedCards,
      availableLoot,
    };
  }

  public static createDraftSession(
    exiledPlayerId: string,
    loot: IDraftPoolItem[],
    survivorIds: string[]
  ): ILootDraftSession {
    return {
      exiledPlayerId,
      items: [...loot],
      draftingPlayerIds: [...survivorIds],
      currentTurnIndex: 0,
      picks: {},
      burnedItems: [],
    };
  }

  public static draftItem(
    session: ILootDraftSession,
    player: IPlayerDocument,
    itemId: string
  ): IDraftPoolItem {
    const itemIndex = session.items.findIndex((i) => i.itemId === itemId);
    if (itemIndex === -1) {
      throw new Error(`ITEM_NOT_IN_DRAFT: Item ${itemId} is not available in the draft pool.`);
    }

    const item = session.items[itemIndex];

    // Check inventory capacity
    // Default constitution = 4 if not specified
    const constitution = player.cards?.biology_age?.metadata?.stats?.phys ?? 4;
    const capacity = getBackpackCapacity(constitution);

    const currentWeight = player.inventory.reduce((sum, i) => sum + (i.weight || 1) * (i.quantity || 1), 0);
    const currentSlots = player.inventory.reduce((sum, i) => sum + calculateItemSlots(i.weight || 1), 0);

    const neededSlots = calculateItemSlots(item.weight || 1);
    if (currentSlots + neededSlots > capacity.slots) {
      throw new Error(`INVENTORY_FULL: Player does not have enough slots (max ${capacity.slots}).`);
    }

    if (currentWeight + item.weight > capacity.maxWeight) {
      throw new Error(`WEIGHT_LIMIT_EXCEEDED: Player exceeds maximum weight limit (max ${capacity.maxWeight} kg).`);
    }

    // Transfer item
    session.items.splice(itemIndex, 1);
    player.inventory.push({ ...item });
    session.picks[player.playerId] = itemId;

    return item;
  }

  public static burnRemaining(session: ILootDraftSession): IDraftPoolItem[] {
    session.burnedItems.push(...session.items);
    session.items = [];
    return session.burnedItems;
  }
}
