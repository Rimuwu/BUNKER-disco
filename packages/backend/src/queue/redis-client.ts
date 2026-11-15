import { Redis } from 'ioredis';
import { config } from '../config.js';

let redisInstance: Redis | null = null;
let isMockActive = false;

async function createMockClient(): Promise<Redis> {
  try {
    const { default: RedisMock } = await import('ioredis-mock');
    return new (RedisMock as any)() as unknown as Redis;
  } catch (e) {
    throw new Error('Redis connection failed and ioredis-mock fallback failed: ' + (e as Error).message);
  }
}

export async function createRedisClient(url = config.redisUrl, preferMock = false): Promise<Redis> {
  if (preferMock) {
    isMockActive = true;
    return createMockClient();
  }

  try {
    const client = new Redis(url, {
      maxRetriesPerRequest: null,
      connectTimeout: 5000,
      retryStrategy: (times) => Math.min(times * 200, 2000),
      lazyConnect: true,
    });

    await client.connect();
    isMockActive = false;
    return client;
  } catch (err) {
    if (config.env === 'test' || preferMock) {
      isMockActive = true;
      return createMockClient();
    }
    console.warn(`[RedisClient] Could not connect to live Redis at ${url}: ${(err as Error).message}`);
    try {
      const mock = await createMockClient();
      isMockActive = true;
      console.warn('[RedisClient] Falling back to in-memory Redis mock.');
      return mock;
    } catch {
      throw err;
    }
  }
}

export async function getRedisClient(): Promise<Redis> {
  if (!redisInstance) {
    redisInstance = await createRedisClient();
  }
  return redisInstance;
}

export function isRedisMocked(): boolean {
  return isMockActive;
}

export async function disconnectRedis(): Promise<void> {
  if (redisInstance) {
    try {
      await redisInstance.quit();
    } catch {
      // ignore
    }
    redisInstance = null;
  }
}
