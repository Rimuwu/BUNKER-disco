import { describe, it, expect } from 'vitest';
import {
  ALL_CARDS,
  CARDS_BY_ID,
  CARDS_BY_CATEGORY,
  getCardById,
  getCardsByCategory,
  getCardsByOriginTag,
  professionsDeck,
  biologyAgeDeck,
  biologyGenderDeck,
  healthDeck,
  hobbiesDeck,
  itemsDeck,
  factsDeck,
  specialConditionsDeck,
  catastrophesDeck,
  threatsDeck,
  bunkerRoomsDeck,
  bunkerDefectsDeck,
  bunkerArchetypesDeck,
  superpowersDeck,
  phobiasDeck,
  characterDeck
} from '../cards/index.js';
import { CardCategory, CardOriginTag } from '../types/card.types.js';

describe('Master Card Catalog (ALL_CARDS)', () => {
  it('contains at least 528 cards per project specification (actual total: 586)', () => {
    expect(ALL_CARDS.length).toBeGreaterThanOrEqual(528);
    expect(ALL_CARDS.length).toBe(586);
  });

  it('guarantees unique cardId across all 586 cards', () => {
    const idSet = new Set<string>();
    const duplicates: string[] = [];

    for (const card of ALL_CARDS) {
      if (idSet.has(card.cardId)) {
        duplicates.push(card.cardId);
      }
      idSet.add(card.cardId);
    }

    expect(duplicates).toEqual([]);
    expect(CARDS_BY_ID.size).toBe(ALL_CARDS.length);
  });

  it('strictly enforces valid CardOriginTag on every single card per GEMINI.md § 2', () => {
    const validTags = new Set<CardOriginTag>(['BASE', 'ALPHA', 'EXPANSION', 'NEW']);

    for (const card of ALL_CARDS) {
      expect(validTags.has(card.originTag)).toBe(true);
    }

    const tagCounts: Record<CardOriginTag, number> = {
      BASE: 0,
      ALPHA: 0,
      EXPANSION: 0,
      NEW: 0
    };

    for (const card of ALL_CARDS) {
      tagCounts[card.originTag]++;
    }

    // Verify all tags have positive representation
    expect(tagCounts.BASE).toBeGreaterThan(0);
    expect(tagCounts.ALPHA).toBeGreaterThan(0);
    expect(tagCounts.EXPANSION).toBeGreaterThan(0);
    expect(tagCounts.NEW).toBeGreaterThan(0);
  });

  it('populates all 12 deck catalogs with non-empty genuine data', () => {
    expect(professionsDeck.length).toBe(51);
    expect(biologyAgeDeck.length).toBe(16);
    expect(biologyGenderDeck.length).toBe(9);
    expect(healthDeck.length).toBe(48);
    expect(hobbiesDeck.length).toBe(44);
    expect(itemsDeck.length).toBe(126);
    expect(factsDeck.length).toBe(66);
    expect(specialConditionsDeck.length).toBe(30);
    expect(catastrophesDeck.length).toBe(15);
    expect(threatsDeck.length).toBe(25);
    expect(bunkerRoomsDeck.length).toBe(16);
    expect(bunkerDefectsDeck.length).toBe(8);
    expect(bunkerArchetypesDeck.length).toBe(6);
    expect(superpowersDeck.length).toBe(50);
    expect(phobiasDeck.length).toBe(38);
    expect(characterDeck.length).toBe(38);
  });

  it('ensures all cards have non-empty name, nameEn, description, and valid category', () => {
    for (const card of ALL_CARDS) {
      expect(card.name.trim().length).toBeGreaterThan(0);
      expect(card.nameEn.trim().length).toBeGreaterThan(0);
      expect(card.description.trim().length).toBeGreaterThan(0);
      expect(card.category).toBeDefined();
    }
  });

  it('enforces item inventory rules (weight 5 occupies 2 slots, weight 1-4 occupies 1 slot)', () => {
    for (const item of itemsDeck) {
      const weight = item.metadata?.weight;
      const slots = item.metadata?.slotsOccupied;
      expect(weight).toBeGreaterThanOrEqual(1);
      expect(weight).toBeLessThanOrEqual(5);

      if (weight === 5) {
        expect(slots).toBe(2);
      } else {
        expect(slots).toBe(1);
      }
    }
  });

  it('identifies the unique quest item: Секретный чемодан с кодовым замком', () => {
    const questItems = itemsDeck.filter((it) => it.metadata?.isQuestItem === true);
    expect(questItems.length).toBe(1);
    expect(questItems[0].cardId).toBe('item_secret_case');
    expect(questItems[0].name).toContain('Секретный чемодан с кодовым замком');
    expect(questItems[0].metadata?.weight).toBe(5);
    expect(questItems[0].metadata?.slotsOccupied).toBe(2);
  });

  it('provides reliable getter functions', () => {
    const doctor = getCardById('prof_doctor');
    expect(doctor).toBeDefined();
    expect(doctor?.name).toBe('Врач');
    expect(doctor?.category).toBe('profession');

    const professions = getCardsByCategory('profession');
    expect(professions.length).toBe(51);

    const baseCards = getCardsByOriginTag('BASE');
    expect(baseCards.length).toBeGreaterThan(100);
  });
});
