import { describe, it, expect } from 'vitest';
import { professionSynergies } from '../cards/synergies.data.js';
import { CARDS_BY_ID } from '../cards/index.js';

describe('Profession Synergies (15 synergies)', () => {
  it('contains exactly 15 profession synergies per docs/cards/professions.md:467-484', () => {
    expect(professionSynergies.length).toBe(15);
  });

  it('guarantees unique synergy IDs', () => {
    const ids = professionSynergies.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(15);
  });

  it('guarantees that profession1Id and profession2Id exist in the professions deck', () => {
    for (const synergy of professionSynergies) {
      const prof1 = CARDS_BY_ID.get(synergy.profession1Id);
      const prof2 = CARDS_BY_ID.get(synergy.profession2Id);

      expect(prof1, `Synergy ${synergy.id}: profession1Id ${synergy.profession1Id} not found`).toBeDefined();
      expect(prof2, `Synergy ${synergy.id}: profession2Id ${synergy.profession2Id} not found`).toBeDefined();

      expect(prof1?.category).toBe('profession');
      expect(prof2?.category).toBe('profession');
    }
  });

  it('ensures each synergy defines clear description and bonusEffect', () => {
    for (const synergy of professionSynergies) {
      expect(synergy.description.trim().length).toBeGreaterThan(0);
      expect(synergy.bonusEffect).toBeDefined();
      expect(synergy.bonusEffect.customEffect.trim().length).toBeGreaterThan(0);
    }
  });
});
