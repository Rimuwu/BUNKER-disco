import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export function setupErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError | any, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error);

    // Fastify schema validation error
    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message || 'Request validation failed',
          details: error.validation,
        },
      });
    }

    // Rate limit error
    if (error.statusCode === 429) {
      return reply.status(429).send({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: error.message || 'Too many requests, please try again later',
        },
      });
    }

    // Explicit business error codes
    const statusCode = error.statusCode || error.status || 500;
    const code = error.code || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 403 ? 'FORBIDDEN' : statusCode === 401 ? 'UNAUTHORIZED' : statusCode === 409 ? 'CONFLICT' : 'INTERNAL_SERVER_ERROR');

    reply.status(statusCode).send({
      success: false,
      error: {
        code,
        message: error.message || 'An unexpected internal server error occurred',
        details: error.details,
      },
    });
  });

  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
      },
    });
  });
}
