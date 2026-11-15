import { Db } from 'mongodb';

export interface IPlayerDocument {
  _id?: string;
  playerId: string;
  roomId: string;
  nickname: string;
  avatarSeed: string;
  isHost: boolean;
  role: 'host' | 'player' | 'spectator';
  token: string;
  remainingRerolls: number;
  isConnected: boolean;
  isEliminated: boolean;
  isInBunker: boolean;
  actionPoints: number;
  cards: Record<string, any>;
  stats: {
    health: number;
    morale: number;
    energy: number;
  };
  inventory: Array<{
    itemId: string;
    name: string;
    weight: number;
    quantity: number;
  }>;
  abilities: Array<{
    abilityId: string;
    name: string;
    cooldownRemaining: number;
    usesRemaining: number;
    actionPoints: number;
  }>;
  secretQuests: Array<any>;
  createdAt: Date;
  updatedAt: Date;
}

export class DuplicateNicknameError extends Error {
  public readonly code = 'NICKNAME_TAKEN';
  constructor(nickname: string) {
    super(`Nickname "${nickname}" is already taken in this room.`);
    this.name = 'DuplicateNicknameError';
  }
}

export class PlayerRepository {
  private inMemoryPlayers = new Map<string, IPlayerDocument>();

  constructor(private db: Db | null = null) {}

  public setDb(db: Db | null): void {
    this.db = db;
  }

  public async create(data: {
    roomId: string;
    nickname: string;
    isHost?: boolean;
    token: string;
    remainingRerolls?: number;
    avatarSeed?: string;
    customPlayerId?: string;
  }): Promise<IPlayerDocument> {
    const trimmedNick = data.nickname.trim();
    // Check duplicate nickname in room
    const existing = await this.findByRoomAndNickname(data.roomId, trimmedNick);
    if (existing) {
      throw new DuplicateNicknameError(trimmedNick);
    }

    const playerId = data.customPlayerId || `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const isHost = Boolean(data.isHost);
    const doc: IPlayerDocument = {
      playerId,
      roomId: data.roomId,
      nickname: trimmedNick,
      avatarSeed: data.avatarSeed || `seed_${Math.random().toString(36).substring(2, 8)}`,
      isHost,
      role: isHost ? 'host' : 'player',
      token: data.token,
      remainingRerolls: data.remainingRerolls ?? 1,
      isConnected: true,
      isEliminated: false,
      isInBunker: false,
      actionPoints: 3,
      cards: {},
      stats: {
        health: 100,
        morale: 100,
        energy: 100,
      },
      inventory: [],
      abilities: [],
      secretQuests: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.db) {
      try {
        await this.db.collection('players').insertOne({ ...doc } as any);
      } catch (err: any) {
        if (err.code === 11000) {
          throw new DuplicateNicknameError(trimmedNick);
        }
        throw err;
      }
    }

    this.inMemoryPlayers.set(playerId, doc);
    this.inMemoryPlayers.set(`token:${data.token}`, doc);
    this.inMemoryPlayers.set(`room:${data.roomId}:nick:${trimmedNick.toLowerCase()}`, doc);

    return doc;
  }

  public async findById(playerId: string): Promise<IPlayerDocument | null> {
    if (this.db) {
      const found = await this.db.collection<IPlayerDocument>('players').findOne({ playerId });
      if (found) return found;
    }
    return this.inMemoryPlayers.get(playerId) || null;
  }

  public async findByToken(token: string): Promise<IPlayerDocument | null> {
    if (this.db) {
      const found = await this.db.collection<IPlayerDocument>('players').findOne({ token });
      if (found) return found;
    }
    return this.inMemoryPlayers.get(`token:${token}`) || null;
  }

  public async findByRoomId(roomId: string): Promise<IPlayerDocument[]> {
    if (this.db) {
      return this.db.collection<IPlayerDocument>('players').find({ roomId }).toArray();
    }
    const result: IPlayerDocument[] = [];
    for (const [k, v] of this.inMemoryPlayers.entries()) {
      if (!k.includes(':') && v.roomId === roomId) {
        result.push(v);
      }
    }
    return result;
  }

  public async findByRoomAndNickname(roomId: string, nickname: string): Promise<IPlayerDocument | null> {
    const cleanNick = nickname.trim().toLowerCase();
    if (this.db) {
      const found = await this.db.collection<IPlayerDocument>('players').findOne({
        roomId,
        nickname: { $regex: new RegExp(`^${cleanNick}$`, 'i') },
      });
      if (found) return found;
    }
    return this.inMemoryPlayers.get(`room:${roomId}:nick:${cleanNick}`) || null;
  }

  public async updateRerolls(playerId: string, delta = -1): Promise<IPlayerDocument | null> {
    const player = await this.findById(playerId);
    if (!player) return null;

    player.remainingRerolls = Math.max(0, player.remainingRerolls + delta);
    player.updatedAt = new Date();

    if (this.db) {
      await this.db.collection('players').updateOne(
        { playerId },
        { $set: { remainingRerolls: player.remainingRerolls, updatedAt: player.updatedAt } }
      );
    }
    this.inMemoryPlayers.set(playerId, player);
    return player;
  }

  public async updateConnection(playerId: string, isConnected: boolean): Promise<void> {
    const player = await this.findById(playerId);
    if (!player) return;

    player.isConnected = isConnected;
    player.updatedAt = new Date();
    if (this.db) {
      await this.db.collection('players').updateOne({ playerId }, { $set: { isConnected, updatedAt: player.updatedAt } });
    }
    this.inMemoryPlayers.set(playerId, player);
  }

  public async update(playerId: string, update: Partial<IPlayerDocument>): Promise<IPlayerDocument | null> {
    const player = await this.findById(playerId);
    if (!player) return null;

    Object.assign(player, update, { updatedAt: new Date() });
    if (this.db) {
      await this.db.collection('players').updateOne({ playerId }, { $set: update });
    }
    this.inMemoryPlayers.set(playerId, player);
    return player;
  }

  public async updateCards(playerId: string, cards: Record<string, any>): Promise<IPlayerDocument | null> {
    const player = await this.findById(playerId);
    if (!player) return null;

    player.cards = { ...player.cards, ...cards };
    player.updatedAt = new Date();
    if (this.db) {
      await this.db.collection('players').updateOne({ playerId }, { $set: { cards: player.cards, updatedAt: player.updatedAt } });
    }
    this.inMemoryPlayers.set(playerId, player);
    return player;
  }

  public async updateStats(playerId: string, stats: Partial<IPlayerDocument['stats']>): Promise<IPlayerDocument | null> {
    const player = await this.findById(playerId);
    if (!player) return null;

    player.stats = { ...player.stats, ...stats };
    player.updatedAt = new Date();
    if (this.db) {
      await this.db.collection('players').updateOne({ playerId }, { $set: { stats: player.stats, updatedAt: player.updatedAt } });
    }
    this.inMemoryPlayers.set(playerId, player);
    return player;
  }

  public async remove(playerId: string): Promise<boolean> {
    const player = await this.findById(playerId);
    if (!player) return false;

    if (this.db) {
      await this.db.collection('players').deleteOne({ playerId });
    }
    this.inMemoryPlayers.delete(playerId);
    this.inMemoryPlayers.delete(`token:${player.token}`);
    this.inMemoryPlayers.delete(`room:${player.roomId}:nick:${player.nickname.toLowerCase()}`);
    return true;
  }
}
