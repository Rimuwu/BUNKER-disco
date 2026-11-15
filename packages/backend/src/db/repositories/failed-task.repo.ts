import { Db } from 'mongodb';
import { IGameTask } from '@bunker/shared/types';

export interface IFailedTaskDocument {
  _id?: string;
  taskId: string;
  type: string;
  roomId: string;
  playerId?: string;
  task: IGameTask;
  lastError: string;
  retryCount: number;
  failedAt: Date;
}

export class FailedTaskRepository {
  private inMemoryFailedTasks = new Map<string, IFailedTaskDocument>();

  constructor(private db: Db | null = null) {}

  public setDb(db: Db | null): void {
    this.db = db;
  }

  public async create(data: {
    task: IGameTask;
    error: string | Error;
  }): Promise<IFailedTaskDocument> {
    const errorMsg = data.error instanceof Error ? data.error.message : String(data.error);
    const doc: IFailedTaskDocument = {
      taskId: data.task.taskId,
      type: data.task.type,
      roomId: data.task.roomId,
      playerId: data.task.playerId,
      task: data.task,
      lastError: errorMsg,
      retryCount: data.task.retryCount || 0,
      failedAt: new Date(),
    };

    if (this.db) {
      await this.db.collection('failed_tasks').updateOne(
        { taskId: doc.taskId },
        { $set: doc },
        { upsert: true }
      );
    }
    this.inMemoryFailedTasks.set(doc.taskId, doc);
    return doc;
  }

  public async findByRoomId(roomId: string): Promise<IFailedTaskDocument[]> {
    if (this.db) {
      return this.db.collection<IFailedTaskDocument>('failed_tasks').find({ roomId }).toArray();
    }
    const result: IFailedTaskDocument[] = [];
    for (const v of this.inMemoryFailedTasks.values()) {
      if (v.roomId === roomId) result.push(v);
    }
    return result;
  }

  public async findById(taskId: string): Promise<IFailedTaskDocument | null> {
    if (this.db) {
      const found = await this.db.collection<IFailedTaskDocument>('failed_tasks').findOne({ taskId });
      if (found) return found;
    }
    return this.inMemoryFailedTasks.get(taskId) || null;
  }
}
