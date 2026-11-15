import { FastifyPluginAsync } from 'fastify';
import { Repositories } from '../../db/index.js';
import { IGameStateDocument } from '@bunker/shared/types';

export interface GameRoutesOptions {
  repositories: Repositories;
}

export const gameRoutes: FastifyPluginAsync<GameRoutesOptions> = async (fastify, opts) => {
  const { repositories } = opts;

  // Helper to resolve roomId from either roomId or roomCode
  async function resolveRoomId(identifier: string): Promise<string> {
    const byId = await repositories.rooms.findById(identifier);
    if (byId) return byId.roomId;
    const byCode = await repositories.rooms.findByCode(identifier.toUpperCase());
    if (byCode) return byCode.roomId;
    return identifier;
  }

  // GET /game/:roomId/state
  fastify.get<{ Params: { roomId: string } }>('/game/:roomId/state', async (request, reply) => {
    const rawId = request.params.roomId;
    const roomId = await resolveRoomId(rawId);

    const room = await repositories.rooms.findById(roomId);
    let gameState = await repositories.games.findByRoomId(roomId);
    if (!gameState) {
      gameState = await repositories.games.create({ roomId, phase: room?.status || 'lobby' });
    }

    const players = await repositories.players.findByRoomId(roomId);

    const data = {
      roomId,
      phase: gameState.phase,
      status: room?.status || gameState.phase,
      settings: room?.settings,
      phase1: gameState.phase1,
      phase2: gameState.phase2,
      players: players.map((p) => ({
        playerId: p.playerId,
        nickname: p.nickname,
        avatarSeed: p.avatarSeed,
        isHost: p.isHost,
        isConnected: p.isConnected,
        isEliminated: p.isEliminated,
        isInBunker: p.isInBunker,
      })),
      updatedAt: gameState.updatedAt,
    };

    return reply.send({
      success: true,
      data,
      ...data,
    });
  });

  // GET /game/:roomId/phase1
  fastify.get<{ Params: { roomId: string } }>('/game/:roomId/phase1', async (request, reply) => {
    const roomId = await resolveRoomId(request.params.roomId);
    const gameState = await repositories.games.findByRoomId(roomId);

    const phase1Data = gameState?.phase1 || {
      currentRound: 1,
      survivorsCount: 0,
      targetCapacityK: 0,
      eliminationRoundsTotal: 0,
      exiledPlayers: [],
      votingSession: {
        isOpen: false,
        timerExpiresAt: 0,
        ballots: {},
      },
    };

    return reply.send({
      success: true,
      data: phase1Data,
      ...phase1Data,
    });
  });

  // GET /game/:roomId/phase2
  fastify.get<{ Params: { roomId: string } }>('/game/:roomId/phase2', async (request, reply) => {
    const roomId = await resolveRoomId(request.params.roomId);
    const gameState = await repositories.games.findByRoomId(roomId);

    const phase2Data = gameState?.phase2 || {
      currentDay: 1,
      totalDays: 30,
      resources: {
        food: 100,
        water: 100,
        air: 100,
        medicine: 100,
        power: 100,
        morale: 100,
      },
      roomAssignments: {},
      activeThreats: [],
      activeDefects: [],
      craftQueue: [],
    };

    return reply.send({
      success: true,
      data: phase2Data,
      ...phase2Data,
    });
  });

  // GET /game/:roomId/bunker
  fastify.get<{ Params: { roomId: string } }>('/game/:roomId/bunker', async (request, reply) => {
    const roomId = await resolveRoomId(request.params.roomId);
    const gameState = await repositories.games.findByRoomId(roomId);
    const players = await repositories.players.findByRoomId(roomId);

    const data = {
      roomId,
      bunkerArchetype: 'military_standard',
      modules: [
        { roomId: 'generator', name: 'Генераторная', level: 1, status: 'operational', capacity: 2 },
        { roomId: 'greenhouse', name: 'Оранжерея', level: 1, status: 'operational', capacity: 2 },
        { roomId: 'medbay', name: 'Медотсек', level: 1, status: 'operational', capacity: 2 },
        { roomId: 'command', name: 'Командный мостик', level: 1, status: 'operational', capacity: 2 },
        { roomId: 'workshop', name: 'Мастерская', level: 1, status: 'operational', capacity: 2 },
      ],
      characters: players
        .filter((p) => !p.isEliminated)
        .map((p) => ({
          playerId: p.playerId,
          nickname: p.nickname,
          assignedRoom: gameState?.phase2?.roomAssignments?.[p.playerId] || 'command',
        })),
    };

    return reply.send({
      success: true,
      data,
    });
  });

  // GET /game/:roomId/events
  fastify.get<{ Params: { roomId: string }; Querystring: { day?: string; type?: string; limit?: string } }>(
    '/game/:roomId/events',
    async (request, reply) => {
      const roomId = await resolveRoomId(request.params.roomId);
      const day = request.query.day ? parseInt(request.query.day, 10) : undefined;
      const type = request.query.type;
      const limit = parseInt(request.query.limit || '20', 10);

      const { events, total } = await repositories.events.findByRoomId(roomId, { day, type, limit });

      return reply.send({
        success: true,
        data: {
          events,
          total,
        },
      });
    }
  );

  // GET /game/:roomId/day-log/:day
  fastify.get<{ Params: { roomId: string; day: string } }>('/game/:roomId/day-log/:day', async (request, reply) => {
    const roomId = await resolveRoomId(request.params.roomId);
    const day = parseInt(request.params.day, 10) || 1;

    const dayLog = await repositories.events.getDayLogs(roomId, day);

    return reply.send({
      success: true,
      data: dayLog,
    });
  });

  // GET /game/:roomId/results
  fastify.get<{ Params: { roomId: string } }>('/game/:roomId/results', async (request, reply) => {
    const roomId = await resolveRoomId(request.params.roomId);
    const gameState = await repositories.games.findByRoomId(roomId);
    const players = await repositories.players.findByRoomId(roomId);

    const survivors = players.filter((p) => !p.isEliminated);
    const isPerished = gameState?.phase2?.resources.air === 0 || survivors.length === 0;

    const data = {
      outcome: isPerished ? 'perished' : 'survived',
      day: gameState?.phase2?.currentDay || 30,
      survivors: survivors.map((s) => ({ playerId: s.playerId, nickname: s.nickname })),
      totalSurvivors: survivors.length,
      finalResources: gameState?.phase2?.resources || {},
    };

    return reply.send({
      success: true,
      data,
    });
  });

  // GET /game/:roomId/voting
  fastify.get<{ Params: { roomId: string } }>('/game/:roomId/voting', async (request, reply) => {
    const roomId = await resolveRoomId(request.params.roomId);
    const gameState = await repositories.games.findByRoomId(roomId);
    const players = await repositories.players.findByRoomId(roomId);
    const activePlayers = players.filter((p) => !p.isEliminated);

    const session = gameState?.phase1?.votingSession || {
      isOpen: false,
      timerExpiresAt: 0,
      ballots: {},
    };

    const data = {
      isActive: Boolean(session.isOpen),
      timerExpiresAt: session.timerExpiresAt,
      votesSubmitted: Object.keys(session.ballots || {}).length,
      totalVoters: activePlayers.length,
      ballots: session.ballots || {},
    };

    return reply.send({
      success: true,
      data,
    });
  });
};
