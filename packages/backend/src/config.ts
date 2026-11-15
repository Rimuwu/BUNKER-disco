import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  env: string;
  port: number;
  host: string;
  mongoUrl: string;
  mongoDbName: string;
  redisUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  lockTtlSeconds: number;
}

const redisAuth = process.env.REDIS_PASSWORD ? `:${process.env.REDIS_PASSWORD}@` : '';
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';
const computedRedisUrl = `redis://${redisAuth}${redisHost}:${redisPort}`;

export const config: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  mongoUrl: process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017',
  mongoDbName: process.env.MONGO_DB_NAME || 'bunker_disco',
  redisUrl: process.env.REDIS_URL || computedRedisUrl,
  jwtSecret: process.env.JWT_SECRET || 'bunker-secret-key-change-in-production-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '120', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  lockTtlSeconds: parseInt(process.env.LOCK_TTL_SECONDS || '30', 10),
};
