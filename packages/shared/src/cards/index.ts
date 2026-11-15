import { ICardDocument, CardCategory, CardOriginTag } from '../types/card.types.js';
import { professionsDeck } from './professions.data.js';
import { biologyAgeDeck, biologyGenderDeck } from './biology.data.js';
import { healthDeck } from './health.data.js';
import { hobbiesDeck } from './hobbies.data.js';
import { itemsDeck } from './items.data.js';
import { factsDeck } from './facts.data.js';
import { specialConditionsDeck } from './special_conditions.data.js';
import { catastrophesDeck, threatsDeck } from './catastrophes_threats.data.js';
import { bunkerRoomsDeck, bunkerDefectsDeck, bunkerArchetypesDeck } from './bunker.data.js';
import { superpowersDeck } from './superpowers.data.js';
import { phobiasDeck } from './phobias.data.js';
import { characterDeck } from './character.data.js';

export {
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
};

export * from './synergies.data.js';
export * from './craft_recipes.data.js';

/**
 * Master catalog containing all genuine cards across all 12 decks.
 */
export const ALL_CARDS: readonly ICardDocument[] = Object.freeze([
  ...professionsDeck,
  ...biologyAgeDeck,
  ...biologyGenderDeck,
  ...healthDeck,
  ...hobbiesDeck,
  ...itemsDeck,
  ...factsDeck,
  ...specialConditionsDeck,
  ...catastrophesDeck,
  ...threatsDeck,
  ...bunkerRoomsDeck,
  ...bunkerDefectsDeck,
  ...bunkerArchetypesDeck,
  ...superpowersDeck,
  ...phobiasDeck,
  ...characterDeck
]);

/**
 * Fast lookup map by cardId.
 */
export const CARDS_BY_ID: ReadonlyMap<string, ICardDocument> = new Map(
  ALL_CARDS.map(card => [card.cardId, card])
);

/**
 * Grouped lookup map by CardCategory.
 */
export const CARDS_BY_CATEGORY: ReadonlyMap<CardCategory, readonly ICardDocument[]> = (() => {
  const map = new Map<CardCategory, ICardDocument[]>();
  for (const card of ALL_CARDS) {
    let list = map.get(card.category);
    if (!list) {
      list = [];
      map.set(card.category, list);
    }
    list.push(card);
  }
  return map as ReadonlyMap<CardCategory, readonly ICardDocument[]>;
})();

/**
 * Get card by its unique identifier.
 */
export function getCardById(cardId: string): ICardDocument | undefined {
  return CARDS_BY_ID.get(cardId);
}

/**
 * Get cards belonging to a specific category.
 */
export function getCardsByCategory(category: CardCategory): readonly ICardDocument[] {
  return CARDS_BY_CATEGORY.get(category) ?? [];
}

/**
 * Get cards belonging to a specific origin tag ('BASE' | 'ALPHA' | 'EXPANSION' | 'NEW').
 */
export function getCardsByOriginTag(tag: CardOriginTag): readonly ICardDocument[] {
  return ALL_CARDS.filter(card => card.originTag === tag);
}
