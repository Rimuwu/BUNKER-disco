import { buildServer, BunkerServerInstance } from '../../src/api/server.js';
import { createRepositories } from '../../src/db/index.js';
import { createQueueSystem } from '../../src/queue/index.js';
import { createRedisClient } from '../../src/queue/redis-client.js';

export async function createTestApp(): Promise<BunkerServerInstance> {
  const repositories = createRepositories();
  const redis = await createRedisClient(undefined, true); // force mock for unit tests
  const queueSystem = createQueueSystem(redis);

  const app = await buildServer({
    repositories,
    queueSystem,
    jwtSecret: 'test-jwt-secret-key-12345',
    logger: false,
    preferMock: true,
  });

  await app.ready();
  return app;
}
