import { Db } from 'mongodb';

export interface IEventDocument {
  _id?: string;
  eventId: string;
  roomId: string;
  phase?: 'phase1' | 'phase2' | 'lobby';
  day?: number;
  type: string;
  name?: string;
  description?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export class EventRepository {
  private inMemoryEvents: IEventDocument[] = [];

  constructor(private db: Db | null = null) {}

  public setDb(db: Db | null): void {
    this.db = db;
  }

  public async create(data: {
    roomId: string;
    phase?: 'phase1' | 'phase2' | 'lobby';
    day?: number;
    type: string;
    name?: string;
    description?: string;
    details?: Record<string, any>;
    customEventId?: string;
  }): Promise<IEventDocument> {
    const doc: IEventDocument = {
      eventId: data.customEventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      roomId: data.roomId,
      phase: data.phase,
      day: data.day,
      type: data.type,
      name: data.name,
      description: data.description,
      details: data.details,
      timestamp: new Date(),
    };

    if (this.db) {
      await this.db.collection('events').insertOne({ ...doc } as any);
    }
    this.inMemoryEvents.push(doc);
    return doc;
  }

  public async findByRoomId(
    roomId: string,
    options: {
      day?: number;
      type?: string;
      phase?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ events: IEventDocument[]; total: number }> {
    const limit = Math.min(options.limit ?? 20, 200);
    const offset = Math.max(options.offset ?? 0, 0);

    if (this.db) {
      const query: Record<string, any> = { roomId };
      if (options.day !== undefined) query.day = options.day;
      if (options.type) query.type = options.type;
      if (options.phase && options.phase !== 'all') query.phase = options.phase;

      const total = await this.db.collection<IEventDocument>('events').countDocuments(query);
      const events = await this.db
        .collection<IEventDocument>('events')
        .find(query)
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      return { events, total };
    }

    let filtered = this.inMemoryEvents.filter((e) => e.roomId === roomId);
    if (options.day !== undefined) filtered = filtered.filter((e) => e.day === options.day);
    if (options.type) filtered = filtered.filter((e) => e.type === options.type);
    if (options.phase && options.phase !== 'all') filtered = filtered.filter((e) => e.phase === options.phase);

    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return { events: paginated, total };
  }

  public async getDayLogs(roomId: string, day: number): Promise<{ day: number; summary: string; events: IEventDocument[] }> {
    const { events } = await this.findByRoomId(roomId, { day, limit: 100 });
    return {
      day,
      summary: `Day ${day} event log containing ${events.length} incident records.`,
      events,
    };
  }
}
