import { Server, Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { Repositories } from '../db/index.js';
import { EventBroadcaster } from './broadcaster.js';

export interface AuthenticatedSocketData {
  playerId: string;
  roomId: string;
  roomCode: string;
  nickname: string;
  isHost: boolean;
  role: 'host' | 'player' | 'spectator';
  isBigScreen?: boolean;
}

export function setupWebSocketGateway(
  app: FastifyInstance,
  repositories: Repositories,
  redis?: Redis
): { io: Server; broadcaster: EventBroadcaster } {
  const io = new Server(app.server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  const gameNamespace = io.of('/game');
  const broadcaster = new EventBroadcaster(gameNamespace);

  // Redis Pub/Sub bridge to relay worker events across Docker containers
  if (redis && typeof (redis as any).duplicate === 'function') {
    try {
      const subRedis = (redis as any).duplicate();
      subRedis.psubscribe('room:*', (err: any) => {
        if (err) console.error('[WebSocketGateway] Redis psubscribe error:', err);
      });
      subRedis.on('pmessage', (_pattern: string, channel: string, message: string) => {
        try {
          const { event, payload } = JSON.parse(message);
          gameNamespace.to(channel).emit(event, payload);
          io.to(channel).emit(event, payload);
        } catch (err) {
          console.warn('[WebSocketGateway] Failed to relay pubsub message:', err);
        }
      });
    } catch (err) {
      console.warn('[WebSocketGateway] Redis pubsub setup skipped:', err);
    }
  }

  const authMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const auth = socket.handshake.auth || {};
      const query = socket.handshake.query || {};

      const token = (auth.token || query.token || query.playerToken || '') as string;
      const roomCode = ((auth.roomCode || query.roomCode || '') as string).toUpperCase();
      const isBigScreen = Boolean(auth.isBigScreen || query.isBigScreen || query.clientType === 'bigscreen');

      if (!token) {
        // If roomCode is provided for a public bigscreen connection
        if (isBigScreen && roomCode) {
          const room = await repositories.rooms.findByCode(roomCode);
          if (room) {
            socket.data = {
              playerId: 'bigscreen',
              roomId: room.roomId,
              roomCode: room.code,
              nickname: 'BigScreen',
              isHost: false,
              role: 'spectator',
              isBigScreen: true,
            };
            return next();
          }
        }
        return next(new Error('Authentication error: Missing token'));
      }

      // Verify token with Fastify JWT
      let decoded: any;
      try {
        decoded = app.jwt.verify(token);
      } catch (jwtErr) {
        // Fallback for mocked or pre-seeded test tokens
        const playerByToken = await repositories.players.findByToken(token);
        if (playerByToken) {
          decoded = {
            playerId: playerByToken.playerId,
            roomId: playerByToken.roomId,
            isHost: playerByToken.isHost,
            role: playerByToken.role,
          };
        } else {
          return next(new Error('Authentication error: Invalid or expired token'));
        }
      }

      const player = await repositories.players.findById(decoded.playerId);
      if (!player) {
        return next(new Error('Authentication error: Player not found'));
      }

      const room = await repositories.rooms.findById(player.roomId);
      if (!room) {
        return next(new Error('Authentication error: Room not found'));
      }

      // Check room code isolation if roomCode was provided in handshake
      if (roomCode && room.code !== roomCode) {
        return next(new Error('Authentication error: Room code mismatch'));
      }

      socket.data = {
        playerId: player.playerId,
        roomId: room.roomId,
        roomCode: room.code,
        nickname: player.nickname,
        isHost: player.isHost,
        role: player.role,
        isBigScreen,
      };

      next();
    } catch (err: any) {
      next(new Error(`Authentication error: ${err.message}`));
    }
  };

  gameNamespace.use(authMiddleware);
  io.use(authMiddleware);

  const handleConnection = async (socket: Socket) => {
    const data = socket.data as AuthenticatedSocketData;
    const { roomId, playerId, nickname, isHost, isBigScreen } = data;

    // Join partitions
    socket.join(`room:${roomId}`);
    if (isBigScreen) {
      socket.join(`room:${roomId}:bigscreen`);
    } else {
      socket.join(`room:${roomId}:player:${playerId}`);
    }

    // Update connection status in DB
    if (!isBigScreen && playerId) {
      await repositories.players.updateConnection(playerId, true);
    }

    // Send hello to client
    socket.emit('server_hello', {
      version: '1.0.0',
      serverTime: new Date().toISOString(),
      playerId,
      roomId,
    });

    // Broadcast player connected to room
    broadcaster.broadcastPlayerConnected(roomId, {
      playerId,
      nickname,
    });

    // Broadcast updated lobby
    const allPlayers = await repositories.players.findByRoomId(roomId);
    const room = await repositories.rooms.findById(roomId);
    if (room) {
      broadcaster.broadcastLobbyUpdate(roomId, {
        roomId,
        code: room.code,
        playerCount: allPlayers.length,
        settings: room.settings,
        players: allPlayers.map((p) => ({
          playerId: p.playerId,
          nickname: p.nickname,
          isHost: p.isHost,
          isConnected: p.isConnected,
          isEliminated: p.isEliminated,
          avatarSeed: p.avatarSeed,
        })),
      });
    }

    // Reconnection or full state query
    socket.on('request_full_state', async () => {
      const currentRoom = await repositories.rooms.findById(roomId);
      const players = await repositories.players.findByRoomId(roomId);
      const gameState = await repositories.games.findByRoomId(roomId);
      socket.emit('reconnect_state', {
        room: currentRoom,
        players: players.map((p) => ({
          playerId: p.playerId,
          nickname: p.nickname,
          isHost: p.isHost,
          isConnected: p.isConnected,
          isEliminated: p.isEliminated,
          avatarSeed: p.avatarSeed,
        })),
        gameState,
      });
    });

    socket.on('ping', (payload: any) => {
      socket.emit('pong', { timestamp: Date.now(), clientTimestamp: payload?.timestamp });
    });

    socket.on('leave_room', async () => {
      socket.leave(`room:${roomId}`);
      if (playerId) {
        await repositories.players.updateConnection(playerId, false);
        broadcaster.broadcastPlayerDisconnected(roomId, { playerId });
      }
      socket.disconnect();
    });

    socket.on('disconnect', async () => {
      if (!isBigScreen && playerId) {
        await repositories.players.updateConnection(playerId, false);
        broadcaster.broadcastPlayerDisconnected(roomId, { playerId });

        const updatedPlayers = await repositories.players.findByRoomId(roomId);
        const currentRoom = await repositories.rooms.findById(roomId);
        if (currentRoom) {
          broadcaster.broadcastLobbyUpdate(roomId, {
            roomId,
            code: currentRoom.code,
            playerCount: updatedPlayers.length,
            settings: currentRoom.settings,
            players: updatedPlayers.map((p) => ({
              playerId: p.playerId,
              nickname: p.nickname,
              isHost: p.isHost,
              isConnected: p.isConnected,
              isEliminated: p.isEliminated,
              avatarSeed: p.avatarSeed,
            })),
          });
        }
      }
    });
  };

  gameNamespace.on('connection', handleConnection);
  io.on('connection', handleConnection);

  return { io, broadcaster };
}
