import { IPlayerDocument } from '../../db/repositories/player.repository.js';
import { craftRecipes, getCardById } from '@bunker/shared';

export interface ICraftQueueItem {
  recipeId: string;
  daysRemaining: number;
  craftedBy: string;
}

export class CraftingEngine {
  public static queueRecipe(
    player: IPlayerDocument,
    recipeId: string,
    isWorkshopOnline = true
  ): ICraftQueueItem {
    if (!isWorkshopOnline) {
      throw new Error('WORKSHOP_OFFLINE: Workshop room is inactive or powered down.');
    }

    const recipe = craftRecipes.find((r) => r.id === recipeId);
    if (!recipe) {
      throw new Error(`RECIPE_NOT_FOUND: Craft recipe "${recipeId}" does not exist.`);
    }

    const ing1Id = recipe.ingredient1Id;
    const ing2Id = recipe.ingredient2Id;

    // Check if player has ingredient 1
    const idx1 = player.inventory.findIndex((i) => i.itemId === ing1Id);
    if (idx1 === -1) {
      throw new Error(`MISSING_INGREDIENT: Missing required item "${ing1Id}".`);
    }

    // Check if player has ingredient 2
    // If same item required twice, must find different index
    const idx2 = player.inventory.findIndex((i, idx) => i.itemId === ing2Id && idx !== idx1);
    if (idx2 === -1) {
      throw new Error(`MISSING_INGREDIENT: Missing required item "${ing2Id}".`);
    }

    // Remove ingredients from inventory
    // Remove higher index first to avoid shifting lower index
    const higher = Math.max(idx1, idx2);
    const lower = Math.min(idx1, idx2);
    player.inventory.splice(higher, 1);
    player.inventory.splice(lower, 1);

    return {
      recipeId,
      daysRemaining: 1,
      craftedBy: player.playerId,
    };
  }

  public static processQueueTick(
    queue: ICraftQueueItem[],
    players: IPlayerDocument[]
  ): {
    updatedQueue: ICraftQueueItem[];
    completedItems: Array<{
      recipeId: string;
      outputCardId: string;
      outputName: string;
      craftedBy: string;
    }>;
  } {
    const updatedQueue: ICraftQueueItem[] = [];
    const completedItems: Array<{
      recipeId: string;
      outputCardId: string;
      outputName: string;
      craftedBy: string;
    }> = [];

    for (const item of queue) {
      const remaining = item.daysRemaining - 1;
      if (remaining <= 0) {
        const recipe = craftRecipes.find((r) => r.id === item.recipeId);
        if (recipe) {
          const crafter = players.find((p) => p.playerId === item.craftedBy);
          const outputCardId = recipe.resultItemId || `item_${recipe.id}`;
          const outputCard = getCardById(outputCardId);

          if (crafter) {
            crafter.inventory.push({
              itemId: outputCardId,
              name: recipe.resultName,
              weight: outputCard?.metadata?.weight ?? 2,
              quantity: 1,
            });
          }

          completedItems.push({
            recipeId: item.recipeId,
            outputCardId,
            outputName: recipe.resultName,
            craftedBy: item.craftedBy,
          });
        }
      } else {
        updatedQueue.push({ ...item, daysRemaining: remaining });
      }
    }

    return { updatedQueue, completedItems };
  }
}
