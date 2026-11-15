import { describe, it, expect, beforeEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { DistributedLock } from '../../src/queue/lock.js';

describe('Unit: Distributed Mutex Lock (bunker:lock:{roomId})', () => {
  let redis: any;
  let lock: DistributedLock;

  beforeEach(() => {
    redis = new RedisMock();
    lock = new DistributedLock(redis);
  });

  it('acquires lock successfully for unreserved room', async () => {
    const res = await lock.acquireLock('ROOM_A', 'worker_1', 30);
    expect(res.acquired).toBe(true);
    expect(res.token).toBe('worker_1');

    const isLocked = await lock.isLocked('ROOM_A');
    expect(isLocked).toBe(true);

    const owner = await lock.getLockOwner('ROOM_A');
    expect(owner).toBe('worker_1');
  });

  it('prevents second worker from acquiring the same room lock concurrently', async () => {
    const first = await lock.acquireLock('ROOM_B', 'worker_1', 30);
    expect(first.acquired).toBe(true);

    const second = await lock.acquireLock('ROOM_B', 'worker_2', 30);
    expect(second.acquired).toBe(false);

    // Verify owner remains worker_1
    const owner = await lock.getLockOwner('ROOM_B');
    expect(owner).toBe('worker_1');
  });

  it('safely releases lock only when owner token matches', async () => {
    await lock.acquireLock('ROOM_C', 'worker_owner', 30);

    // Impostor worker tries to release
    const impostorRelease = await lock.releaseLock('ROOM_C', 'impostor_worker');
    expect(impostorRelease).toBe(false);

    // Lock must still be held
    expect(await lock.isLocked('ROOM_C')).toBe(true);

    // Genuine owner releases
    const genuineRelease = await lock.releaseLock('ROOM_C', 'worker_owner');
    expect(genuineRelease).toBe(true);

    // Lock is now released
    expect(await lock.isLocked('ROOM_C')).toBe(false);
  });

  it('renews lock TTL for matching owner token', async () => {
    await lock.acquireLock('ROOM_D', 'worker_long_task', 30);

    // Wrong owner renewal fails
    const failRenew = await lock.renewLock('ROOM_D', 'wrong_token', 45);
    expect(failRenew).toBe(false);

    // Correct owner renewal succeeds
    const okRenew = await lock.renewLock('ROOM_D', 'worker_long_task', 45);
    expect(okRenew).toBe(true);
  });
});
