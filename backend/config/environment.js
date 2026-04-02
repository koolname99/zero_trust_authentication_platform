const dotenv = require('dotenv');
const path = require('path');

// Load .env file from backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const requiredVars = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRY',
  'JWT_REFRESH_EXPIRY',
  'MFA_ENCRYPTION_KEY',
];

/**
 * Validates that all required environment variables are set.
 * Fails fast with a descriptive error if any are missing.
 */
function validateEnv() {
  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('=== MISSING ENVIRONMENT VARIABLES ===');
    missing.forEach((key) => console.error(`  - ${key}`));
    console.error('=====================================');
    console.error('Copy .env.example to .env and fill in all values.');
    process.exit(1);
  }
}

const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '5m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  MFA_ENCRYPTION_KEY: process.env.MFA_ENCRYPTION_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
};

module.exports = { validateEnv, env };
