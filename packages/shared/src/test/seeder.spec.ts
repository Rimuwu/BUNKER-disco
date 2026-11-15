import { describe, it, expect, vi } from 'vitest';
import type { Db, Collection } from 'mongodb';
import { seedCards } from '../seed/seeder.js';
import { ALL_CARDS } from '../cards/index.js';

describe('MongoDB Seeder (seedCards)', () => {
  it('creates required indexes and performs idempotent bulk upsert', async () => {
    const createdIndexes: Array<{ spec: any; options?: any }> = [];
    let bulkWriteOperations: any[] = [];

    const mockCollection = {
      createIndex: vi.fn(async (spec: any, options?: any) => {
        createdIndexes.push({ spec, options });
        return 'index_name';
      }),
      bulkWrite: vi.fn(async (operations: any[], options?: any) => {
        bulkWriteOperations = operations;
        return {
          upsertedCount: operations.length,
          modifiedCount: 0,
          matchedCount: 0
        };
      })
    } as unknown as Collection;

    const mockDb = {
      collection: vi.fn((name: string) => {
        if (name === 'cards') return mockCollection;
        throw new Error(`Unexpected collection: ${name}`);
      })
    } as unknown as Db;

    const result = await seedCards(mockDb);

    // 1. Verify target collection queried
    expect(mockDb.collection).toHaveBeenCalledWith('cards');

    // 2. Verify index creation
    expect(mockCollection.createIndex).toHaveBeenCalledTimes(2);
    expect(createdIndexes[0]).toEqual({ spec: { cardId: 1 }, options: { unique: true } });
    expect(createdIndexes[1]).toEqual({ spec: { category: 1, originTag: 1 }, options: undefined });

    // 3. Verify bulkWrite operations
    expect(mockCollection.bulkWrite).toHaveBeenCalledTimes(1);
    expect(bulkWriteOperations.length).toBe(ALL_CARDS.length);

    // Spot-check first and last operation format
    const firstOp = bulkWriteOperations[0];
    expect(firstOp.updateOne).toBeDefined();
    expect(firstOp.updateOne.filter).toEqual({ cardId: ALL_CARDS[0].cardId });
    expect(firstOp.updateOne.upsert).toBe(true);
    expect(firstOp.updateOne.update.$set.name).toBe(ALL_CARDS[0].name);

    // 4. Verify result statistics
    expect(result.seeded).toBe(ALL_CARDS.length);
    expect(result.tags.BASE).toBeGreaterThan(0);
    expect(result.tags.ALPHA).toBeGreaterThan(0);
    expect(result.tags.EXPANSION).toBeGreaterThan(0);
    expect(result.tags.NEW).toBeGreaterThan(0);

    const totalFromTags = Object.values(result.tags).reduce((a, b) => a + b, 0);
    expect(totalFromTags).toBe(ALL_CARDS.length);

    const totalFromCategories = Object.values(result.categories).reduce((a, b) => a + b, 0);
    expect(totalFromCategories).toBe(ALL_CARDS.length);
  });

  it('proves idempotency on consecutive seed runs', async () => {
    let callCount = 0;
    const mockCollection = {
      createIndex: vi.fn(async () => 'index_name'),
      bulkWrite: vi.fn(async (operations: any[]) => {
        callCount++;
        return {
          upsertedCount: callCount === 1 ? operations.length : 0,
          modifiedCount: callCount === 1 ? 0 : operations.length,
          matchedCount: callCount === 1 ? 0 : operations.length
        };
      })
    } as unknown as Collection;

    const mockDb = {
      collection: vi.fn(() => mockCollection)
    } as unknown as Db;

    // Run 1
    const res1 = await seedCards(mockDb);
    // Run 2
    const res2 = await seedCards(mockDb);

    expect(res1.seeded).toBe(res2.seeded);
    expect(res1.tags).toEqual(res2.tags);
    expect(res1.categories).toEqual(res2.categories);
  });
});
