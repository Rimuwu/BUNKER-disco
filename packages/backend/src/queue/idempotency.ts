import { Redis } from 'ioredis';
import { REDIS_KEYS } from './producer.js';

export class IdempotencyManager {
  constructor(private redis: Redis) {}

  public async getLastSequence(roomId: string, playerId: string): Promise<number> {
    const metaKey = REDIS_KEYS.ROOM_META(roomId);
    const seqField = `seq:${playerId}`;
    const raw = await this.redis.hget(metaKey, seqField);
    if (!raw) return 0;
    return parseInt(raw, 10) || 0;
  }

  public async isDuplicate(roomId: string, playerId: string, clientSequence?: number | null): Promise<boolean> {
    if (clientSequence === undefined || clientSequence === null || clientSequence <= 0) return false;
    const lastSeq = await this.getLastSequence(roomId, playerId);
    return clientSequence <= lastSeq;
  }

  public async checkAndRecordSequence(
    roomId: string,
    playerId: string,
    sequence?: number | null
  ): Promise<{ isDuplicate: boolean; lastSequence: number }> {
    if (sequence === undefined || sequence === null || sequence <= 0) {
      return { isDuplicate: false, lastSequence: 0 };
    }
    const lastSeq = await this.getLastSequence(roomId, playerId);
    if (sequence <= lastSeq) {
      return { isDuplicate: true, lastSequence: lastSeq };
    }
    await this.recordSequence(roomId, playerId, sequence);
    return { isDuplicate: false, lastSequence: sequence };
  }

  public async recordSequence(roomId: string, playerId: string, clientSequence: number): Promise<void> {
    const metaKey = REDIS_KEYS.ROOM_META(roomId);
    const seqField = `seq:${playerId}`;
    await this.redis.hset(metaKey, seqField, clientSequence.toString());
  }

  public async resetRoom(roomId: string): Promise<void> {
    const metaKey = REDIS_KEYS.ROOM_META(roomId);
    await this.redis.del(metaKey);
  }
}
