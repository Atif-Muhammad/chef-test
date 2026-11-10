const jwt = require('jsonwebtoken');
const env = require('../config/env');
const Admin = require('../models/admin-models/Admin');
const User = require('../models/user-models/User');

/**
 * Sign access token (7-day validity)
 */
function signAccessToken(entity, role) {
  return jwt.sign(
    { id: entity._id || entity.id, role, email: entity.email },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
  );
}

/**
 * Sign refresh token (30-day validity)
 */
function signRefreshToken(entity, role) {
  return jwt.sign(
    { id: entity._id || entity.id, role, email: entity.email, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
  );
}

/**
 * Extract tokens from cookies or authorization headers
 */
function extractTokens(req) {
  let accessToken = null;
  let refreshToken = null;

  if (req.cookies) {
    accessToken = req.cookies[env.ACCESS_COOKIE_NAME] || req.cookies[env.COOKIE_NAME] || null;
    refreshToken = req.cookies[env.REFRESH_COOKIE_NAME] || null;
  }

  if (!accessToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    accessToken = req.headers.authorization.split(' ')[1];
  }

  if (!refreshToken && req.headers['x-refresh-token']) {
    refreshToken = req.headers['x-refresh-token'];
  } else if (!refreshToken && req.body && req.body.refreshToken) {
    refreshToken = req.body.refreshToken;
  }

  return { accessToken, refreshToken };
}

/**
 * Helper to populate user details from DB
 */
async function resolveAccount(decoded) {
  if (decoded.role === 'admin') {
    const admin = await Admin.findById(decoded.id).select('-passwordHash');
    if (!admin) return null;
    return { id: admin._id, name: admin.name, email: admin.email, role: 'admin' };
  } else {
    const client = await User.findById(decoded.id).select('-passwordHash');
    if (!client) return null;
    return {
      id: client._id,
      name: client.name,
      email: client.email,
      photoUrl: client.photoUrl || '',
      role: 'client',
      status: client.status || 'active',
      allergies: client.allergies || [],
      phone: client.phone || '',
      location: client.location || '',
      dob: client.dob || '',
      gender: client.gender || '',
      dietaryPreferences: client.dietaryPreferences || [],
      dislikedIngredients: client.dislikedIngredients || [],
      adultsCount: client.adultsCount || 2,
      childrenCount: client.childrenCount || 0,
      childrenAges: client.childrenAges || '',
      specialRequests: client.specialRequests || '',
      favouriteDishes: client.favouriteDishes || [],
    };
  }
}

/**
 * Attaches user to req.user if a valid access token (or refreshable token) is present.
 */
async function optionalAuth(req, res, next) {
  try {
    const { accessToken, refreshToken } = extractTokens(req);

    if (!accessToken && !refreshToken) {
      req.user = null;
      return next();
    }

    // 1. Try validating access token
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, env.JWT_ACCESS_SECRET);
        const account = await resolveAccount(decoded);
        if (account) {
          if (account.role === 'client' && (account.status === 'terminated' || account.status !== 'active')) {
            clearAuthCookie(res);
            req.user = null;
            req.userTerminated = true;
            return next();
          }
          req.user = account;
          return next();
        }
      } catch (err) {
        // Access token expired or invalid; fall through to refresh token
      }
    }

    // 2. Fall back to refresh token if access token failed/expired
    if (refreshToken) {
      try {
        const refreshDecoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
        const account = await resolveAccount(refreshDecoded);
        if (account) {
          if (account.role === 'client' && (account.status === 'terminated' || account.status !== 'active')) {
            clearAuthCookie(res);
            req.user = null;
            req.userTerminated = true;
            return next();
          }
          // Re-issue a fresh 7-day access token and set cookie
          const newAccessToken = signAccessToken(account, account.role);
          setAuthCookie(res, newAccessToken);
          req.user = account;
          return next();
        }
      } catch (err) {
        // Refresh token also invalid or expired
      }
    }

    req.user = null;
    return next();
  } catch (err) {
    req.user = null;
    return next();
  }
}

/**
 * Strict authentication requirement.
 */
