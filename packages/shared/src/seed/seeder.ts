import type { Db, AnyBulkWriteOperation } from 'mongodb';
import { ICardDocument, CardOriginTag, CardCategory } from '../types/card.types.js';
import { ALL_CARDS } from '../cards/index.js';

export interface SeedResult {
  seeded: number;
  tags: Record<CardOriginTag, number>;
  categories: Record<CardCategory, number>;
}

/**
 * Idempotently seeds all 586 cards into the MongoDB 'cards' collection.
 * Uses bulkWrite with updateOne and upsert: true keyed on unique cardId.
 */
export async function seedCards(db: Db): Promise<SeedResult> {
  const collection = db.collection<ICardDocument>('cards');

  // 1. Ensure required indexes
  await collection.createIndex({ cardId: 1 }, { unique: true });
  await collection.createIndex({ category: 1, originTag: 1 });

  if (!ALL_CARDS || ALL_CARDS.length === 0) {
    throw new Error('[seedCards] No cards found in ALL_CARDS master catalog.');
  }

  // 2. Prepare idempotent bulk operations
  const operations: AnyBulkWriteOperation<ICardDocument>[] = ALL_CARDS.map((card) => ({
    updateOne: {
      filter: { cardId: card.cardId },
      update: {
        $set: {
          cardId: card.cardId,
          category: card.category,
          originTag: card.originTag,
          name: card.name,
          nameEn: card.nameEn,
          description: card.description,
          flavorText: card.flavorText,
          metadata: card.metadata ?? {}
        }
      },
      upsert: true
    }
  }));

  // 3. Execute bulk write
  await collection.bulkWrite(operations, { ordered: false });

  // 4. Calculate tag and category tallies
  const tags: Record<CardOriginTag, number> = {
    BASE: 0,
    ALPHA: 0,
    EXPANSION: 0,
    NEW: 0
  };

  const categories = {} as Record<CardCategory, number>;

  for (const card of ALL_CARDS) {
    tags[card.originTag] = (tags[card.originTag] || 0) + 1;
    categories[card.category] = (categories[card.category] || 0) + 1;
  }

  return {
    seeded: ALL_CARDS.length,
    tags,
    categories
  };
}
