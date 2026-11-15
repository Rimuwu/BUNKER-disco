import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { Repositories } from '../../db/index.js';
import { EventBroadcaster } from '../../ws/broadcaster.js';
import { LobbySettingsSchema, defaultLobbySettings } from '@bunker/shared/validation';
import { DuplicateNicknameError } from '../../db/repositories/player.repository.js';

export interface RoomRoutesOptions {
  repositories: Repositories;
  broadcaster: EventBroadcaster;
}

const createRoomSchema = z.object({
  nickname: z.string().min(1).max(30),
  settings: LobbySettingsSchema.partial().optional(),
});

const joinRoomSchema = z.object({
  nickname: z.string().min(1).max(30),
});

export const roomsRoutes: FastifyPluginAsync<RoomRoutesOptions> = async (fastify, opts) => {
  const { repositories, broadcaster } = opts;

  // POST /rooms
  fastify.post('/rooms', async (request, reply) => {
    const parseResult = createRoomSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid room creation parameters',
          details: parseResult.error.format(),
        },
      });
    }

    const { nickname, settings } = parseResult.data;
    const initialSettings = { ...defaultLobbySettings, ...(settings || {}) };

    // 1. Generate room
    const hostId = `p_host_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const room = await repositories.rooms.create({
      hostId,
      settings: initialSettings,
    });

    // 2. Sign JWT for host
    const playerToken = fastify.jwt.sign({
      playerId: hostId,
      roomId: room.roomId,
      roomCode: room.code,
      isHost: true,
      role: 'host',
    });

    // 3. Create host player
    const hostPlayer = await repositories.players.create({
      roomId: room.roomId,
      nickname,
      isHost: true,
      token: playerToken,
      remainingRerolls: initialSettings.rerollLimit,
      customPlayerId: hostId,
    });

    // 4. Initialize game state in 'lobby'
    await repositories.games.create({
      roomId: room.roomId,
      phase: 'lobby',
    });

    const responseData = {
      roomId: room.roomId,
      code: room.code,
      roomCode: room.code,
      playerId: hostPlayer.playerId,
      playerToken,
      token: playerToken,
      isHost: true,
      nickname: hostPlayer.nickname,
      settings: room.settings,
    };

    return reply.status(201).send({
      success: true,
      data: responseData,
      ...responseData,
    });
  });

  // GET /rooms/:code
  fastify.get<{ Params: { code: string } }>('/rooms/:code', async (request, reply) => {
    const code = request.params.code.toUpperCase();
    const room = await repositories.rooms.findByCode(code);
    if (!room) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'ROOM_NOT_FOUND',
          message: `Room with code "${code}" does not exist`,
        },
      });
    }

    const players = await repositories.players.findByRoomId(room.roomId);
    const data = {
      roomId: room.roomId,
      code: room.code,
      roomCode: room.code,
      status: room.status,
      playerCount: players.length,
      maxPlayers: room.maxPlayers,
      settings: room.settings,
      createdAt: room.createdAt,
    };

    return reply.send({
      success: true,
      data,
      ...data,
    });
  });

  // POST /rooms/:code/join
  fastify.post<{ Params: { code: string } }>('/rooms/:code/join', async (request, reply) => {
    const code = request.params.code.toUpperCase();
    const room = await repositories.rooms.findByCode(code);
    if (!room) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'ROOM_NOT_FOUND',
          message: `Room with code "${code}" was not found`,
        },
      });
    }

    if (room.status !== 'lobby') {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'ROOM_STARTED',
          message: 'Cannot join room after the game has already started',
        },
      });
    }

    const parseResult = joinRoomSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid join parameters',
          details: parseResult.error.format(),
        },
      });
    }

    const { nickname } = parseResult.data;
    const currentPlayers = await repositories.players.findByRoomId(room.roomId);
    if (currentPlayers.length >= room.maxPlayers) {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'ROOM_FULL',
          message: `Room is full (maximum ${room.maxPlayers} players allowed)`,
        },
      });
    }

    // Check duplicate nickname
    const existingNick = await repositories.players.findByRoomAndNickname(room.roomId, nickname);
    if (existingNick) {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'NICKNAME_TAKEN',
          message: `Никнейм "${nickname}" уже занят в этой комнате`,
        },
      });
    }

    const playerId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const playerToken = fastify.jwt.sign({
      playerId,
      roomId: room.roomId,
      roomCode: room.code,
      isHost: false,
      role: 'player',
    });

    try {
      const player = await repositories.players.create({
        roomId: room.roomId,
        nickname,
        isHost: false,
        token: playerToken,
        remainingRerolls: room.settings.rerollLimit,
        customPlayerId: playerId,
      });

      await repositories.rooms.incrementPlayerCount(room.roomId, 1);

      // WebSocket broadcasts
      broadcaster.broadcastPlayerConnected(room.roomId, {
        playerId: player.playerId,
        nickname: player.nickname,
      });

      const updatedPlayers = await repositories.players.findByRoomId(room.roomId);
      broadcaster.broadcastLobbyUpdate(room.roomId, {
        roomId: room.roomId,
        code: room.code,
        playerCount: updatedPlayers.length,
        settings: room.settings,
        players: updatedPlayers.map((p) => ({
          playerId: p.playerId,
          nickname: p.nickname,
          isHost: p.isHost,
          isConnected: p.isConnected,
          isEliminated: p.isEliminated,
          avatarSeed: p.avatarSeed,
        })),
      });

      const data = {
        roomId: room.roomId,
        code: room.code,
        roomCode: room.code,
        playerId: player.playerId,
        playerToken,
        token: playerToken,
        nickname: player.nickname,
        isHost: false,
        currentState: 'lobby',
      };

      return reply.send({
        success: true,
        data,
        ...data,
      });
    } catch (err: any) {
      if (err instanceof DuplicateNicknameError || err.code === 'NICKNAME_TAKEN') {
        return reply.status(409).send({
          success: false,
          error: {
            code: 'NICKNAME_TAKEN',
            message: `Никнейм "${nickname}" уже занят в этой комнате`,
          },
        });
      }
      throw err;
    }
  });

  // GET /rooms/:code/players
  fastify.get<{ Params: { code: string } }>(
    '/rooms/:code/players',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const code = request.params.code.toUpperCase();
      const room = await repositories.rooms.findByCode(code);
      if (!room) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'ROOM_NOT_FOUND',
            message: `Room with code "${code}" was not found`,
          },
        });
      }

      const players = await repositories.players.findByRoomId(room.roomId);
      const data = {
        players: players.map((p) => ({
          playerId: p.playerId,
          nickname: p.nickname,
          isHost: p.isHost,
          isConnected: p.isConnected,
          isEliminated: p.isEliminated,
          avatarSeed: p.avatarSeed,
        })),
        total: players.length,
      };

      return reply.send({
        success: true,
        data,
        ...data,
      });
    }
  );

  // GET /rooms/:code/settings
  fastify.get<{ Params: { code: string } }>(
    '/rooms/:code/settings',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const code = request.params.code.toUpperCase();
      const room = await repositories.rooms.findByCode(code);
      if (!room) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'ROOM_NOT_FOUND',
            message: `Room with code "${code}" was not found`,
          },
        });
      }

      return reply.send({
        success: true,
        data: {
          settings: room.settings,
          ...room.settings,
        },
        ...room.settings,
      });
    }
  );

  // PATCH /rooms/:code/settings
  fastify.patch<{ Params: { code: string } }>(
    '/rooms/:code/settings',
    { preHandler: [fastify.requireHost] },
    async (request, reply) => {
      const code = request.params.code.toUpperCase();
      const room = await repositories.rooms.findByCode(code);
      if (!room) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'ROOM_NOT_FOUND',
            message: `Room with code "${code}" was not found`,
          },
        });
      }

      if (room.status !== 'lobby') {
        return reply.status(409).send({
          success: false,
          error: {
            code: 'ROOM_STARTED',
            message: 'Room settings cannot be modified after the game has started',
          },
        });
      }

      const body = request.body as any;
      const parseResult = LobbySettingsSchema.partial().safeParse(body?.settings || body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid lobby settings values',
            details: parseResult.error.format(),
          },
        });
      }

      const updated = await repositories.rooms.updateSettings(room.roomId, parseResult.data);
      if (!updated) {
        return reply.status(500).send({
          success: false,
          error: { code: 'INTERNAL_ERROR', message: 'Failed to update room settings' },
        });
      }

      broadcaster.broadcastSettingsUpdated(room.roomId, { settings: updated.settings });

      return reply.send({
        success: true,
        data: {
          settings: updated.settings,
          ...updated.settings,
        },
        ...updated.settings,
      });
    }
  );

  // GET /rooms/:code/logs
  fastify.get<{ Params: { code: string }; Querystring: { limit?: string; offset?: string; phase?: string } }>(
    '/rooms/:code/logs',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const code = request.params.code.toUpperCase();
      const room = await repositories.rooms.findByCode(code);
      if (!room) {
        return reply.status(404).send({
          success: false,
          error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' },
        });
      }

      const limit = parseInt(request.query.limit || '50', 10);
      const offset = parseInt(request.query.offset || '0', 10);
      const phase = request.query.phase;

      const { events, total } = await repositories.events.findByRoomId(room.roomId, {
        limit,
        offset,
        phase,
      });

      return reply.send({
        success: true,
        data: {
          logs: events,
          total,
        },
      });
    }
  );

  // DELETE /rooms/:code
  fastify.delete<{ Params: { code: string } }>(
    '/rooms/:code',
    { preHandler: [fastify.requireHost] },
    async (request, reply) => {
      const code = request.params.code.toUpperCase();
      const room = await repositories.rooms.findByCode(code);
      if (!room) {
        return reply.status(404).send({
          success: false,
          error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' },
        });
      }

      await repositories.rooms.deleteByCode(code);
      broadcaster.broadcastRoomClosed(room.roomId, { reason: 'Room closed by host' });

      return reply.send({
        success: true,
        data: { closed: true },
      });
    }
  );
};