async function requireAuth(req, res, next) {
  const { accessToken, refreshToken } = extractTokens(req);

  if (!accessToken && !refreshToken) {
    return res.status(401).json({ message: 'Authentication required. No session token provided.' });
  }

  // 1. Try validating access token
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, env.JWT_ACCESS_SECRET);
      const account = await resolveAccount(decoded);
      if (account) {
        if (account.role === 'client' && (account.status === 'terminated' || account.status !== 'active')) {
          clearAuthCookie(res);
          return res.status(403).json({
            message: 'Access denied: Your account has been terminated by administrator.',
            terminated: true,
            status: 'terminated',
          });
        }
        req.user = account;
        return next();
      }
      return res.status(401).json({ message: 'Account not found or deactivated.' });
    } catch (err) {
      // Access token expired or invalid; check refresh token
    }
  }

  // 2. Fall back to refresh token
  if (refreshToken) {
    try {
      const refreshDecoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      const account = await resolveAccount(refreshDecoded);
      if (account) {
        if (account.role === 'client' && (account.status === 'terminated' || account.status !== 'active')) {
          clearAuthCookie(res);
          return res.status(403).json({
            message: 'Access denied: Your account has been terminated by administrator.',
            terminated: true,
            status: 'terminated',
          });
        }
        const newAccessToken = signAccessToken(account, account.role);
        setAuthCookie(res, newAccessToken);
        req.user = account;
        return next();
      }
      return res.status(401).json({ message: 'Account associated with session no longer exists.' });
    } catch (err) {
      return res.status(401).json({ message: 'Session expired (30-day refresh validity ended). Please log in again.' });
    }
  }

  return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
}

/**
 * Requires admin role.
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied: Admin credentials required.' });
  });
}

/**
 * Requires client role and strictly active status.
 */
function requireClient(req, res, next) {
  requireAuth(req, res, async () => {
    if (!req.user || req.user.role !== 'client') {
      return res.status(403).json({ message: 'Access denied: Client credentials required.' });
    }

    if (req.user.status === 'terminated' || req.user.status !== 'active') {
      clearAuthCookie(res);
      return res.status(403).json({
        message: 'Access denied: Your account has been terminated by administrator.',
        terminated: true,
        status: 'terminated',
      });
    }

    // Direct live DB check for instantaneous real-time termination enforcement
    try {
      const liveClient = await User.findById(req.user.id || req.user._id).select('status');
      if (!liveClient || liveClient.status === 'terminated' || liveClient.status !== 'active') {
        clearAuthCookie(res);
        return res.status(403).json({
          message: 'Access denied: Your account has been terminated by administrator.',
          terminated: true,
          status: 'terminated',
        });
      }
      req.user.status = liveClient.status;
      return next();
    } catch (err) {
      return next(err);
    }
  });
}

/**
 * checkClientActive:
 * Middleware specifically checking if the client is active or terminated before processing request.
 */
async function checkClientActive(req, res, next) {
  if (!req.user) {
    return requireAuth(req, res, async () => {
      if (!req.user) return;
      return verifyClientStatus(req, res, next);
    });
  }
  return verifyClientStatus(req, res, next);
}

async function verifyClientStatus(req, res, next) {
  if (req.user && req.user.role === 'client') {
    if (req.user.status === 'terminated' || req.user.status !== 'active') {
      clearAuthCookie(res);
      return res.status(403).json({
        message: 'Access denied: Your account has been terminated by administrator.',
        terminated: true,
        status: 'terminated',
      });
    }

    try {
      const liveClient = await User.findById(req.user.id || req.user._id).select('status');
      if (!liveClient || liveClient.status === 'terminated' || liveClient.status !== 'active') {
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

/**
 * Helper to set standard secure httpOnly cookies on response:
 * - Access Token: 7 days
 * - Refresh Token: 30 days
 */
function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = env.NODE_ENV === 'production';
  const accessMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  const refreshMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

  // Access token cookie (7 days)
  res.cookie(env.ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: accessMaxAge,
    path: '/',
  });

  // Legacy fallback cookie
  res.cookie(env.COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: accessMaxAge,
    path: '/',
  });

  // Refresh token cookie (30 days)
  if (refreshToken) {
    res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: refreshMaxAge,
      path: '/',
    });
  }
}

function setAuthCookie(res, token) {
  const isProd = env.NODE_ENV === 'production';
  res.cookie(env.ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function clearAuthCookie(res) {
  const isProd = env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: '/',
  };
  res.clearCookie(env.ACCESS_COOKIE_NAME, cookieOptions);
  res.clearCookie(env.REFRESH_COOKIE_NAME, cookieOptions);
  res.clearCookie(env.COOKIE_NAME, cookieOptions);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  extractTokens,
  optionalAuth,
  requireAuth,
  requireAdmin,
  requireClient,
  checkClientActive,
  requireActiveClient: checkClientActive,
  setAuthCookie,
  setAuthCookies,
  clearAuthCookie,
};
