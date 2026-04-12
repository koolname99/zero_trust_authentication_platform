const express = require('express');
const Joi = require('joi');
const { registerLimiter, loginLimiter, refreshLimiter } = require('../middleware/rateLimiter');
const { requireAuth } = require('../middleware/authMiddleware');
const authService = require('../services/authService');
const logger = require('../utils/logger');

const router = express.Router();

// Input Checkers
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d).*$/).message('Password must contain at least one letter and number').required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const getDeviceInfo = (req) => ({
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  fingerprint: req.headers['x-device-fingerprint'] || 'unknown',
});

// POST /register
router.post('/register', registerLimiter, async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    await authService.register(value.email, value.password, req.ip, req.headers['user-agent']);
    res.status(201).json({ message: 'User registered successfully. Proceed to login.' });
  } catch (err) {
    if (err.message === 'Email already in use') {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
});

// POST /login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await authService.login(value.email, value.password, getDeviceInfo(req));
    
    // Intercept MFA Challenges
    if (result.mfaRequired) {
      return res.json({ mfaRequired: true, mfaToken: result.mfaToken });
    }

    // Assign secure cookies for refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Must be lax/none to allow browser to use it properly
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      accessToken: result.accessToken,
      user: {
        id: result.user._id,
        email: result.user.email,
        role: result.user.role,
      }
    });

  } catch (err) {
    // Both Invalid Creds and Lockout handled generally
    if (err.message.includes('Invalid') || err.message.includes('locked')) {
      return res.status(401).json({ error: err.message });
    }
    next(err);
  }
});

// POST /refresh
router.post('/refresh', refreshLimiter, async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token not found' });

    const tokens = await authService.refreshTokens(refreshToken, getDeviceInfo(req));

    // Append new refreshToken
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.json({ accessToken: tokens.accessToken });
  } catch (err) {
    // If Refresh is completely invalidated or replayed, scrub tracking cookie
    res.clearCookie('refreshToken');
    return res.status(401).json({ error: err.message });
  }
});

// POST /logout
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await authService.logout(req.session._id, req.jti);
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// Protected dummy endpoint to test requireAuth barrier
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: { id: req.user._id, email: req.user.email, role: req.user.role }
  });
});

module.exports = router;
