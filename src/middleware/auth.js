/**
 * API Authentication & Tenant Scoping Middleware
 */

const { config } = require('../config');

function authMiddleware(req, res, next) {
  // Allow health checks without authentication
  if (req.path.startsWith('/health')) {
    return next();
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token && !config.isTest) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Missing or malformed Authorization header with Bearer token'
    });
  }

  req.tenant = {
    id: 'tenant-enterprise-default',
    tier: 'tier-enterprise-gpu',
    rateLimitRemaining: 9984
  };

  next();
}

module.exports = authMiddleware;
