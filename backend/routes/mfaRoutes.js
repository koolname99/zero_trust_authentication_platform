const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const mfaService = require('../services/mfaService');
const tokenService = require('../services/tokenService');
const geoService = require('../services/geoService');
const AuditLog = require('../models/AuditLog');
const RiskProfile = require('../models/RiskProfile');
const User = require('../models/User');
const { AUDIT_ACTIONS } = require('../utils/constants');
const { env } = require('../config/environment');

// MFA-verified logins prove the device is trusted, so promote IP/fingerprint/geo
// into the profile's known lists — otherwise every future login re-triggers the
// same risk factors and the user is stuck in a permanent MFA loop.
async function promoteKnownContext(userId, deviceInfo) {
  const profile = await RiskProfile.findOne({ userId });
  if (!profile) return;

  const location = geoService.getLocation(deviceInfo.ipAddress);
  const geoString = `${location.country}-${location.city}`;
  let changed = false;

  if (!profile.knownIPs.includes(deviceInfo.ipAddress)) {
    profile.knownIPs.push(deviceInfo.ipAddress);
    changed = true;
  }
  if (deviceInfo.fingerprint && deviceInfo.fingerprint !== 'unknown' && !profile.knownDevices.includes(deviceInfo.fingerprint)) {
    profile.knownDevices.push(deviceInfo.fingerprint);
    changed = true;
  }
  if (location.country !== 'UNKNOWN' && !profile.knownGeoLocations.includes(geoString)) {
    profile.knownGeoLocations.push(geoString);
    changed = true;
  }

  if (changed) await profile.save();
}

const router = express.Router();

/**
 * Middleware explicitly for decoding the highly-restrictive intermediate MFA string drop
 */
async function requireMfaToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
    const token = authHeader.split(' ')[1];
    const decoded = tokenService.verifyToken(token, env.JWT_ACCESS_SECRET);
    
    if (!decoded || decoded.type !== 'mfa_pending') {
      return res.status(401).json({ error: 'Invalid or expired MFA session' });
    }
    
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    req.user = user;
    req.mfaDecoded = decoded;
    next();
  } catch (err) {
    res.status(500).json({ error: 'MFA parsing error' });
  }
}

const getDeviceInfo = (req) => ({
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  fingerprint: req.headers['x-device-fingerprint'] || 'unknown',
});

// GET /api/mfa/setup (Authenticated)
router.get('/setup', requireAuth, async (req, res, next) => {
  try {
    const payload = await mfaService.generateSetupPayload(req.user);
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

// POST /api/mfa/enable (Authenticated)
router.post('/enable', requireAuth, async (req, res, next) => {
  try {
    const { token } = req.body;
    const isValid = await mfaService.verifyAndCommitSetup(req.user, token);

    if (!isValid) return res.status(400).json({ error: 'Invalid or expired code. Try again.' });

    res.json({ message: 'MFA successfully enabled on account' });
  } catch (err) {
    next(err);
  }
});

// POST /api/mfa/verify (MFA Session)
router.post('/verify', requireMfaToken, async (req, res, next) => {
  try {
    const { token } = req.body;
    const isValid = await mfaService.verifyTOTP(req.user, token);
    
    if (!isValid) return res.status(401).json({ error: 'Invalid or expired MFA code' });

    // Success - grant real tokens
    const deviceInfo = getDeviceInfo(req);
    const { refreshToken, session } = await tokenService.generateRefreshToken(req.user, null, deviceInfo);
    const accessToken = tokenService.generateAccessToken(req.user, session._id);

    await promoteKnownContext(req.user._id, deviceInfo);

    await AuditLog.create({
      userId: req.user._id,
      action: AUDIT_ACTIONS.LOGIN_SUCCESS,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      riskScore: req.mfaDecoded.riskScore,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken, user: { id: req.user._id, email: req.user.email, role: req.user.role } });
  } catch (err) {
    next(err);
  }
});

// POST /api/mfa/recovery (MFA Session)
router.post('/recovery', requireMfaToken, async (req, res, next) => {
  try {
    const { code } = req.body;
    const isValid = await mfaService.verifyRecoveryCode(req.user, code);
    
    if (!isValid) return res.status(401).json({ error: 'Invalid recovery code' });

    // Success - grant real tokens
    const deviceInfo = getDeviceInfo(req);
    const { refreshToken, session } = await tokenService.generateRefreshToken(req.user, null, deviceInfo);
    const accessToken = tokenService.generateAccessToken(req.user, session._id);

    await promoteKnownContext(req.user._id, deviceInfo);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken, user: { id: req.user._id, email: req.user.email, role: req.user.role } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
