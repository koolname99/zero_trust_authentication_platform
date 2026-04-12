const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Load and validate environment variables first
const { validateEnv, env } = require('./config/environment');
validateEnv();

const logger = require('./utils/logger');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const requestLogger = require('./middleware/requestLogger');
const authRoutes = require('./routes/authRoutes');
const mfaRoutes = require('./routes/mfaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// ---------------------
// Security Middleware
// ---------------------
app.use(requestLogger);
app.use(helmet());
app.use(cors({
  origin: env.isDev ? 'http://localhost:5173' : process.env.FRONTEND_URL,
  credentials: true,
}));

// ---------------------
// Body Parsing
// ---------------------
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ---------------------
// Health Check
// ---------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ---------------------
// API Routes
// ---------------------
app.use('/api/auth', authRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/attacks', attackSimRoutes);
// app.use('/api/scans', scanRoutes);

// ---------------------
// 404 Handler
// ---------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---------------------
// Global Error Handler
// ---------------------
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({
    error: env.isDev ? err.message : 'Internal server error',
  });
});

// ---------------------
// Start Server
// ---------------------
async function startServer() {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`Health check: http://localhost:${env.PORT}/health`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

startServer();

module.exports = app; // Export for testing with supertest
