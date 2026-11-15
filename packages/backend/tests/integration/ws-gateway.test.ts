import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { io as ioClient, Socket } from 'socket.io-client';
import { buildServer, BunkerServerInstance } from '../../src/api/server.js';
import { createRepositories } from '../../src/db/index.js';
import { createQueueSystem } from '../../src/queue/index.js';
import { createRedisClient } from '../../src/queue/redis-client.js';

describe('Integration: Socket.io Real-Time WebSocket Gateway', () => {
  let app: BunkerServerInstance;
  let clientSocket: Socket | null = null;
  let serverPort: number;

  beforeEach(async () => {
    const repos = createRepositories();
    const redis = await createRedisClient(undefined, true);
    const queue = createQueueSystem(redis);

    app = await buildServer({
      repositories: repos,
      queueSystem: queue,
      jwtSecret: 'ws-test-secret-12345',
      preferMock: true,
      logger: false,
    });

    const address = await app.listen({ port: 0, host: '127.0.0.1' });
    const match = address.match(/:(\d+)$/);
    serverPort = match ? parseInt(match[1], 10) : 3000;
  });

  afterEach(async () => {
    if (clientSocket) {
      clientSocket.disconnect();
      clientSocket = null;
    }
    if (app.io) {
      app.io.close();
    }
    await app.close();
  });

  it('authenticates and establishes connection to /game namespace', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h_ws', customCode: 'WS001' });
    const token = app.jwt.sign({
      playerId: 'h_ws',
      roomId: room.roomId,
      roomCode: 'WS001',
      isHost: true,
      role: 'host' as const,
    });
    await app.repositories.players.create({
      roomId: room.roomId,
      nickname: 'SocketHost',
      token,
      isHost: true,
      customPlayerId: 'h_ws',
    });

    await new Promise<void>((resolve, reject) => {
      clientSocket = ioClient(`http://127.0.0.1:${serverPort}/game`, {
        auth: {
          token,
          roomCode: 'WS001',
        },
        transports: ['websocket'],
      });

      clientSocket.on('connect', () => {
        expect(clientSocket?.connected).toBe(true);
        resolve();
      });

      clientSocket.on('connect_error', (err) => {
        reject(err);
      });
    });
  });

  it('receives broadcaster events on room partition channel', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h_ws2', customCode: 'WS002' });
    const token = app.jwt.sign({
      playerId: 'h_ws2',
      roomId: room.roomId,
      roomCode: 'WS002',
      isHost: true,
      role: 'host' as const,
    });
    await app.repositories.players.create({
      roomId: room.roomId,
      nickname: 'SocketHost2',
      token,
      isHost: true,
      customPlayerId: 'h_ws2',
    });

    await new Promise<void>((resolve, reject) => {
      clientSocket = ioClient(`http://127.0.0.1:${serverPort}/game`, {
        auth: { token, roomCode: 'WS002' },
        transports: ['websocket'],
      });

      clientSocket.on('connect', () => {
        clientSocket?.on('card_revealed', (data) => {
          expect(data.cardType).toBe('profession');
          expect(data.playerId).toBe('h_ws2');
          resolve();
        });

        // Trigger broadcast
        app.broadcaster?.broadcastCardRevealed(room.roomId, {
          playerId: 'h_ws2',
          cardType: 'profession',
          cardData: { name: 'Хирург' },
        });
      });

      clientSocket.on('connect_error', (err) => reject(err));
    });
  });
});
