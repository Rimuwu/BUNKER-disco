import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { config } from '../config.js';
import { createRepositories, Repositories, getMongoDb } from '../db/index.js';
import { createQueueSystem, QueueSystem } from '../queue/index.js';
import { setupWebSocketGateway } from '../ws/gateway.js';
import { EventBroadcaster } from '../ws/broadcaster.js';
import authPlugin from './plugins/auth.plugin.js';
import rateLimitPlugin from './plugins/rate-limit.plugin.js';
import swaggerPlugin from './plugins/swagger.plugin.js';
import { setupErrorHandler } from './plugins/error-handler.js';
import { roomsRoutes } from './routes/rooms.routes.js';
import { playersRoutes } from './routes/players.routes.js';
import { actionsRoutes } from './routes/actions.routes.js';
import { gameRoutes } from './routes/game.routes.js';
import { cardsRoutes } from './routes/cards.routes.js';
import { scenariosRoutes } from './routes/scenarios.routes.js';
import { systemRoutes } from './routes/system.routes.js';
import { Server as SocketIoServer } from 'socket.io';
import { createRedisClient } from '../queue/redis-client.js';

export interface BuildServerOptions {
  repositories?: Repositories;
  queueSystem?: QueueSystem;
  jwtSecret?: string;
  preferMock?: boolean;
  logger?: boolean | object;
}

export interface BunkerServerInstance extends FastifyInstance {
  repositories: Repositories;
  queueSystem: QueueSystem;
  io?: SocketIoServer;
  broadcaster?: EventBroadcaster;
}

export async function buildServer(options: BuildServerOptions = {}): Promise<BunkerServerInstance> {
  const app = Fastify({
    logger: options.logger ?? false,
  }) as unknown as BunkerServerInstance;

  // 1. Storage & Queue Setup
  const repositories = options.repositories || createRepositories(getMongoDb());
  const redis = options.queueSystem?.redis || (await createRedisClient(config.redisUrl, options.preferMock));
  const queueSystem = options.queueSystem || createQueueSystem(redis);

  app.repositories = repositories;
  app.queueSystem = queueSystem;

  // 2. Plugins Registration
  await app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.register(swaggerPlugin);
  await app.register(rateLimitPlugin);
  await app.register(authPlugin, {
    repositories,
    jwtSecret: options.jwtSecret || config.jwtSecret,
  });

  // 3. Error Handling
  setupErrorHandler(app);

  // 4. WebSocket Gateway
  const { io, broadcaster } = setupWebSocketGateway(app, repositories, redis);
  app.io = io;
  app.broadcaster = broadcaster;

  // 5. REST Routes mounting under /api/v1
  await app.register(
    async (v1) => {
      await v1.register(roomsRoutes, { repositories, broadcaster });
      await v1.register(playersRoutes, { repositories, queueProducer: queueSystem.producer, broadcaster });
      await v1.register(actionsRoutes, { queueProducer: queueSystem.producer, idempotency: queueSystem.idempotency });
      await v1.register(gameRoutes, { repositories });
      await v1.register(cardsRoutes, { repositories });
      await v1.register(scenariosRoutes, { repositories });
      await v1.register(systemRoutes, { repositories, queueProducer: queueSystem.producer });
    },
    { prefix: '/api/v1' }
  );

  // Also mount system routes at root for top-level healthcheck probes
  await app.register(systemRoutes, { repositories, queueProducer: queueSystem.producer });

  return app;
}
