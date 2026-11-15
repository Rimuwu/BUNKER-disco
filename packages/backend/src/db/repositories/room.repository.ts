import { Db } from 'mongodb';
import { ILobbySettings } from '@bunker/shared/types';
import { defaultLobbySettings } from '@bunker/shared/validation';

export interface IRoomDocument {
  _id?: string;
  roomId: string;
  code: string;
  hostId: string;
  status: 'lobby' | 'phase1' | 'phase2' | 'ended';
  playerCount: number;
  maxPlayers: number;
  settings: ILobbySettings;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class RoomRepository {
  private inMemoryRooms = new Map<string, IRoomDocument>();

  constructor(private db: Db | null = null) {}

  public setDb(db: Db | null): void {
    this.db = db;
  }

  public async create(data: {
    hostId: string;
    settings?: Partial<ILobbySettings>;
    customCode?: string;
    customRoomId?: string;
  }): Promise<IRoomDocument> {
    const roomId = data.customRoomId || `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const code = (data.customCode || generateRoomCode()).toUpperCase();
    const mergedSettings: ILobbySettings = {
      ...defaultLobbySettings,
      ...(data.settings || {}),
    };

    const doc: IRoomDocument = {
      roomId,
      code,
      hostId: data.hostId,
      status: 'lobby',
      playerCount: 1,
      maxPlayers: mergedSettings.maxPlayers,
      settings: mergedSettings,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    if (this.db) {
      await this.db.collection('rooms').insertOne({ ...doc } as any);
    }
    this.inMemoryRooms.set(roomId, doc);
    this.inMemoryRooms.set(`code:${code}`, doc);

    return doc;
  }

  public async findByCode(code: string): Promise<IRoomDocument | null> {
    const cleanCode = code.toUpperCase();
    if (this.db) {
      const found = await this.db.collection<IRoomDocument>('rooms').findOne({ code: cleanCode });
      if (found) return found;
    }
    return this.inMemoryRooms.get(`code:${cleanCode}`) || null;
  }

  public async findById(roomId: string): Promise<IRoomDocument | null> {
    if (this.db) {
      const found = await this.db.collection<IRoomDocument>('rooms').findOne({ roomId });
      if (found) return found;
    }
    return this.inMemoryRooms.get(roomId) || null;
  }

  public async updateSettings(roomId: string, settings: Partial<ILobbySettings>): Promise<IRoomDocument | null> {
    const room = await this.findById(roomId);
    if (!room) return null;

    const newSettings = { ...room.settings, ...settings };
    const updatedAt = new Date();

    if (this.db) {
      await this.db.collection('rooms').updateOne(
        { roomId },
        { $set: { settings: newSettings, maxPlayers: newSettings.maxPlayers || room.maxPlayers, updatedAt } }
      );
    }

    room.settings = newSettings;
    if (newSettings.maxPlayers) room.maxPlayers = newSettings.maxPlayers;
    room.updatedAt = updatedAt;
    this.inMemoryRooms.set(roomId, room);
    this.inMemoryRooms.set(`code:${room.code}`, room);

    return room;
  }

  public async updateStatus(roomId: string, status: IRoomDocument['status']): Promise<IRoomDocument | null> {
    const room = await this.findById(roomId);
    if (!room) return null;

    const updatedAt = new Date();
    if (this.db) {
      await this.db.collection('rooms').updateOne({ roomId }, { $set: { status, updatedAt } });
    }

    room.status = status;
    room.updatedAt = updatedAt;
    this.inMemoryRooms.set(roomId, room);
    this.inMemoryRooms.set(`code:${room.code}`, room);

    return room;
  }

  public async incrementPlayerCount(roomId: string, delta = 1): Promise<IRoomDocument | null> {
    const room = await this.findById(roomId);
    if (!room) return null;

    room.playerCount = Math.max(0, room.playerCount + delta);
    room.updatedAt = new Date();

    if (this.db) {
      await this.db.collection('rooms').updateOne(
        { roomId },
        { $set: { playerCount: room.playerCount, updatedAt: room.updatedAt } }
      );
    }

    this.inMemoryRooms.set(roomId, room);
    this.inMemoryRooms.set(`code:${room.code}`, room);
    return room;
  }

  public async deleteByCode(code: string): Promise<boolean> {
    const cleanCode = code.toUpperCase();
    const room = await this.findByCode(cleanCode);
    if (!room) return false;

    if (this.db) {
      await this.db.collection('rooms').deleteOne({ code: cleanCode });
    }
    this.inMemoryRooms.delete(room.roomId);
    this.inMemoryRooms.delete(`code:${cleanCode}`);
    return true;
  }

  public async count(): Promise<number> {
    if (this.db) {
      return this.db.collection('rooms').countDocuments();
    }
    const uniqueIds = new Set<string>();
    for (const [k, v] of this.inMemoryRooms.entries()) {
      if (!k.startsWith('code:')) uniqueIds.add(v.roomId);
    }
    return uniqueIds.size;
  }
}
