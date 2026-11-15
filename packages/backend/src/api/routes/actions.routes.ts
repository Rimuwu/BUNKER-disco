import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { QueueProducer } from '../../queue/producer.js';
import { IdempotencyManager } from '../../queue/idempotency.js';
import { IGameTask } from '@bunker/shared/types';

export interface ActionRoutesOptions {
  queueProducer: QueueProducer;
  idempotency: IdempotencyManager;
}

const actionPayloadSchema = z.object({
  type: z.string().min(1),
  clientSequence: z.number().int().min(0).optional(),
  payload: z.record(z.any()).optional().default({}),
});

export const actionsRoutes: FastifyPluginAsync<ActionRoutesOptions> = async (fastify, opts) => {
  const { queueProducer, idempotency } = opts;

  // POST /actions
  fastify.post('/actions', { preHandler: [fastify.requireActivePlayer] }, async (request, reply) => {
    const parseResult = actionPayloadSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid action payload',
          details: parseResult.error.format(),
        },
      });
    }

    const { type, clientSequence, payload } = parseResult.data;
    const { playerId, roomId } = request.user;

    // Check sequence deduplication only if clientSequence is provided and positive (> 0)
    if (clientSequence !== undefined && clientSequence !== null && clientSequence > 0) {
      const isDuplicate = await idempotency.isDuplicate(roomId, playerId, clientSequence);
      if (isDuplicate) {
        return reply.status(200).send({
          success: true,
          data: {
            status: 'deduplicated',
            message: 'Action with this sequence has already been processed or enqueued.',
            clientSequence,
          },
        });
      }

      // Record sequence
      await idempotency.recordSequence(roomId, playerId, clientSequence);
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const task: IGameTask = {
      taskId,
      type: (type as any),
      roomId,
      playerId,
      clientSequence,
      payload,
      queuedAt: Date.now(),
    };

    const enqueueResult = await queueProducer.enqueueTask(task);

    const responseData = {
      taskId: enqueueResult.taskId,
      status: enqueueResult.status,
      type,
      estimatedProcessingMs: enqueueResult.estimatedProcessingMs,
      queueDepth: enqueueResult.queueDepth,
    };

    return reply.status(202).send({
      success: true,
      data: responseData,
      ...responseData,
    });
  });

  // GET /actions/:taskId/status
  fastify.get<{ Params: { taskId: string } }>(
    '/actions/:taskId/status',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { taskId } = request.params;
      const status = await queueProducer.getTaskStatus(taskId);

      if (!status) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: `Task with id "${taskId}" could not be found`,
          },
        });
      }

      return reply.send({
        success: true,
        data: status,
        ...status,
      });
    }
  );
};
