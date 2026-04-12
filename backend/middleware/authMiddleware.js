const { env } = require('../config/environment');
const tokenService = require('../services/tokenService');
const Session = require('../models/Session');
const User = require('../models/User');

/**
 * Middleware to protect routes that require valid JWT Authentication
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Parse JWT
    const decoded = tokenService.verifyToken(token, env.JWT_ACCESS_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    // Check Redis Blacklist
    if (decoded.jti) {
      const blacklisted = await tokenService.isBlacklisted(decoded.jti);
      if (blacklisted) return res.status(401).json({ error: 'Unauthorized: Token revoked' });
    }

    // Ensure session is actually alive in Mongo
    const session = await Session.findOne({ _id: decoded.sessionId, isActive: true });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: associated session is invalid or closed' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: user no longer exists' });
    }

    // Attach payloads to request object
    req.user = user;
    req.session = session;
    req.jti = decoded.jti;

    next();
  } catch (error) {
    console.error('requireAuth Error:', error);
    return res.status(500).json({ error: 'Internal Server Error during Authentication' });
  }
}

module.exports = {
  requireAuth,
};
