const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { getRedisClient } = require('../config/redis');
const { RATE_LIMITS } = require('../utils/constants');
const logger = require('../utils/logger');

function createRateLimiter(options) {
  const redisClient = getRedisClient();

  if (!redisClient) {
    logger.warn('Redis client not available for rate limiter, falling back to memory store.');
  }

  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }) : undefined,
  });
}

const loginLimiter = createRateLimiter(RATE_LIMITS.LOGIN);
const registerLimiter = createRateLimiter(RATE_LIMITS.REGISTER);
const refreshLimiter = createRateLimiter(RATE_LIMITS.REFRESH);
const generalLimiter = createRateLimiter(RATE_LIMITS.GENERAL);

module.exports = {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  generalLimiter,
};
