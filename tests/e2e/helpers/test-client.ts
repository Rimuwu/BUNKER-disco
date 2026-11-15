import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { io, Socket } from 'socket.io-client';

export interface TestClientOptions {
  baseUrl?: string;
  nickname: string;
}

export interface LoggedEvent {
  event: string;
  data: any;
  timestamp: number;
}

export class TestClient {
  public readonly nickname: string;
  public readonly baseUrl: string;
  public playerId: string = '';
  public playerToken: string = '';
  public roomId: string = '';
  public roomCode: string = '';
  public isHost: boolean = false;
  public clientSequence: number = 0;

  private http: AxiosInstance;
  private socket?: Socket;
  private eventLog: LoggedEvent[] = [];

  constructor(options: TestClientOptions) {
    this.nickname = options.nickname;
    this.baseUrl = (options.baseUrl || process.env.E2E_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
    this.http = axios.create({
      baseURL: `${this.baseUrl}/api/v1`,
      validateStatus: () => true, // capture all status codes without throwing
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Set authentication credentials manually (useful in multi-step tests or mocks).
   */
  public setAuth(token: string, roomCode: string, playerId: string = '', roomId: string = ''): void {
    this.playerToken = token;
    this.roomCode = roomCode;
    if (playerId) this.playerId = playerId;
    if (roomId) this.roomId = roomId;
    this.attachAuthHeaders();
  }

  /**
   * Attach Authorization and X-Room-Code headers to HTTP client.
   */
  private attachAuthHeaders(): void {
    if (this.playerToken) {
      this.http.defaults.headers.common['Authorization'] = `Bearer ${this.playerToken}`;
    }
    if (this.roomCode) {
      this.http.defaults.headers.common['X-Room-Code'] = this.roomCode;
    }
  }

  /**
   * Host action: Creates a new room with specified settings.
   */
  public async createRoom(settings: Record<string, any> = {}): Promise<any> {
    const res = await this.http.post('/rooms', {
      nickname: this.nickname,
      settings,
    });

    if (res.status === 200 || res.status === 201) {
      const payload = res.data?.data || res.data;
      this.roomId = payload.roomId || '';
      this.roomCode = payload.code || payload.roomCode || '';
      this.playerId = payload.playerId || '';
      this.playerToken = payload.playerToken || payload.token || '';
      this.isHost = true;
      this.attachAuthHeaders();
      return payload;
    }

    throw new Error(`Create room failed (${res.status}): ${JSON.stringify(res.data)}`);
  }

  /**
   * Player action: Joins an existing room by room code.
   */
  public async joinRoom(roomCode: string): Promise<any> {
    this.roomCode = roomCode.toUpperCase();
    const res = await this.http.post(`/rooms/${this.roomCode}/join`, {
      nickname: this.nickname,
    });

    if (res.status === 200 || res.status === 201) {
      const payload = res.data?.data || res.data;
      this.roomId = payload.roomId || '';
      this.playerId = payload.playerId || '';
      this.playerToken = payload.playerToken || payload.token || '';
      this.attachAuthHeaders();
      return payload;
    }

    throw new Error(`Join room failed (${res.status}): ${JSON.stringify(res.data)}`);
  }

  /**
   * Send a game action to POST /api/v1/actions.
   */
  public async sendAction(type: string, payload: Record<string, any> = {}): Promise<AxiosResponse> {
    this.clientSequence++;
    const res = await this.http.post('/actions', {
      type,
      clientSequence: this.clientSequence,
      payload,
    });
    return res;
  }

  /**
   * Request a mulligan reroll via POST /api/v1/players/reroll.
   */
  public async reroll(): Promise<AxiosResponse> {
    this.clientSequence++;
    const res = await this.http.post('/players/reroll', {
      clientSequence: this.clientSequence,
    });
    return res;
  }

  /**
   * Query full public game state via GET /api/v1/game/:roomId/state.
   */
  public async getGameState(): Promise<any> {
    const targetRoomId = this.roomId || this.roomCode;
    const res = await this.http.get(`/game/${targetRoomId}/state`);
    return res.data;
  }

  /**
   * Query private player dossier via GET /api/v1/players/me.
   */
  public async getMyDossier(): Promise<any> {
    const res = await this.http.get('/players/me');
    return res.data;
  }

  /**
   * Query room settings via GET /api/v1/rooms/:code/settings.
   */
  public async getRoomSettings(): Promise<any> {
    const res = await this.http.get(`/rooms/${this.roomCode}/settings`);
    return res.data;
  }

  /**
   * Host action: update room settings via PATCH /api/v1/rooms/:code/settings.
   */
  public async updateRoomSettings(settings: Record<string, any>): Promise<AxiosResponse> {
    const res = await this.http.patch(`/rooms/${this.roomCode}/settings`, settings);
    return res;
  }

  /**
   * Query player list in the room via GET /api/v1/rooms/:code/players.
   */
  public async getPlayers(): Promise<any> {
    const res = await this.http.get(`/rooms/${this.roomCode}/players`);
    return res.data;
  }

  /**
   * Host action: Close the room via DELETE /api/v1/rooms/:code.
   */
  public async closeRoom(): Promise<AxiosResponse> {
    const res = await this.http.delete(`/rooms/${this.roomCode}`);
    return res;
  }

  /**
   * Connect WebSocket client to /game namespace.
   */
  public async connectSocket(customNamespace: string = '/game'): Promise<void> {
    return new Promise((resolve, reject) => {
      const socketUrl = `${this.baseUrl}${customNamespace}`;
      this.socket = io(socketUrl, {
        auth: {
          token: this.playerToken,
          roomCode: this.roomCode,
        },
        transports: ['websocket', 'polling'],
        reconnection: false,
        timeout: 8000,
      });

      this.socket.onAny((event: string, ...args: any[]) => {
        const data = args.length === 1 ? args[0] : args;
        this.eventLog.push({
          event,
          data,
          timestamp: Date.now(),
        });
      });

      this.socket.on('connect', () => {
        resolve();
      });

      this.socket.on('connect_error', (err: Error) => {
        reject(err);
      });
    });
  }

  /**
   * Disconnects active WebSocket connection.
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  /**
   * Returns true if WebSocket is actively connected.
   */
  public isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }

  /**
   * Appends an event to the internal event log (useful in unit/smoke testing).
   */
  public pushMockEvent(event: string, data: any): void {
    this.eventLog.push({
      event,
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Returns a copy of all received events.
   */
  public getEventLog(): ReadonlyArray<LoggedEvent> {
    return [...this.eventLog];
  }

  /**
   * Clears the event log.
   */
  public clearEventLog(): void {
    this.eventLog = [];
  }

  /**
   * Waits for a specific event by name with optional predicate filter and timeout.
   */
  public async waitForEvent<T = any>(
    eventName: string,
    filter?: (data: T) => boolean,
    timeoutMs: number = 8000
  ): Promise<T> {
    // Check existing events first
    const existing = this.eventLog.find(
      (entry) => entry.event === eventName && (!filter || filter(entry.data))
    );
    if (existing) {
      return existing.data as T;
    }

    return new Promise<T>((resolve, reject) => {
      let timer: NodeJS.Timeout;

      const checkInterval = setInterval(() => {
        const match = this.eventLog.find(
          (entry) => entry.event === eventName && (!filter || filter(entry.data))
        );
        if (match) {
          clearInterval(checkInterval);
          clearTimeout(timer);
          resolve(match.data as T);
        }
      }, 25);

      timer = setTimeout(() => {
        clearInterval(checkInterval);
        const loggedNames = this.eventLog.map((e) => e.event).join(', ');
        reject(
          new Error(
            `Timeout waiting for event "${eventName}" on client "${this.nickname}" after ${timeoutMs}ms. Received events: [${loggedNames}]`
          )
        );
      }, timeoutMs);
    });
  }

  /**
   * Polls getGameState() until predicate returns true or timeout expires.
   */
  public async pollState<T = any>(
    predicate: (state: any) => boolean,
    intervalMs: number = 150,
    timeoutMs: number = 8000
  ): Promise<T> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const response = await this.getGameState();
        const state = response?.data || response;
        if (state && predicate(state)) {
          return state as T;
        }
      } catch {
        // ignore and retry until timeout
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(
      `Timeout polling game state condition on client "${this.nickname}" after ${timeoutMs}ms`
    );
  }
}
