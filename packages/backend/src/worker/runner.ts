import { config } from '../config.js';
import { connectMongo, disconnectMongo, createRepositories } from '../db/index.js';
import { getRedisClient, disconnectRedis } from '../queue/redis-client.js';
import { QueueProducer } from '../queue/producer.js';
import { QueueConsumer } from '../queue/consumer.js';
import { DistributedLock } from '../queue/lock.js';
import { TaskWorker } from './TaskWorker.js';
import { EventBroadcaster } from './EventBroadcaster.js';

async function runWorker() {
  console.log(`[BUNKER-disco Worker] Initializing worker process in ${config.env} mode...`);

  try {
    // 1. Connect MongoDB
    const db = await connectMongo();
    if (db) {
      console.log(`[BUNKER-disco Worker] Connected to MongoDB database: ${config.mongoDbName}`);
    } else {
      console.warn('[BUNKER-disco Worker] Warning: Running with in-memory Mongo repository fallback.');
    }
    const repositories = createRepositories(db);

    // 2. Connect Redis
    const redis = await getRedisClient();
    console.log('[BUNKER-disco Worker] Redis client connected.');

    // 3. Queue Services & Locks
    const producer = new QueueProducer(redis);
    const consumer = new QueueConsumer(redis);
    const lock = new DistributedLock(redis);

    // 4. Broadcaster (Using Redis Pub/Sub)
    const broadcaster = new EventBroadcaster({
      to: (room: string) => ({
        emit: (event: string, payload: any) => {
          const channel = room.startsWith('room:') ? room : `room:${room}`;
          redis.publish(channel, JSON.stringify({ event, payload })).catch(() => {});
        },
      }),
    } as any);

    // 5. Task Worker
    const worker = new TaskWorker(redis, repositories, broadcaster, consumer, producer, lock, {
      lockTtlSeconds: 30,
      pollIntervalMs: 50,
    });

    await worker.start();
    console.log(`[BUNKER-disco Worker] Worker started successfully (Worker ID: ${worker.getWorkerId()}). Listening for room tasks...`);

    // 6. Graceful Shutdown
    const shutdown = async (signal: string) => {
      console.log(`[BUNKER-disco Worker] Received ${signal}. Shutting down worker...`);
      await worker.stop();
      await disconnectRedis();
      await disconnectMongo();
      console.log('[BUNKER-disco Worker] Shutdown complete.');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[BUNKER-disco Worker] Fatal worker startup error:', err);
    process.exit(1);
  }
}

// Auto-run when invoked directly
if (process.argv[1] && (process.argv[1].endsWith('runner.ts') || process.argv[1].endsWith('runner.js'))) {
  runWorker();
}
