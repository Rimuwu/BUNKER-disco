import { FastifyPluginAsync } from 'fastify';
import { Repositories } from '../../db/index.js';

export interface CardRoutesOptions {
  repositories: Repositories;
}

export const cardsRoutes: FastifyPluginAsync<CardRoutesOptions> = async (fastify, opts) => {
  const { repositories } = opts;

  // GET /cards
  fastify.get<{
    Querystring: {
      type?: string;
      category?: string;
      originTag?: string;
      tags?: string;
      limit?: string;
      offset?: string;
    };
  }>('/cards', async (request, reply) => {
    const limit = parseInt(request.query.limit || '20', 10);
    const offset = parseInt(request.query.offset || '0', 10);

    const result = await repositories.cards.findAll({
      category: request.query.category,
      type: request.query.type,
      originTag: request.query.originTag,
      tags: request.query.tags,
      limit,
      offset,
    });

    return reply.send({
      success: true,
      data: {
        cards: result.cards,
        total: result.total,
        limit,
        offset,
      },
      cards: result.cards,
      total: result.total,
    });
  });

  // GET /cards/professions
  fastify.get('/cards/professions', async (_request, reply) => {
    const professions = await repositories.cards.getProfessions();
    return reply.send({
      success: true,
      data: {
        professions,
        total: professions.length,
      },
      professions,
    });
  });

  // GET /cards/craft-recipes
  fastify.get('/cards/craft-recipes', async (_request, reply) => {
    const recipes = await repositories.cards.getCraftRecipes();
    return reply.send({
      success: true,
      data: {
        recipes,
        total: recipes.length,
      },
      recipes,
    });
  });

  // GET /cards/events-catalog
  fastify.get<{ Querystring: { category?: string } }>('/cards/events-catalog', async (request, reply) => {
    const events = await repositories.cards.getEventsCatalog(request.query.category);
    return reply.send({
      success: true,
      data: {
        events,
        eventTemplates: events,
        total: events.length,
      },
    });
  });

  // GET /cards/:cardId
  fastify.get<{ Params: { cardId: string } }>('/cards/:cardId', async (request, reply) => {
    const card = await repositories.cards.findById(request.params.cardId);
    if (!card) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'CARD_NOT_FOUND',
          message: `Card with id "${request.params.cardId}" could not be found`,
        },
      });
    }

    return reply.send({
      success: true,
      data: {
        card,
        ...card,
      },
    });
  });
};
