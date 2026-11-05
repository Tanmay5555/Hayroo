import { verifyAccessToken } from '../utils/jwt.js';
import { sendError } from '../utils/apiResponse.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Authentication token missing or invalid');
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return sendError(res, 401, 'User account associated with token no longer exists');
    }
    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 401, 'Token verification failed or expired', err.message);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }
    const userRole = (req.user.role || '').toUpperCase();
    const normalizedRoles = roles.map((r) => r.toUpperCase());

    if (!normalizedRoles.includes(userRole)) {
      return sendError(
        res,
        403,
        `Access denied: Requires role [${roles.join(', ')}]. Current role: '${userRole}'`
      );
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  let token = null;
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignored for optional auth
    }
  }
  next();
};
