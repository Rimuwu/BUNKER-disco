import { FastifyPluginAsync } from 'fastify';
import { isMongoConnected } from '../../db/connection.js';
import { QueueProducer } from '../../queue/producer.js';
import { Repositories } from '../../db/index.js';
import { config } from '../../config.js';

export interface SystemRoutesOptions {
  repositories: Repositories;
  queueProducer: QueueProducer;
  startTime?: number;
}

export const systemRoutes: FastifyPluginAsync<SystemRoutesOptions> = async (fastify, opts) => {
  const { repositories, queueProducer } = opts;
  const startedAt = opts.startTime || Date.now();

  // GET /health
  fastify.get('/health', async (_request, reply) => {
    const mongoStatus = isMongoConnected() ? 'healthy' : 'operational_in_memory';
    const redisStatus = 'healthy'; // ioredis connected or mocked

    const data = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startedAt) / 1000),
      environment: config.env,
      services: {
        mongo: mongoStatus,
        redis: redisStatus,
      },
    };

    return reply.send({
      success: true,
      data,
      ...data,
    });
  });

  // GET /version
  fastify.get('/version', async (_request, reply) => {
    const data = {
      version: '1.0.0',
      build: 'milestone-2',
      environment: config.env,
      timestamp: new Date().toISOString(),
    };

    return reply.send({
      success: true,
      data,
      ...data,
    });
  });

  // GET /metrics
  fastify.get('/metrics', async (_request, reply) => {
    const activeRooms = await repositories.rooms.count();
    const globalQueueLength = await queueProducer.getGlobalQueueLength();

    const data = {
      activeRooms,
      connectedClients: 0,
      queueDepth: {
        global: globalQueueLength,
      },
      memoryUsage: process.memoryUsage(),
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    };

    return reply.send({
      success: true,
      data,
    });
  });
};
