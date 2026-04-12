const User = require('../models/User');
const Session = require('../models/Session');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');
const tokenService = require('./tokenService');
const riskEvaluator = require('../middleware/riskEvaluator');
const { AUDIT_ACTIONS, MAX_FAILED_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES } = require('../utils/constants');
const { env } = require('../config/environment');

/**
 * Service handling core authentication logic (Login, Register, Refresh)
 */

async function register(email, password, ipAddress, userAgent) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const user = new User({ email, passwordHash: password }); // pre-save hashes this
  await user.save();

  // Audit
  await AuditLog.create({
    userId: user._id,
    action: AUDIT_ACTIONS.REGISTER,
    ipAddress,
    userAgent,
  });

  return user;
}

async function login(email, password, deviceInfo) {
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (user.isLockedOut()) {
    await AuditLog.create({ userId: user._id, action: AUDIT_ACTIONS.ACCOUNT_LOCKED, ipAddress: deviceInfo.ipAddress, userAgent: deviceInfo.userAgent });
    throw new Error('Account is locked due to too many failed attempts. Try again later.');
  }

  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      user.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000);
    }
    await user.save();
    
    await AuditLog.create({ userId: user._id, action: AUDIT_ACTIONS.LOGIN_FAILURE, ipAddress: deviceInfo.ipAddress, userAgent: deviceInfo.userAgent });
    throw new Error('Invalid email or password');
  }

  // Success
  user.failedLoginAttempts = 0;
  user.lockoutUntil = undefined;
  await user.save();

  // Evaluate Risk before granting access
  const riskResult = await riskEvaluator.evaluateRiskAndEnforce(user._id, deviceInfo);

  const historyEntry = {
    ipAddress: deviceInfo.ipAddress,
    country: riskResult.location.country,
    city: riskResult.location.city,
    latitude: riskResult.location.latitude,
    longitude: riskResult.location.longitude,
    deviceFingerprint: deviceInfo.fingerprint,
    outcome: riskResult.responseAction === 'BLOCK' ? 'BLOCKED' : (riskResult.responseAction.includes('MFA') ? 'CHALLENGED' : 'SUCCESS'),
    riskScore: riskResult.score
  };

  riskResult.profile.addLoginHistory(historyEntry);
  
  if (historyEntry.outcome === 'SUCCESS') {
    if (!riskResult.profile.knownIPs.includes(deviceInfo.ipAddress)) riskResult.profile.knownIPs.push(deviceInfo.ipAddress);
    if (!riskResult.profile.knownDevices.includes(deviceInfo.fingerprint) && deviceInfo.fingerprint !== 'unknown') riskResult.profile.knownDevices.push(deviceInfo.fingerprint);
    if (!riskResult.profile.knownGeoLocations.includes(riskResult.geoString) && riskResult.location.country !== 'UNKNOWN') riskResult.profile.knownGeoLocations.push(riskResult.geoString);
  }
  
  await riskResult.profile.save();

  if (riskResult.responseAction === 'BLOCK') {
    user.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000);
    await user.save();
    await AuditLog.create({ userId: user._id, action: AUDIT_ACTIONS.ACCOUNT_LOCKED, ipAddress: deviceInfo.ipAddress, userAgent: deviceInfo.userAgent, riskScore: riskResult.score });
    throw new Error('Security violation: Login blocked due to critical risk factors. Account automatically locked.');
  }

  // If MFA is required (either by user setting or risk score)
  if (user.mfaEnabled || riskResult.responseAction.includes('MFA')) {
    const mfaToken = tokenService.generateMfaToken(user);
    // Don't generate actual sessions yet
    return {
      mfaRequired: true,
      mfaToken,
      riskScore: riskResult.score
    };
  }

  // Otherwise, normal login
  const { refreshToken, session } = await tokenService.generateRefreshToken(user, null, deviceInfo);
  const accessToken = tokenService.generateAccessToken(user, session._id);

  await AuditLog.create({ userId: user._id, action: AUDIT_ACTIONS.LOGIN_SUCCESS, ipAddress: deviceInfo.ipAddress, userAgent: deviceInfo.userAgent, riskScore: riskResult.score });

  return { user, accessToken, refreshToken, riskScore: riskResult.score, mfaRequired: false };
}

async function logout(sessionId, accessTokenJti) {
  // Disable Session
  if (sessionId) {
    await Session.findByIdAndUpdate(sessionId, { isActive: false });
  }

  // Blacklist token
  if (accessTokenJti) {
    await tokenService.blacklistToken(accessTokenJti, env.JWT_ACCESS_EXPIRY);
  }
}

async function refreshTokens(oldRefreshToken, deviceInfo) {
  const decoded = tokenService.verifyToken(oldRefreshToken, env.JWT_REFRESH_SECRET);
  if (!decoded) throw new Error('Invalid or expired refresh token');

  const refreshTokenHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
  const session = await Session.findOne({ _id: decoded.sessionId, isActive: true });

  if (!session) throw new Error('Session is inactive or invalid');

  // Reuse detection mechanism
  if (session.refreshTokenHash !== refreshTokenHash) {
    // REPLAY ATTACK detected - revoke session entirely
    session.isActive = false;
    await session.save();
    await AuditLog.create({ userId: decoded.userId, action: AUDIT_ACTIONS.SESSION_REVOKED, metadata: { reason: 'Refresh token reuse detected' } });
    throw new Error('Security violation: token reuse detected');
  }

  const user = await User.findById(decoded.userId);
  if (!user) throw new Error('User not found');

  // Issue new tokens
  const { refreshToken: newRefreshToken, session: newSession } = await tokenService.generateRefreshToken(user, null, deviceInfo);
  const newAccessToken = tokenService.generateAccessToken(user, newSession._id);

  // Invalidate old session
  session.isActive = false;
  await session.save();

  await AuditLog.create({ userId: user._id, action: AUDIT_ACTIONS.TOKEN_REFRESH, ipAddress: deviceInfo.ipAddress, userAgent: deviceInfo.userAgent });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
};
