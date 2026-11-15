export interface IActiveTimer {
  timerId: string;
  roomId: string;
  type: 'debate' | 'voting' | 'draft' | 'crisis_reaction';
  expiresAt: number;
  durationSeconds: number;
}

export class TimerCoordinator {
  private static timers = new Map<string, IActiveTimer>();

  public static startTimer(
    roomId: string,
    type: IActiveTimer['type'],
    durationSeconds: number
  ): IActiveTimer {
    const timerId = `${roomId}:${type}`;
    const timer: IActiveTimer = {
      timerId,
      roomId,
      type,
      durationSeconds,
      expiresAt: Date.now() + durationSeconds * 1000,
    };
    this.timers.set(timerId, timer);
    return timer;
  }

  public static getTimer(roomId: string, type: IActiveTimer['type']): IActiveTimer | undefined {
    return this.timers.get(`${roomId}:${type}`);
  }

  public static isExpired(roomId: string, type: IActiveTimer['type']): boolean {
    const timer = this.getTimer(roomId, type);
    if (!timer) return true;
    return Date.now() >= timer.expiresAt;
  }

  public static clearTimer(roomId: string, type: IActiveTimer['type']): void {
    this.timers.delete(`${roomId}:${type}`);
  }
}
