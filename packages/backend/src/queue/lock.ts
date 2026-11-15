import { Redis } from 'ioredis';
import { REDIS_KEYS } from './producer.js';

const RELEASE_LOCK_LUA = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

const RENEW_LOCK_LUA = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("expire", KEYS[1], ARGV[2])
else
  return 0
end
`;

export class DistributedLock {
  constructor(private redis: Redis) {}

  public async acquireLock(
    roomId: string,
    ownerToken?: string,
    ttlSeconds = 30
  ): Promise<{ acquired: boolean; token: string }> {
    const lockKey = REDIS_KEYS.LOCK(roomId);
    const token = ownerToken || `worker_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // SET key token EX ttl NX
    const result = await this.redis.set(lockKey, token, 'EX', ttlSeconds, 'NX');
    const acquired = result === 'OK';

    return { acquired, token };
  }

  public async releaseLock(roomId: string, ownerToken: string): Promise<boolean> {
    const lockKey = REDIS_KEYS.LOCK(roomId);
    try {
      const result = await this.redis.eval(RELEASE_LOCK_LUA, 1, lockKey, ownerToken);
      return Number(result) === 1;
    } catch {
      // Fallback if eval is not supported by mock
      const current = await this.redis.get(lockKey);
      if (current === ownerToken) {
        await this.redis.del(lockKey);
        return true;
      }
      return false;
    }
  }

  public async renewLock(roomId: string, ownerToken: string, ttlSeconds = 30): Promise<boolean> {
    const lockKey = REDIS_KEYS.LOCK(roomId);
    try {
      const result = await this.redis.eval(RENEW_LOCK_LUA, 1, lockKey, ownerToken, ttlSeconds);
      return Number(result) === 1;
    } catch {
      // Fallback for in-memory mock
      const current = await this.redis.get(lockKey);
      if (current === ownerToken) {
        await this.redis.expire(lockKey, ttlSeconds);
        return true;
      }
      return false;
    }
  }

  public async isLocked(roomId: string): Promise<boolean> {
    const lockKey = REDIS_KEYS.LOCK(roomId);
    const exists = await this.redis.exists(lockKey);
    return exists === 1;
  }

  public async getLockOwner(roomId: string): Promise<string | null> {
    const lockKey = REDIS_KEYS.LOCK(roomId);
    return this.redis.get(lockKey);
  }
}
