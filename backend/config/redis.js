const Redis = require('ioredis');
const logger = require('../utils/logger');
const { env } = require('./environment');

let redisClient = null;

/**
 * Creates and returns a Redis client with connection pooling
 * and graceful error handling / reconnection.
 */
function createRedisClient() {
  if (redisClient) return redisClient;

  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 10) {
        logger.error('Redis: max retry attempts reached. Giving up.');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 200, 5000);
      logger.warn(`Redis: reconnecting in ${delay}ms (attempt ${times})`);
      return delay;
    },
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    logger.info('Redis client connected');
  });

  redisClient.on('ready', () => {
    logger.info('Redis client ready');
  });

  redisClient.on('error', (err) => {
    logger.error(`Redis client error: ${err.message}`);
  });

  redisClient.on('close', () => {
    logger.warn('Redis connection closed');
  });

  return redisClient;
}

/**
 * Connect the Redis client. Call this during server startup.
 * Non-fatal: logs a warning if Redis is unavailable.
 */
async function connectRedis() {
  try {
    const client = createRedisClient();
    await client.connect();
    logger.info('Redis connected successfully');
    return client;
  } catch (err) {
    logger.warn(`Redis connection failed: ${err.message}. Some features may be unavailable.`);
    return null;
  }
}

/**
 * Returns the existing Redis client (or null if not connected).
 */
function getRedisClient() {
  return redisClient;
}

module.exports = { connectRedis, getRedisClient, createRedisClient };
