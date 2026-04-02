const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { env } = require('./environment');

/**
 * Connect to MongoDB with retry logic.
 * Retries up to 5 times with exponential backoff.
 */
async function connectDB(retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      logger.info('MongoDB connected successfully');
      return;
    } catch (err) {
      logger.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) {
        logger.error('All MongoDB connection attempts exhausted. Exiting.');
        process.exit(1);
      }
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.pow(2, attempt - 1) * 1000;
      logger.info(`Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Connection event logging
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connection established');
});

mongoose.connection.on('error', (err) => {
  logger.error(`Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose connection disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
