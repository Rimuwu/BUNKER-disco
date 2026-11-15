import { Redis } from 'ioredis';
import { QueueProducer } from './producer.js';
import { QueueConsumer } from './consumer.js';
import { DistributedLock } from './lock.js';
import { IdempotencyManager } from './idempotency.js';

export * from './redis-client.js';
export * from './producer.js';
export * from './consumer.js';
export * from './lock.js';
export * from './idempotency.js';

export interface QueueSystem {
  redis: Redis;
  producer: QueueProducer;
  consumer: QueueConsumer;
  lock: DistributedLock;
  idempotency: IdempotencyManager;
}

export function createQueueSystem(redis: Redis): QueueSystem {
  return {
    redis,
    producer: new QueueProducer(redis),
    consumer: new QueueConsumer(redis),
    lock: new DistributedLock(redis),
    idempotency: new IdempotencyManager(redis),
  };
}
