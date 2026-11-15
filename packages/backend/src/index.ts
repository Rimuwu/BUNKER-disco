import { config } from './config.js';
import { connectMongo, disconnectMongo, ensureAllIndexes, createRepositories } from './db/index.js';
import { disconnectRedis } from './queue/index.js';
import { buildServer } from './api/server.js';

export * from './config.js';
export * from './db/index.js';
export * from './queue/index.js';
export * from './ws/index.js';
export * from './api/server.js';
export { TaskWorker, type TaskHandler, type WorkerContext, type TaskWorkerOptions, createAllTaskHandlers } from './worker/index.js';
export * from './engine/index.js';

async function main() {
  try {
    console.log(`[BUNKER-disco API] Starting in ${config.env} mode...`);

    // 1. Database Connection
    const db = await connectMongo();
    if (db) {
      console.log(`[BUNKER-disco API] Connected to MongoDB database: ${config.mongoDbName}`);
      try {
        await ensureAllIndexes(db);
        console.log('[BUNKER-disco API] MongoDB indexes ensured successfully.');
      } catch (idxErr) {
        console.warn('[BUNKER-disco API] Warning: could not ensure all indexes:', idxErr);
      }
    } else {
      console.warn('[BUNKER-disco API] MongoDB connection offline. Operating with resilient in-memory storage.');
    }

    // 2. Build Server
    const repositories = createRepositories(db);
    const app = await buildServer({
      repositories,
      logger: config.env === 'development',
    });

    // 3. Listen
    const address = await app.listen({
      port: config.port,
      host: config.host,
    });
    console.log(`[BUNKER-disco API] Server listening at ${address}`);
    console.log(`[BUNKER-disco API] Swagger docs available at ${address}/docs`);

    // 4. Graceful Shutdown
    const shutdown = async (signal: string) => {
      console.log(`[BUNKER-disco API] Received ${signal}. Gracefully shutting down...`);
      try {
        if (app.io) {
          app.io.close();
        }
        await app.close();
        await disconnectRedis();
        await disconnectMongo();
        console.log('[BUNKER-disco API] Shutdown complete.');
        process.exit(0);
      } catch (err) {
        console.error('[BUNKER-disco API] Error during shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[BUNKER-disco API] Fatal startup error:', err);
    process.exit(1);
  }
}

// Auto-run if executed directly
if (process.argv[1] && (process.argv[1].endsWith('index.ts') || process.argv[1].endsWith('index.js') || process.argv[1].endsWith('server.js'))) {
  main();
}
