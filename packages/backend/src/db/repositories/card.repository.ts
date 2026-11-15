import { Db } from 'mongodb';
import { ICardDocument, CardCategory, CardOriginTag } from '@bunker/shared/types';
import { ALL_CARDS, craftRecipes } from '@bunker/shared/cards';

export interface CardFilterOptions {
  category?: string;
  type?: string;
  originTag?: string;
  tags?: string;
  limit?: number;
  offset?: number;
}

export class CardRepository {
  private static cardMap = new Map<string, ICardDocument>();

  static {
    for (const card of ALL_CARDS) {
      CardRepository.cardMap.set(card.cardId, card);
    }
  }

  constructor(private db: Db | null = null) {}

  public setDb(db: Db | null): void {
    this.db = db;
  }

  public async findAll(options: CardFilterOptions = {}): Promise<{ cards: ICardDocument[]; total: number }> {
    const limit = Math.min(options.limit ?? 20, 100);
    const offset = Math.max(options.offset ?? 0, 0);
    const targetCategory = options.category || options.type;
    const targetTag = options.originTag || options.tags;

    if (this.db) {
      const query: Record<string, any> = {};
      if (targetCategory) query.category = targetCategory;
      if (targetTag) query.originTag = targetTag.replace(/[\[\]]/g, '');

      const total = await this.db.collection<ICardDocument>('cards').countDocuments(query);
      const cards = await this.db
        .collection<ICardDocument>('cards')
        .find(query)
        .skip(offset)
        .limit(limit)
        .toArray();

      if (total > 0) {
        return { cards, total };
      }
    }

    // Fallback to static master dataset
    let filtered = ALL_CARDS.slice();
    if (targetCategory) {
      filtered = filtered.filter((c) => c.category === targetCategory);
    }
    if (targetTag) {
      const cleanTag = targetTag.replace(/[\[\]]/g, '').toUpperCase();
      filtered = filtered.filter((c) => c.originTag.toUpperCase() === cleanTag);
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return { cards: paginated, total };
  }

  public async findById(cardId: string): Promise<ICardDocument | null> {
    if (this.db) {
      const found = await this.db.collection<ICardDocument>('cards').findOne({ cardId });
      if (found) return found;
    }
    return CardRepository.cardMap.get(cardId) || null;
  }

  public async findByCategory(category: CardCategory): Promise<ICardDocument[]> {
    if (this.db) {
      const found = await this.db.collection<ICardDocument>('cards').find({ category }).toArray();
      if (found.length > 0) return found;
    }
    return ALL_CARDS.filter((c) => c.category === category);
  }

  public async getProfessions(): Promise<ICardDocument[]> {
    return this.findByCategory('profession');
  }

  public async getCraftRecipes(): Promise<any[]> {
    return [...craftRecipes];
  }

  public async getEventsCatalog(category?: string): Promise<ICardDocument[]> {
    const threats = await this.findByCategory('threat');
    const catastrophes = await this.findByCategory('catastrophe');
    const combined = [...catastrophes, ...threats];
    if (category) {
      return combined.filter((e) => e.category === category);
    }
    return combined;
  }
}
