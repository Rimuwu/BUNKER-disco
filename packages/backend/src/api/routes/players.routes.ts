import { FastifyPluginAsync } from 'fastify';
import { Repositories } from '../../db/index.js';
import { QueueProducer } from '../../queue/producer.js';
import { EventBroadcaster } from '../../ws/broadcaster.js';
import { IGameTask } from '@bunker/shared/types';

export interface PlayerRoutesOptions {
  repositories: Repositories;
  queueProducer: QueueProducer;
  broadcaster: EventBroadcaster;
}

export const playersRoutes: FastifyPluginAsync<PlayerRoutesOptions> = async (fastify, opts) => {
  const { repositories, queueProducer, broadcaster } = opts;

  // GET /players/me
  fastify.get('/players/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const player = await repositories.players.findById(request.user.playerId);
    if (!player) {
      return reply.status(404).send({
        success: false,
        error: { code: 'PLAYER_NOT_FOUND', message: 'Player dossier not found' },
      });
    }

    const dossier = {
      playerId: player.playerId,
      roomId: player.roomId,
      nickname: player.nickname,
      avatarSeed: player.avatarSeed,
      isHost: player.isHost,
      isEliminated: player.isEliminated,
      isInBunker: player.isInBunker,
      remainingRerolls: player.remainingRerolls,
      actionPoints: player.actionPoints,
      cards: player.cards,
      abilities: player.abilities,
      stats: player.stats,
      inventory: player.inventory,
      quests: player.secretQuests,
    };

    return reply.send({
      success: true,
      data: dossier,
      ...dossier,
    });
  });

  // GET /players/me/inventory
  fastify.get('/players/me/inventory', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const player = await repositories.players.findById(request.user.playerId);
    if (!player) {
      return reply.status(404).send({
        success: false,
        error: { code: 'PLAYER_NOT_FOUND', message: 'Player not found' },
      });
    }

    const totalWeight = player.inventory.reduce((acc, item) => acc + (item.weight * (item.quantity || 1)), 0);
    const data = {
      items: player.inventory,
      totalWeight,
      maxWeight: 10,
    };

    return reply.send({
      success: true,
      data,
    });
  });

  // GET /players/me/quests
  fastify.get('/players/me/quests', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const player = await repositories.players.findById(request.user.playerId);
    if (!player) {
      return reply.status(404).send({
        success: false,
        error: { code: 'PLAYER_NOT_FOUND', message: 'Player not found' },
      });
    }

    return reply.send({
      success: true,
      data: {
        quests: player.secretQuests,
      },
    });
  });

  // GET /players/me/stats
  fastify.get('/players/me/stats', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const player = await repositories.players.findById(request.user.playerId);
    if (!player) {
      return reply.status(404).send({
        success: false,
        error: { code: 'PLAYER_NOT_FOUND', message: 'Player not found' },
      });
    }

    return reply.send({
      success: true,
      data: {
        stats: player.stats,
        ...player.stats,
      },
    });
  });

  // GET /players/me/abilities
  fastify.get('/players/me/abilities', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const player = await repositories.players.findById(request.user.playerId);
    if (!player) {
      return reply.status(404).send({
        success: false,
        error: { code: 'PLAYER_NOT_FOUND', message: 'Player not found' },
      });
    }

    return reply.send({
      success: true,
      data: {
        abilities: player.abilities,
      },
    });
  });

  // POST /players/reroll
  fastify.post('/players/reroll', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const player = await repositories.players.findById(request.user.playerId);
    if (!player) {
      return reply.status(404).send({
        success: false,
        error: { code: 'PLAYER_NOT_FOUND', message: 'Player not found' },
      });
    }

    if (player.remainingRerolls <= 0) {
      return reply.status(422).send({
        success: false,
        error: {
          code: 'NO_REROLLS_LEFT',
          message: 'No mulligan rerolls remaining',
        },
      });
    }

    const body = (request.body || {}) as any;
    const clientSequence = body.clientSequence ?? 0;

    const taskId = `task_reroll_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const task: IGameTask = {
      taskId,
      type: 'CLIENT_ACTION',
      roomId: player.roomId,
      playerId: player.playerId,
      clientSequence,
      payload: {
        action: 'PLAYER_REROLL',
      },
      queuedAt: Date.now(),
    };

    // Enqueue task to Redis per-room queue
    await queueProducer.enqueueTask(task);

    // Decrement remaining rerolls
    const updated = await repositories.players.updateRerolls(player.playerId, -1);
    const remainingRerolls = updated ? updated.remainingRerolls : 0;

    const data = {
      taskId,
      status: 'queued',
      remainingRerolls,
    };

    return reply.status(202).send({
      success: true,
      data,
      ...data,
    });
  });

  // GET /players/:playerId (public dossier)
  fastify.get<{ Params: { playerId: string } }>(
    '/players/:playerId',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const targetPlayerId = request.params.playerId;
      const player = await repositories.players.findById(targetPlayerId);
      if (!player) {
        return reply.status(404).send({
          success: false,
          error: { code: 'PLAYER_NOT_FOUND', message: 'Target player not found' },
        });
      }

      // Filter only revealed cards
      const revealedCards: Record<string, any> = {};
      for (const [cat, card] of Object.entries(player.cards || {})) {
        if (card?.isRevealed) {
          revealedCards[cat] = card;
        }
      }

      const data = {
        playerId: player.playerId,
        nickname: player.nickname,
        avatarSeed: player.avatarSeed,
        isHost: player.isHost,
        isEliminated: player.isEliminated,
        revealedCards,
      };

      return reply.send({
        success: true,
        data,
      });
    }
  );

  // GET /players/:roomId/leaderboard
  fastify.get<{ Params: { roomId: string } }>(
    '/players/:roomId/leaderboard',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { roomId } = request.params;
      const players = await repositories.players.findByRoomId(roomId);

      const rankings = players
        .map((p) => ({
          playerId: p.playerId,
          nickname: p.nickname,
          isEliminated: p.isEliminated,
          isInBunker: p.isInBunker,
          health: p.stats.health,
          morale: p.stats.morale,
          score: (p.isInBunker ? 100 : 0) + p.stats.health + p.stats.morale,
        }))
        .sort((a, b) => b.score - a.score);

      return reply.send({
        success: true,
        data: {
          rankings,
        },
      });
    }
  );
};
