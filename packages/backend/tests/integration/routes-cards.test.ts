import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestApp } from '../helpers/test-app.js';
import { BunkerServerInstance } from '../../src/api/server.js';

describe('Integration: Cards REST Endpoints', () => {
  let app: BunkerServerInstance;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /cards returns paginated catalog with total', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/cards?limit=10&offset=0',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const data = body.data || body;
    expect(data.cards).toHaveLength(10);
    expect(data.total).toBeGreaterThan(500); // 528 master cards
  });

  it('GET /cards filters by category and originTag', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/cards?category=profession&originTag=BASE',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const data = body.data || body;
    expect(data.cards.length).toBeGreaterThan(0);
    for (const card of data.cards) {
      expect(card.category).toBe('profession');
      expect(card.originTag).toBe('BASE');
    }
  });

  it('GET /cards/professions returns all professions', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/cards/professions',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const data = body.data || body;
    expect(data.professions.length).toBeGreaterThanOrEqual(45);
  });

  it('GET /cards/craft-recipes returns 20 crafting recipes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/cards/craft-recipes',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const data = body.data || body;
    expect(data.recipes).toHaveLength(20);
  });

  it('GET /cards/:cardId retrieves specific card', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/cards/prof_surgeon',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const data = body.data || body;
    expect(data.cardId).toBe('prof_surgeon');
    expect(data.originTag).toBe('BASE');
  });

  it('GET /cards/:cardId returns 404 for unknown card', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/cards/nonexistent_card_xyz',
    });

    expect(res.statusCode).toBe(404);
  });
});
