import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { TaskWorker } from '../../../src/worker/TaskWorker.js';
import { QueueProducer } from '../../../src/queue/producer.js';
import { QueueConsumer } from '../../../src/queue/consumer.js';
import { DistributedLock } from '../../../src/queue/lock.js';
import { createRepositories } from '../../../src/db/index.js';
import { EventBroadcaster } from '../../../src/worker/EventBroadcaster.js';
import { IGameTask } from '@bunker/shared';

describe('Unit: Worker Task Pool Engine & TaskWorker', () => {
  let redis: any;
  let producer: QueueProducer;
  let consumer: QueueConsumer;
  let lock: DistributedLock;
  let repositories: any;
  let broadcaster: any;
  let worker: TaskWorker;

  beforeEach(() => {
    redis = new (RedisMock as any)();
    producer = new QueueProducer(redis);
    consumer = new QueueConsumer(redis);
    lock = new DistributedLock(redis);
    repositories = createRepositories(null);

    // Mock broadcaster
    broadcaster = new EventBroadcaster({
      to: () => ({ emit: () => {} }),
    } as any);

    worker = new TaskWorker(redis, repositories, broadcaster, consumer, producer, lock, {
      lockTtlSeconds: 5,
      maxRetries: 3,
    });
  });

  afterEach(async () => {
    await worker.stop();
  });

  it('initializes with all 9 task handlers registered', () => {
    expect(worker.getHandler('START_GAME')).toBeDefined();
    expect(worker.getHandler('PHASE1_VOTE_TICK')).toBeDefined();
    expect(worker.getHandler('PHASE1_RESOLVE_VOTING')).toBeDefined();
    expect(worker.getHandler('PHASE1_EXILE')).toBeDefined();
    expect(worker.getHandler('PHASE2_START')).toBeDefined();
    expect(worker.getHandler('PHASE2_DAY_TICK')).toBeDefined();
    expect(worker.getHandler('PHASE2_RESOLVE_ACTIONS')).toBeDefined();
    expect(worker.getHandler('PHASE2_CRISIS_CHECK')).toBeDefined();
    expect(worker.getHandler('CLIENT_ACTION')).toBeDefined();
  });

  it('executes task under distributed lock and updates status to completed', async () => {
    const roomId = 'ROOM_EXEC_1';
    let executed = false;

    worker.registerHandler('START_GAME', {
      async handle() {
        executed = true;
        return { success: true };
      },
    });

    const task: IGameTask = {
      taskId: 'task_001',
      type: 'START_GAME',
      roomId,
      queuedAt: Date.now(),
    };

    const result = await worker.executeTask(task);
    expect(executed).toBe(true);
    expect(result.success).toBe(true);

    const status = await producer.getTaskStatus('task_001');
    expect(status?.status).toBe('completed');
  });

  it('routes poison pill tasks to bunker:dead_letter and DB on 3rd failure', async () => {
    const roomId = 'ROOM_FAIL_1';

    worker.registerHandler('START_GAME', {
      async handle() {
        throw new Error('Fatal unhandled error');
      },
    });

    const task: IGameTask = {
      taskId: 'task_fail_999',
      type: 'START_GAME',
      roomId,
      queuedAt: Date.now(),
      retryCount: 3, // already retried 3 times -> maxRetries reached
    };

    await expect(worker.executeTask(task)).rejects.toThrow('Fatal unhandled error');

    // Should be in dead-letter queue
    const deadTasks = await redis.lrange('bunker:dead_letter', 0, -1);
    expect(deadTasks.length).toBeGreaterThan(0);
    const parsed = JSON.parse(deadTasks[0]);
    expect(parsed.taskId).toBe('task_fail_999');
    expect(parsed.error).toContain('Fatal unhandled error');

    // Should be in DB failed_tasks repository
    const dbFailed = await repositories.failedTasks.findById('task_fail_999');
    expect(dbFailed).toBeDefined();
    expect(dbFailed?.lastError).toContain('Fatal unhandled error');
  });

  it('releases lock cleanly when task fails', async () => {
    const roomId = 'ROOM_LOCK_CLEANUP';

    worker.registerHandler('START_GAME', {
      async handle() {
        throw new Error('Explosion');
      },
    });

    const task: IGameTask = {
      taskId: 'task_cleanup_1',
      type: 'START_GAME',
      roomId,
      queuedAt: Date.now(),
      retryCount: 3,
    };

    try {
      await worker.executeTask(task);
    } catch {}

    // Lock should be released
    const lockKey = `bunker:lock:${roomId}`;
    const lockVal = await redis.get(lockKey);
    expect(lockVal).toBeNull();
  });
});
