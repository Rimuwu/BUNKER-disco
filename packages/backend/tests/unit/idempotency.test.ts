import { describe, it, expect, beforeEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { IdempotencyManager } from '../../src/queue/idempotency.js';

describe('Unit: Action Idempotency & Sequence Tracking', () => {
  let redis: any;
  let idempotency: IdempotencyManager;

  beforeEach(() => {
    redis = new RedisMock();
    idempotency = new IdempotencyManager(redis);
  });

  it('tracks monotonic clientSequence per player', async () => {
    const roomId = 'room_seq_1';
    const playerId = 'player_1';

    expect(await idempotency.getLastSequence(roomId, playerId)).toBe(0);

    await idempotency.recordSequence(roomId, playerId, 1);
    expect(await idempotency.getLastSequence(roomId, playerId)).toBe(1);

    await idempotency.recordSequence(roomId, playerId, 5);
    expect(await idempotency.getLastSequence(roomId, playerId)).toBe(5);
  });

  it('detects duplicate or out-of-order sequences', async () => {
    const roomId = 'room_seq_2';
    const playerId = 'player_2';

    await idempotency.recordSequence(roomId, playerId, 3);

    // Sequence 3 is duplicate
    expect(await idempotency.isDuplicate(roomId, playerId, 3)).toBe(true);

    // Older sequence 2 is duplicate
    expect(await idempotency.isDuplicate(roomId, playerId, 2)).toBe(true);

    // Newer sequence 4 is NOT duplicate
    expect(await idempotency.isDuplicate(roomId, playerId, 4)).toBe(false);
  });

  it('handles independent sequence spaces across different players and rooms', async () => {
    await idempotency.recordSequence('room_A', 'p1', 10);
    await idempotency.recordSequence('room_A', 'p2', 2);
    await idempotency.recordSequence('room_B', 'p1', 1);

    expect(await idempotency.getLastSequence('room_A', 'p1')).toBe(10);
    expect(await idempotency.getLastSequence('room_A', 'p2')).toBe(2);
    expect(await idempotency.getLastSequence('room_B', 'p1')).toBe(1);
  });

  it('does not treat undefined, null, zero or negative sequences as duplicates in isDuplicate', async () => {
    const roomId = 'room_seq_zero';
    const playerId = 'player_zero';

    expect(await idempotency.isDuplicate(roomId, playerId, undefined)).toBe(false);
    expect(await idempotency.isDuplicate(roomId, playerId, null as any)).toBe(false);
    expect(await idempotency.isDuplicate(roomId, playerId, 0)).toBe(false);
    expect(await idempotency.isDuplicate(roomId, playerId, -1)).toBe(false);
  });

  it('checkAndRecordSequence handles undefined, null, zero and monotonic sequences correctly', async () => {
    const roomId = 'room_check_seq';
    const playerId = 'player_check';

    // Zero, null, undefined, negative do not flag as duplicate and do not advance lastSequence
    expect(await idempotency.checkAndRecordSequence(roomId, playerId, undefined)).toEqual({
      isDuplicate: false,
      lastSequence: 0,
    });
    expect(await idempotency.checkAndRecordSequence(roomId, playerId, null)).toEqual({
      isDuplicate: false,
      lastSequence: 0,
    });
    expect(await idempotency.checkAndRecordSequence(roomId, playerId, 0)).toEqual({
      isDuplicate: false,
      lastSequence: 0,
    });
    expect(await idempotency.checkAndRecordSequence(roomId, playerId, -5)).toEqual({
      isDuplicate: false,
      lastSequence: 0,
    });

    // Valid positive sequence 1
    const res1 = await idempotency.checkAndRecordSequence(roomId, playerId, 1);
    expect(res1).toEqual({ isDuplicate: false, lastSequence: 1 });

    // Same sequence 1 is duplicate
    const resDuplicate = await idempotency.checkAndRecordSequence(roomId, playerId, 1);
    expect(resDuplicate).toEqual({ isDuplicate: true, lastSequence: 1 });

    // Lower sequence 0 still returns isDuplicate: false with lastSequence 0 per contract
    const resZero = await idempotency.checkAndRecordSequence(roomId, playerId, 0);
    expect(resZero).toEqual({ isDuplicate: false, lastSequence: 0 });

    // Next sequence 2 is accepted
    const res2 = await idempotency.checkAndRecordSequence(roomId, playerId, 2);
    expect(res2).toEqual({ isDuplicate: false, lastSequence: 2 });
  });
});
