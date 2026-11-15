import { Redis } from 'ioredis';
import { IGameTask, GameTaskType } from '@bunker/shared';
import { QueueConsumer } from '../queue/consumer.js';
import { QueueProducer, REDIS_KEYS } from '../queue/producer.js';
import { DistributedLock } from '../queue/lock.js';
import { Repositories } from '../db/index.js';
import { EventBroadcaster } from './EventBroadcaster.js';
import { createAllTaskHandlers } from './handlers/index.js';

export interface TaskHandler {
  handle(task: IGameTask, context: WorkerContext): Promise<any>;
}

export interface WorkerContext {
  redis: Redis;
  repositories: Repositories;
  broadcaster: EventBroadcaster;
  producer: QueueProducer;
  lock: DistributedLock;
}

export interface TaskWorkerOptions {
  workerId?: string;
  pollIntervalMs?: number;
  lockTtlSeconds?: number;
  maxRetries?: number;
}

export class TaskWorker {
  private workerId: string;
  private isRunning = false;
  private activeWatchdogs = new Map<string, NodeJS.Timeout>();
  private handlers = new Map<GameTaskType, TaskHandler>();
  private activeRoomLoops = new Set<string>();

  constructor(
    private redis: Redis,
    private repositories: Repositories,
    private broadcaster: EventBroadcaster,
    private consumer: QueueConsumer,
    private producer: QueueProducer,
    private lock: DistributedLock,
    private options: TaskWorkerOptions = {}
  ) {
    this.workerId = options.workerId || `worker_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    // Register all standard task handlers
    const defaultHandlers = createAllTaskHandlers();
    for (const [type, handler] of defaultHandlers.entries()) {
      this.handlers.set(type, handler);
    }
  }

  public registerHandler(type: GameTaskType, handler: TaskHandler): void {
    this.handlers.set(type, handler);
  }

  public getHandler(type: GameTaskType): TaskHandler | undefined {
    return this.handlers.get(type);
  }

  public getWorkerId(): string {
    return this.workerId;
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.runGlobalLoop().catch((err) => {
      console.error('[TaskWorker] Global consumer loop crashed:', err);
    });
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    this.activeRoomLoops.clear();

    // Clear all active watchdogs
    for (const [roomId, timer] of this.activeWatchdogs.entries()) {
      clearInterval(timer);
      this.activeWatchdogs.delete(roomId);
    }
  }

  /**
   * Executes a single task within a distributed lock, protected by a
   * lock renewal watchdog heartbeat, retry backoff, and dead-letter routing.
   */
  public async executeTask(task: IGameTask): Promise<any> {
    const handler = this.handlers.get(task.type);
    if (!handler) {
      throw new Error(`[TaskWorker] No handler registered for task type "${task.type}".`);
    }

    const { roomId, taskId } = task;
    const lockTtl = this.options.lockTtlSeconds || 30;

    // 1. Acquire Distributed Mutex Lock
    const { acquired, token } = await this.lock.acquireLock(roomId, this.workerId, lockTtl);
    if (!acquired) {
      // Re-enqueue task if lock held by another worker
      await this.redis.rpush(REDIS_KEYS.ROOM_QUEUE(roomId), JSON.stringify(task));
      return { deferred: true, reason: 'lock_held_by_peer' };
    }

    // 2. Start Lock Watchdog Heartbeat (renews every TTL / 3)
    const watchdogInterval = Math.max(1000, (lockTtl * 1000) / 3);
    const watchdog = setInterval(async () => {
      try {
        await this.lock.renewLock(roomId, token, lockTtl);
      } catch (err) {
        console.warn(`[TaskWorker] Watchdog failed to renew lock for room ${roomId}:`, err);
      }
    }, watchdogInterval);
    this.activeWatchdogs.set(roomId, watchdog);

    try {
      // 3. Mark task as processing
      await this.producer.updateTaskStatus(taskId, 'processing');

      // 4. Execute domain task handler
      const context: WorkerContext = {
        redis: this.redis,
        repositories: this.repositories,
        broadcaster: this.broadcaster,
        producer: this.producer,
        lock: this.lock,
      };

      const result = await handler.handle(task, context);

      // 5. Mark task as completed
      await this.producer.updateTaskStatus(taskId, 'completed', result);
      return result;
    } catch (err: any) {
      await this.handleTaskError(task, err);
      throw err;
    } finally {
      // 6. Stop Watchdog & Release Lock
      clearInterval(watchdog);
      this.activeWatchdogs.delete(roomId);
      await this.lock.releaseLock(roomId, token);
    }
  }

  private async handleTaskError(task: IGameTask, error: any): Promise<void> {
    const maxRetries = this.options.maxRetries ?? 3;
    const currentRetries = task.retryCount || 0;

    if (currentRetries < maxRetries) {
      const delayMs = Math.pow(2, currentRetries) * 1000;
      task.retryCount = currentRetries + 1;

      await this.producer.updateTaskStatus(task.taskId, 'retrying', {
        error: error.message,
        attempt: task.retryCount,
      });

      // Exponential backoff delay before re-enqueuing
      setTimeout(async () => {
        try {
          await this.producer.enqueueTask(task);
        } catch (enqueueErr) {
          console.error('[TaskWorker] Failed to re-enqueue retried task:', enqueueErr);
        }
      }, delayMs);
    } else {
      // Maximum retries exceeded: Route to dead-letter queue and persist to DB
      await this.consumer.pushDeadLetter(task, error);
      await this.repositories.failedTasks.create({
        task,
        error: error instanceof Error ? error.message : String(error),
      });

      await this.producer.updateTaskStatus(task.taskId, 'failed', {
        error: error.message,
        attempts: currentRetries + 1,
      });
    }
  }

  public async runRoomLoop(roomId: string): Promise<void> {
    if (this.activeRoomLoops.has(roomId)) return;
    this.activeRoomLoops.add(roomId);

    while (this.isRunning && this.activeRoomLoops.has(roomId)) {
      try {
        const task = await this.consumer.popRoomTask(roomId, 2);
        if (task) {
          await this.executeTask(task);
        }
      } catch (err) {
        console.error(`[TaskWorker] Error processing task for room ${roomId}:`, err);
      }
    }
  }

  public async runGlobalLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        const task = await this.consumer.popGlobalTask(2);
        if (task) {
          await this.executeTask(task);
        }
      } catch (err) {
        console.error('[TaskWorker] Error processing global task:', err);
      }
    }
  }
}
