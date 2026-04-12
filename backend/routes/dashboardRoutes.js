const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Session = require('../models/Session');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Enforce authentication on all dashboard telemetry routes
router.use(requireAuth);

/**
 * GET /api/dashboard/overview
 * Fetches root-level aggregated metrics
 */
router.get('/overview', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSessions = await Session.countDocuments({ isActive: true });
    
    // Anomalies in last 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const anomalies = await AuditLog.countDocuments({
      timestamp: { $gte: yesterday },
      action: { $in: ['LOGIN_FAILURE', 'ACCOUNT_LOCKED', 'SESSION_REVOKED'] }
    });

    // Average Risk Score across all recent logins
    const recentLogins = await AuditLog.find({ action: 'LOGIN_SUCCESS', timestamp: { $gte: yesterday } }).select('riskScore');
    let avgRisk = 0;
    if (recentLogins.length > 0) {
      avgRisk = recentLogins.reduce((acc, log) => acc + (log.riskScore || 0), 0) / recentLogins.length;
    }

    res.json({
      totalUsers,
      activeSessions,
      anomalies,
      avgRiskScore: Math.round(avgRisk)
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dashboard/audit-logs
 * Fetches a descending stream of the last 50 tracked events
 */
router.get('/audit-logs', async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'email role')
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dashboard/sessions
 * Fetches all active sessions mapped to emails
 */
router.get('/sessions', async (req, res, next) => {
  try {
    const sessions = await Session.find({ isActive: true })
      .populate('userId', 'email')
      .sort({ createdAt: -1 });
    
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/dashboard/sessions/:id
 * Gracefully terminates an active session mathematically
 */
router.delete('/sessions/:id', async (req, res, next) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Assuming admin or self: ensure they own the session or are an admin
    if (req.user.role !== 'ADMIN' && session.userId.toString() !== req.user._id.toString()) {
       return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ message: 'Session revoked successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
