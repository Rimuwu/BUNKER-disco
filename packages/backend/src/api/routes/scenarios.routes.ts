import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { Repositories } from '../../db/index.js';

export interface ScenarioRoutesOptions {
  repositories: Repositories;
}

const createScenarioSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  difficulty: z.enum(['easy', 'normal', 'hard', 'extreme']).default('normal'),
  catastropheId: z.string().min(1),
  bunkerType: z.string().default('military'),
  initialDefects: z.array(z.string()).default([]),
  initialResources: z.object({
    food: z.number().int().min(0).default(100),
    water: z.number().int().min(0).default(100),
    air: z.number().int().min(0).default(100),
    medicine: z.number().int().min(0).default(100),
    power: z.number().int().min(0).default(100),
    morale: z.number().int().min(0).default(100),
  }).default({ food: 100, water: 100, air: 100, medicine: 100, power: 100, morale: 100 }),
  timeline: z.array(
    z.object({
      day: z.number().int().min(1).max(30),
      threatId: z.string().optional(),
      defectId: z.string().optional(),
      specialEvent: z.string().optional(),
    })
  ).default([]),
});

export const scenariosRoutes: FastifyPluginAsync<ScenarioRoutesOptions> = async (fastify, opts) => {
  const { repositories } = opts;

  // GET /scenarios
  fastify.get('/scenarios', async (_request, reply) => {
    const scenarios = await repositories.scenarios.findAll();
    return reply.send({
      success: true,
      data: {
        scenarios,
        total: scenarios.length,
      },
      scenarios,
    });
  });

  // GET /scenarios/:id
  fastify.get<{ Params: { id: string } }>('/scenarios/:id', async (request, reply) => {
    const scenario = await repositories.scenarios.findById(request.params.id);
    if (!scenario) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'SCENARIO_NOT_FOUND',
          message: `Scenario with id "${request.params.id}" could not be found`,
        },
      });
    }

    return reply.send({
      success: true,
      data: scenario,
      ...scenario,
    });
  });

  // POST /scenarios
  fastify.post('/scenarios', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parseResult = createScenarioSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid scenario payload',
          details: parseResult.error.format(),
        },
      });
    }

    const created = await repositories.scenarios.create({
      ...parseResult.data,
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    });

    return reply.status(201).send({
      success: true,
      data: created,
      ...created,
    });
  });
};
