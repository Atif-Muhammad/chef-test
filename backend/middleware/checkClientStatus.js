const User = require('../models/user-models/User');
const { clearAuthCookie, requireAuth } = require('./auth.middleware');

/**
 * Middleware: checkClientActive / requireActiveClient
 * Checks whether the client is active or terminated before processing any client API request.
 * If the client's status is 'terminated' (or not 'active'):
 *  1. Clears all session cookies (access & refresh)
 *  2. Immediately returns HTTP 403 Forbidden with { message, terminated: true, status: 'terminated' }
 *  3. Halts the request pipeline so no downstream controller executes
 */
const checkClientActive = async (req, res, next) => {
  // If req.user is not yet populated, run requireAuth first to authenticate
  if (!req.user) {
    return requireAuth(req, res, async () => {
      if (!req.user) return; // Response already handled by requireAuth
      return verifyClientStatus(req, res, next);
    });
  }

  return verifyClientStatus(req, res, next);
};

/**
 * Validates the client role and ensures their status is strictly 'active' in DB
 */
async function verifyClientStatus(req, res, next) {
  if (req.user && req.user.role === 'client') {
    // 1. Check status on resolved user object
    if (req.user.status === 'terminated' || req.user.status !== 'active') {
      clearAuthCookie(res);
      return res.status(403).json({
        message: 'Access denied: Your account has been terminated by administrator.',
        terminated: true,
        status: 'terminated',
      });
    }

    // 2. Perform live, real-time database lookup to prevent race conditions or stale session data
    try {
      const liveClient = await User.findById(req.user.id || req.user._id).select('status');
      if (!liveClient) {
        clearAuthCookie(res);
        return res.status(401).json({ message: 'Account no longer exists.' });
      }

      if (liveClient.status === 'terminated' || liveClient.status !== 'active') {
        clearAuthCookie(res);
        return res.status(403).json({
          message: 'Access denied: Your account has been terminated by administrator.',
          terminated: true,
          status: 'terminated',
        });
      }

      req.user.status = liveClient.status;
    } catch (err) {
      return next(err);
    }
  }

  return next();
}

module.exports = {
  checkClientActive,
  requireActiveClient: checkClientActive,
};
