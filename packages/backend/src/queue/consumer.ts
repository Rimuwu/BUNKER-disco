import { Redis } from 'ioredis';
import { IGameTask } from '@bunker/shared/types';
import { REDIS_KEYS } from './producer.js';

export class QueueConsumer {
  constructor(private redis: Redis) {}

  public async popRoomTask(roomId: string, timeoutSeconds = 5): Promise<IGameTask | null> {
    const queueKey = REDIS_KEYS.ROOM_QUEUE(roomId);
    try {
      try {
        const result = await this.redis.blpop(queueKey, timeoutSeconds);
        if (result && result[1]) {
          return JSON.parse(result[1]) as IGameTask;
        }
        if (result === null) return null;
      } catch (err: any) {
        if (err?.message?.includes('Unsupported command: "blpop"') || err instanceof TypeError) {
          const raw = await this.redis.lpop(queueKey);
          if (!raw) return null;
          return JSON.parse(raw) as IGameTask;
        }
        throw err;
      }
      return null;
    } catch {
      return null;
    }
  }

  public async popGlobalTask(timeoutSeconds = 5): Promise<IGameTask | null> {
    try {
      try {
        const result = await this.redis.blpop(REDIS_KEYS.GLOBAL_QUEUE, timeoutSeconds);
        if (result && result[1]) {
          return JSON.parse(result[1]) as IGameTask;
        }
        if (result === null) return null;
      } catch (err: any) {
        if (err?.message?.includes('Unsupported command: "blpop"') || err instanceof TypeError) {
          const raw = await this.redis.lpop(REDIS_KEYS.GLOBAL_QUEUE);
          if (!raw) return null;
          return JSON.parse(raw) as IGameTask;
        }
        throw err;
      }
      return null;
    } catch {
      return null;
    }
  }

  public async pushDeadLetter(task: IGameTask, error: any): Promise<void> {
    const deadTask = {
      ...task,
      deadLetteredAt: Date.now(),
      error: error instanceof Error ? error.message : String(error),
    };
    await this.redis.rpush(REDIS_KEYS.DEAD_LETTER_QUEUE, JSON.stringify(deadTask));
  }

  public async popDeadLetter(timeoutSeconds = 5): Promise<any | null> {
    try {
      try {
        const result = await this.redis.blpop(REDIS_KEYS.DEAD_LETTER_QUEUE, timeoutSeconds);
        if (result && result[1]) {
          return JSON.parse(result[1]);
        }
        if (result === null) return null;
      } catch (err: any) {
        if (err?.message?.includes('Unsupported command: "blpop"') || err instanceof TypeError) {
          const raw = await this.redis.lpop(REDIS_KEYS.DEAD_LETTER_QUEUE);
          if (!raw) return null;
          return JSON.parse(raw);
        }
        throw err;
      }
      return null;
    } catch {
      return null;
    }
  }
}
