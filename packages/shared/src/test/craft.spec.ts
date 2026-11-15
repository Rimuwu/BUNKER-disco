import { describe, it, expect } from 'vitest';
import { craftRecipes } from '../cards/craft_recipes.data.js';
import { CARDS_BY_ID } from '../cards/index.js';
import { CraftRecipeSchema } from '../validation/craft.schema.js';

describe('Crafting Recipes (20 recipes)', () => {
  it('contains exactly 20 crafting recipes per docs/cards/items.md', () => {
    expect(craftRecipes.length).toBe(20);
  });

  it('guarantees unique recipe IDs', () => {
    const ids = craftRecipes.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(20);
  });

  it('validates every recipe against CraftRecipeSchema', () => {
    for (const recipe of craftRecipes) {
      const parsed = CraftRecipeSchema.safeParse(recipe);
      expect(parsed.success).toBe(true);
    }
  });

  it('guarantees that ingredient1Id and ingredient2Id exist in the items deck', () => {
    for (const recipe of craftRecipes) {
      const ing1 = CARDS_BY_ID.get(recipe.ingredient1Id);
      const ing2 = CARDS_BY_ID.get(recipe.ingredient2Id);

      expect(ing1, `Recipe ${recipe.id}: ingredient1Id ${recipe.ingredient1Id} not found`).toBeDefined();
      expect(ing2, `Recipe ${recipe.id}: ingredient2Id ${recipe.ingredient2Id} not found`).toBeDefined();

      expect(ing1?.category).toBe('item');
      expect(ing2?.category).toBe('item');
    }
  });

  it('ensures every recipe has descriptive result names, an icon, and mechanical effects', () => {
    for (const recipe of craftRecipes) {
      expect(recipe.resultName.trim().length).toBeGreaterThan(0);
      expect(recipe.resultNameEn.trim().length).toBeGreaterThan(0);
      expect(recipe.icon.trim().length).toBeGreaterThan(0);
      expect(recipe.mechanicalEffect.trim().length).toBeGreaterThan(0);
    }
  });
});
