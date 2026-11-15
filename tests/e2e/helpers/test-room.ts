import { TestClient } from './test-client';
import { LobbySettings } from './mock-payloads';

export interface TestRoomOptions {
  playerCount: number;
  settings?: Partial<LobbySettings> | Record<string, any>;
  baseUrl?: string;
  nicknamePrefix?: string;
  autoConnectSockets?: boolean;
}

export class TestRoom {
  public readonly host: TestClient;
  public readonly clients: TestClient[];
  public roomId: string = '';
  public roomCode: string = '';
  public readonly options: TestRoomOptions;

  constructor(host: TestClient, clients: TestClient[], options: TestRoomOptions) {
    this.host = host;
    this.clients = clients;
    this.options = options;
  }

  /**
   * Factory method: Creates a room and joins N players sequentially or in parallel.
   */
  public static async create(options: TestRoomOptions): Promise<TestRoom> {
    const {
      playerCount,
      settings = {},
      baseUrl,
      nicknamePrefix = 'Player',
      autoConnectSockets = false,
    } = options;

    if (playerCount < 1) {
      throw new Error(`TestRoom requires at least 1 player, received ${playerCount}`);
    }

    const hostNickname = `${nicknamePrefix}_1_Host`;
    const host = new TestClient({ nickname: hostNickname, baseUrl });
    const roomData = await host.createRoom(settings);

    const roomCode = host.roomCode;
    const roomId = host.roomId;

    const clients: TestClient[] = [host];

    for (let i = 2; i <= playerCount; i++) {
      const playerNickname = `${nicknamePrefix}_${i}`;
      const client = new TestClient({ nickname: playerNickname, baseUrl });
      await client.joinRoom(roomCode);
      clients.push(client);
    }

    const room = new TestRoom(host, clients, options);
    room.roomCode = roomCode;
    room.roomId = roomId;

    if (autoConnectSockets) {
      await room.connectAllSockets();
    }

    return room;
  }

  /**
   * Returns a client by index (0 = host, 1 = player 2, etc.).
   */
  public getClient(index: number): TestClient {
    if (index < 0 || index >= this.clients.length) {
      throw new Error(`Client index ${index} out of bounds (total: ${this.clients.length})`);
    }
    return this.clients[index];
  }

  /**
   * Returns a client by nickname.
   */
  public getClientByNickname(nickname: string): TestClient | undefined {
    return this.clients.find((c) => c.nickname === nickname);
  }

  /**
   * Returns all clients participating in the room.
   */
  public getAllClients(): TestClient[] {
    return [...this.clients];
  }

  /**
   * Connects WebSocket for all clients in parallel.
   */
  public async connectAllSockets(): Promise<void> {
    await Promise.all(this.clients.map((client) => client.connectSocket()));
  }

  /**
   * Awaits a specific event across all connected clients simultaneously.
   */
  public async waitForAll<T = any>(
    eventName: string,
    filter?: (data: T) => boolean,
    timeoutMs: number = 8000
  ): Promise<T[]> {
    return Promise.all(
      this.clients.map((client) => client.waitForEvent<T>(eventName, filter, timeoutMs))
    );
  }

  /**
   * Triggers a game action on all clients in parallel.
   */
  public async sendActionAsAll(
    type: string,
    payloadGenerator: (client: TestClient, index: number) => Record<string, any> = () => ({})
  ): Promise<any[]> {
    return Promise.all(
      this.clients.map((client, idx) => client.sendAction(type, payloadGenerator(client, idx)))
    );
  }

  /**
   * Clears event logs across all clients.
   */
  public clearAllEventLogs(): void {
    for (const client of this.clients) {
      client.clearEventLog();
    }
  }

  /**
   * Cleans up all client connections and closes the room.
   */
  public destroy(): void {
    for (const client of this.clients) {
      client.disconnect();
    }
  }
}
