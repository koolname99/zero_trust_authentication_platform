const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { env } = require('../config/environment');
const { getRedisClient } = require('../config/redis');
const Session = require('../models/Session');
const ms = require('ms');

/**
 * Service handling JWT token creation, rotation, and blacklisting.
 */

// Generate a short-lived access token
function generateAccessToken(user, sessionId) {
  const payload = {
    userId: user._id.toString(),
    role: user.role,
    sessionId: sessionId.toString(),
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
    jwtid: crypto.randomBytes(16).toString('hex'), // JTI for blacklisting
  });
}

// Generate Temporary MFA Token
function generateMfaToken(user, riskScore) {
  return jwt.sign(
    { userId: user._id.toString(), type: 'mfa_pending', riskScore },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '5m' }
  );
}

const mongoose = require('mongoose');

// Generate a long-lived refresh token
async function generateRefreshToken(user, sessionId, deviceInfo) {
  const actualSessionId = sessionId || new mongoose.Types.ObjectId();

  const payload = {
    userId: user._id.toString(),
    sessionId: actualSessionId.toString(),
    // Include a token family property if we implement complex family tracking
    type: 'refresh',
  };

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
    jwtid: crypto.randomBytes(16).toString('hex'),
  });

  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRY || '7d'));

  // Create session entry, using actualSessionId as _id so it matches the JWT payload
  const session = await Session.create({
    _id: actualSessionId,
    userId: user._id,
    refreshTokenHash,
    deviceFingerprint: deviceInfo.fingerprint,
    ipAddress: deviceInfo.ipAddress,
    userAgent: deviceInfo.userAgent,
    isActive: true,
    expiresAt,
  });

  return { refreshToken, session };
}

// Add token JTI to blacklist
async function blacklistToken(jti, expiryString) {
  const redisClient = getRedisClient();
  if (!redisClient) return; // Silent fallback if redis is down

  const ttlSeconds = Math.floor(ms(expiryString) / 1000);
  await redisClient.setex(`blacklist:${jti}`, ttlSeconds, 'true');
}

// Check if token jti is in redis blacklist
async function isBlacklisted(jti) {
  try {
    const redisClient = getRedisClient();
    if (!redisClient || redisClient.status !== 'ready') return false;
    
    const result = await redisClient.get(`blacklist:${jti}`);
    return result === 'true';
  } catch (err) {
    // Fail open if Redis is down
    return false;
  }
}

// Verify and decode a token
function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateMfaToken,
  blacklistToken,
  isBlacklisted,
  verifyToken,
};
