import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../../config.js';
import { Repositories } from '../../db/index.js';

export interface JwtUserPayload {
  playerId: string;
  roomId: string;
  roomCode: string;
  isHost: boolean;
  role: 'host' | 'player' | 'spectator';
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireHost: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireActivePlayer: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtUserPayload;
    user: JwtUserPayload;
  }
}

export interface AuthPluginOptions {
  repositories: Repositories;
  jwtSecret?: string;
}

const authPlugin: FastifyPluginAsync<AuthPluginOptions> = async (fastify, opts) => {
  await fastify.register(fastifyJwt, {
    secret: opts.jwtSecret || config.jwtSecret,
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // 1. Try standard jwtVerify
      await request.jwtVerify();
    } catch (err: any) {
      // 2. Fallback check for raw token in auth header matching DB/in-memory records
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const rawToken = authHeader.substring(7).trim();
        const player = await opts.repositories.players.findByToken(rawToken);
        if (player) {
          const room = await opts.repositories.rooms.findById(player.roomId);
          request.user = {
            playerId: player.playerId,
            roomId: player.roomId,
            roomCode: room ? room.code : '',
            isHost: player.isHost,
            role: player.role,
          };
          // proceed
        } else {
          return reply.status(401).send({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid or expired authorization token',
            },
          });
        }
      } else {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Authorization Bearer token is required',
          },
        });
      }
    }

    // Check room isolation if X-Room-Code header is present
    const roomCodeHeader = request.headers['x-room-code'] as string;
    if (roomCodeHeader && request.user.roomCode) {
      if (roomCodeHeader.toUpperCase() !== request.user.roomCode.toUpperCase()) {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'WRONG_ROOM',
            message: 'Token does not match the requested room code',
          },
        });
      }
    }

    // Check room isolation if URL param code or roomCode is present
    const paramCode = (request.params as any)?.code || (request.params as any)?.roomCode;
    if (paramCode && request.user?.roomCode && paramCode.toUpperCase() !== request.user.roomCode.toUpperCase()) {
      return reply.status(403).send({
        success: false,
        error: {
          code: 'WRONG_ROOM',
          message: 'Токен выдан для другой комнаты',
        },
      });
    }
  });

  fastify.decorate('requireHost', async (request: FastifyRequest, reply: FastifyReply) => {
    await fastify.authenticate(request, reply);
    if (reply.sent) return;

    const paramCode = (request.params as any)?.code || (request.params as any)?.roomCode;
    if (paramCode && request.user?.roomCode && paramCode.toUpperCase() !== request.user.roomCode.toUpperCase()) {
      return reply.status(403).send({
        success: false,
        error: {
          code: 'WRONG_ROOM',
          message: 'Токен выдан для другой комнаты',
        },
      });
    }

    if (!request.user || !request.user.isHost) {
      return reply.status(403).send({
        success: false,
        error: {
          code: 'NOT_HOST',
          message: 'Только создатель комнаты может изменять настройки',
        },
      });
    }
  });

  fastify.decorate('requireActivePlayer', async (request: FastifyRequest, reply: FastifyReply) => {
    await fastify.authenticate(request, reply);
    if (reply.sent) return;

    const player = await opts.repositories.players.findById(request.user.playerId);
    if (!player) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'PLAYER_NOT_FOUND',
          message: 'Player profile could not be found',
        },
      });
    }

    if (player.isEliminated) {
      return reply.status(403).send({
        success: false,
        error: {
          code: 'PLAYER_ELIMINATED',
          message: 'Eliminated players cannot perform mutative actions',
        },
      });
    }
  });
};

export default fp(authPlugin);
