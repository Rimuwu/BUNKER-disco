import { Db } from 'mongodb';
import { IGameStateDocument } from '@bunker/shared/types';

export class GameRepository {
  private inMemoryStates = new Map<string, IGameStateDocument>();

  constructor(private db: Db | null = null) {}

  public setDb(db: Db | null): void {
    this.db = db;
  }

  public async create(data: {
    roomId: string;
    phase?: IGameStateDocument['phase'];
    initialState?: Partial<IGameStateDocument>;
  }): Promise<IGameStateDocument> {
    const doc: IGameStateDocument = {
      roomId: data.roomId,
      phase: data.phase || 'lobby',
      updatedAt: new Date(),
      ...(data.initialState || {}),
    };

    if (this.db) {
      await this.db.collection('game_states').updateOne(
        { roomId: data.roomId },
        { $set: doc },
        { upsert: true }
      );
    }
    this.inMemoryStates.set(data.roomId, doc);
    return doc;
  }

  public async findByRoomId(roomId: string): Promise<IGameStateDocument | null> {
    if (this.db) {
      const found = await this.db.collection<IGameStateDocument>('game_states').findOne({ roomId });
      if (found) return found;
    }
    return this.inMemoryStates.get(roomId) || null;
  }

  public async update(roomId: string, update: Partial<IGameStateDocument>): Promise<IGameStateDocument | null> {
    let existing = await this.findByRoomId(roomId);
    if (!existing) {
      existing = await this.create({ roomId, ...update });
    }

    const merged: IGameStateDocument = {
      ...existing,
      ...update,
      updatedAt: new Date(),
    };

    if (this.db) {
      await this.db.collection('game_states').updateOne({ roomId }, { $set: merged });
    }
    this.inMemoryStates.set(roomId, merged);
    return merged;
  }

  public async delete(roomId: string): Promise<boolean> {
    if (this.db) {
      await this.db.collection('game_states').deleteOne({ roomId });
    }
    return this.inMemoryStates.delete(roomId);
  }
}
