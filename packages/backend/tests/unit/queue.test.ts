import { describe, it, expect, beforeEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { QueueProducer } from '../../src/queue/producer.js';
import { QueueConsumer } from '../../src/queue/consumer.js';
import { IGameTask } from '@bunker/shared/types';

describe('Unit: Redis CQRS Queue Producer & Consumer', () => {
  let redis: any;
  let producer: QueueProducer;
  let consumer: QueueConsumer;

  beforeEach(async () => {
    redis = new RedisMock();
    await redis.flushall();
    producer = new QueueProducer(redis);
    consumer = new QueueConsumer(redis);
  });

  it('enqueues task and updates status cache', async () => {
    const task: IGameTask = {
      taskId: 'task_001',
      type: 'START_GAME',
      roomId: 'room_q1',
      queuedAt: Date.now(),
    };

    const res = await producer.enqueueTask(task);
    expect(res.taskId).toBe('task_001');
    expect(res.status).toBe('queued');
    expect(res.queueDepth).toBe(1);

    // Verify task status cache
    const status = await producer.getTaskStatus('task_001');
    expect(status).toBeDefined();
    expect(status.status).toBe('queued');
    expect(status.type).toBe('START_GAME');

    // Pop task via consumer
    const popped = await consumer.popRoomTask('room_q1', 1);
    expect(popped).toBeDefined();
    expect(popped?.taskId).toBe('task_001');
    expect(popped?.type).toBe('START_GAME');
  });

  it('preserves FIFO ordering for per-room tasks', async () => {
    const task1: IGameTask = { taskId: 't1', type: 'CLIENT_ACTION', roomId: 'room_fifo', queuedAt: 1 };
    const task2: IGameTask = { taskId: 't2', type: 'CLIENT_ACTION', roomId: 'room_fifo', queuedAt: 2 };

    await producer.enqueueTask(task1);
    await producer.enqueueTask(task2);

    const first = await consumer.popRoomTask('room_fifo', 1);
    const second = await consumer.popRoomTask('room_fifo', 1);

    expect(first?.taskId).toBe('t1');
    expect(second?.taskId).toBe('t2');
  });

  it('enqueues and consumes global tasks', async () => {
    const globalTask: IGameTask = {
      taskId: 't_global_1',
      type: 'PHASE2_DAY_TICK',
      roomId: 'global_room',
      queuedAt: Date.now(),
    };

    await producer.enqueueGlobal(globalTask);
    expect(await producer.getGlobalQueueLength()).toBe(1);

    const popped = await consumer.popGlobalTask(1);
    expect(popped?.taskId).toBe('t_global_1');
  });

  it('pushes and pops dead-letter poison tasks', async () => {
    const poisonTask: IGameTask = {
      taskId: 't_poison',
      type: 'CLIENT_ACTION',
      roomId: 'room_poison',
      queuedAt: Date.now(),
    };

    await consumer.pushDeadLetter(poisonTask, new Error('Fatal database corruption'));
    const deadPopped = await consumer.popDeadLetter(1);

    expect(deadPopped).toBeDefined();
    expect(deadPopped.taskId).toBe('t_poison');
    expect(deadPopped.error).toContain('Fatal database corruption');
  });
});
