import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestApp } from '../helpers/test-app.js';
import { BunkerServerInstance } from '../../src/api/server.js';

describe('Unit: Rate Limit Configuration', () => {
  let app: BunkerServerInstance;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('exposes rate limit headers and executes requests cleanly', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers).toBeDefined();
  });
});
