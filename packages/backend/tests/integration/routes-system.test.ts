import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestApp } from '../helpers/test-app.js';
import { BunkerServerInstance } from '../../src/api/server.js';

describe('Integration: System Health & Metrics Endpoints', () => {
  let app: BunkerServerInstance;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health returns 200 and reports services status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const data = body.data || body;
    expect(data.status).toBe('ok');
    expect(data.services.redis).toBe('healthy');
  });

  it('GET /version returns API version info', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/version',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const data = body.data || body;
    expect(data.version).toBe('1.0.0');
    expect(data.build).toBe('milestone-2');
  });

  it('GET /metrics returns runtime server metrics', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/metrics',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const data = body.data || body;
    expect(data.memoryUsage).toBeDefined();
    expect(data.queueDepth).toBeDefined();
  });
});
