import { Redis } from 'ioredis';
import { IGameTask } from '@bunker/shared/types';

export const REDIS_KEYS = {
  ROOM_QUEUE: (roomId: string) => `bunker:room:${roomId}`,
  GLOBAL_QUEUE: 'bunker:global',
  DEAD_LETTER_QUEUE: 'bunker:dead_letter',
  ROOM_META: (roomId: string) => `bunker:room:${roomId}:meta`,
  LOCK: (roomId: string) => `bunker:lock:${roomId}`,
  TASK_STATUS: (taskId: string) => `bunker:task:${taskId}`,
};

export class QueueProducer {
  constructor(private redis: Redis) {}

  public async enqueueTask(task: IGameTask): Promise<{
    taskId: string;
    status: 'queued';
    estimatedProcessingMs: number;
    queueDepth: number;
  }> {
    const queueKey = REDIS_KEYS.ROOM_QUEUE(task.roomId);
    const serialized = JSON.stringify(task);

    // Atomic push to per-room queue
    const queueDepth = await this.redis.rpush(queueKey, serialized);

    // Also push to global queue so background workers pick it up immediately
    await this.redis.rpush(REDIS_KEYS.GLOBAL_QUEUE, serialized);

    // Cache task status
    const statusObj = {
      taskId: task.taskId,
      type: task.type,
      roomId: task.roomId,
      playerId: task.playerId,
      status: 'queued',
      queuedAt: task.queuedAt,
    };
    await this.redis.set(REDIS_KEYS.TASK_STATUS(task.taskId), JSON.stringify(statusObj), 'EX', 3600);

    return {
      taskId: task.taskId,
      status: 'queued',
      estimatedProcessingMs: 50 * Math.max(1, queueDepth),
      queueDepth,
    };
  }

  public async enqueueGlobal(task: IGameTask): Promise<{ taskId: string; status: 'queued' }> {
    const serialized = JSON.stringify(task);
    await this.redis.rpush(REDIS_KEYS.GLOBAL_QUEUE, serialized);

    await this.redis.set(
      REDIS_KEYS.TASK_STATUS(task.taskId),
      JSON.stringify({ taskId: task.taskId, status: 'queued', queuedAt: task.queuedAt }),
      'EX',
      3600
    );

    return {
      taskId: task.taskId,
      status: 'queued',
    };
  }

  public async getTaskStatus(taskId: string): Promise<any | null> {
    const raw = await this.redis.get(REDIS_KEYS.TASK_STATUS(taskId));
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return { taskId, status: 'unknown', raw };
    }
  }

  public async updateTaskStatus(taskId: string, status: string, result?: any): Promise<void> {
    const current = (await this.getTaskStatus(taskId)) || { taskId };
    const updated = {
      ...current,
      status,
      result,
      updatedAt: Date.now(),
    };
    await this.redis.set(REDIS_KEYS.TASK_STATUS(taskId), JSON.stringify(updated), 'EX', 3600);
  }

  public async getQueueLength(roomId: string): Promise<number> {
    return this.redis.llen(REDIS_KEYS.ROOM_QUEUE(roomId));
  }

  public async getGlobalQueueLength(): Promise<number> {
    return this.redis.llen(REDIS_KEYS.GLOBAL_QUEUE);
  }
}
