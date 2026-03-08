const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getJWTSecret } = require("../utils/validateEnv");
const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");
const authService = require("../services/authService");

const verifyToken = async (req, res, next) => {
  // Allow preflight CORS requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  try {
    let token = null;
    let isFromCookie = false;

    // Prefer secure HTTP-only cookies for auth
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
      isFromCookie = true;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      // Fallback to Authorization header for backward compatibility
      token = req.headers.authorization.split(" ")[1];
      isFromCookie = false;
    }

    if (!token) {
      logger.warn('Authentication failed - no token provided', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        hasCookies: !!req.cookies,
        hasAuthHeader: !!req.headers.authorization
      });
      return ResponseHandler.unauthorized(res, 'Authentication required');
    }

    try {
      // Verify access token
      const decoded = authService.verifyAccessToken(token);
      req.user = decoded;
      req.authMethod = isFromCookie ? 'cookie' : 'header';
      
      logger.debug('Token verified successfully', {
        userId: decoded.id,
        method: req.method,
        url: req.url,
        authMethod: req.authMethod
      });
      
      return next();
    } catch (error) {
      // If access token is expired and we have cookies, try to refresh
      if (error.message === 'ACCESS_TOKEN_EXPIRED' && isFromCookie && req.cookies?.refreshToken) {
        try {
          logger.info('Access token expired, attempting refresh', {
            userId: req.user?.id,
            method: req.method,
            url: req.url
          });

          const deviceInfo = authService.extractDeviceInfo(req);
          const refreshResult = await authService.refreshTokenPair(req.cookies.refreshToken, deviceInfo);
          
          // Set new cookies
          authService.setAuthCookies(res, refreshResult.accessToken, refreshResult.refreshToken);
          
          // Verify the new access token and continue
          const decoded = authService.verifyAccessToken(refreshResult.accessToken);
          req.user = decoded;
          req.authMethod = 'cookie';
          req.tokenRefreshed = true;
          
          logger.info('Token refreshed successfully', {
            userId: decoded.id,
            method: req.method,
            url: req.url
          });
          
          return next();
        } catch (refreshError) {
          logger.warn('Token refresh failed', {
            error: refreshError.message,
            method: req.method,
            url: req.url
          });
          
          // Clear invalid cookies
          authService.clearAuthCookies(res);
          
          return ResponseHandler.error(
            res,
            ERROR_CODES.TOKEN_EXPIRED,
            'Session expired. Please log in again.',
            401
          );
        }
      }

      // Handle other token errors
      logger.warn('JWT verification failed', {
        error: error.message,
        method: req.method,
        url: req.url,
        ip: req.ip,
        authMethod: req.authMethod
      });
      
      if (isFromCookie) {
        authService.clearAuthCookies(res);
      }
      
      if (error.message.includes('JWT_SECRET')) {
        return ResponseHandler.error(
          res,
          ERROR_CODES.SERVICE_UNAVAILABLE,
          'Authentication service temporarily unavailable. Please try again later.',
          503
        );
      }
      
      if (error.message === 'INVALID_ACCESS_TOKEN') {
        return ResponseHandler.error(
          res,
          ERROR_CODES.INVALID_TOKEN,
          'Invalid authentication token',
          401
        );
      }
      
      if (error.message === 'ACCESS_TOKEN_EXPIRED') {
        return ResponseHandler.error(
          res,
          ERROR_CODES.TOKEN_EXPIRED,
          'Authentication token has expired',
          401
        );
      }
      
      return ResponseHandler.error(
        res,
        ERROR_CODES.INTERNAL_ERROR,
        'Authentication failed. Please try again.',
        500
      );
    }
  } catch (error) {
    logger.error('Authentication middleware error', {
      error: error.message,
      method: req.method,
      url: req.url,
      ip: req.ip,
      authMethod: req.authMethod
    });
    
    return ResponseHandler.error(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      'Authentication service error',
      500
    );
  }
};

module.exports = { verifyToken, protect: verifyToken };

// ================================
// CENTRALIZED RBAC MIDDLEWARE
// ================================

/**
 * Role hierarchy for permission checking
 * Higher index = more permissions
 */
const ROLE_HIERARCHY = {
  user: 0,
  moderator: 1,
  admin: 2
};

/**
 * Simple in-memory cache for user roles (5 minute TTL)
 * Reduces database queries for role checking
 */
const roleCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedUserRole = (userId) => {
  const cached = roleCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedUserRole = (userId, data) => {
  roleCache.set(userId, {
    data,
    timestamp: Date.now()
  });
  
  // Cleanup old cache entries periodically
  if (roleCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of roleCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        roleCache.delete(key);
      }
    }
  }
};

const clearUserRoleCache = (userId) => {
  roleCache.delete(userId);
};

/**
 * Centralized role-based access control middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        logger.warn('Authorization failed - no user ID in request', {
          method: req.method,
          url: req.url
        });
        return ResponseHandler.unauthorized(res, 'Authentication required');
      }

      // Check cache first
      let userData = getCachedUserRole(userId);
      
      if (!userData) {
        // Fetch user with role information from database
        const user = await User.findById(userId)
          .select('role isAdmin isBanned')
          .lean();
        
        if (!user) {
          logger.warn('Authorization failed - user not found', { 
            userId,
            method: req.method,
            url: req.url
          });
          return ResponseHandler.unauthorized(res, 'User not found');
        }
        
        userData = user;
        setCachedUserRole(userId, userData);
      }
      
      // Check if user is banned
      if (userData.isBanned) {
        logger.warn('Authorization failed - user is banned', { 
          userId,
          method: req.method,
          url: req.url
        });
        return ResponseHandler.forbidden(res, 'Your account has been banned');
      }
      
      // Determine user's role (support legacy isAdmin field)
      const userRole = userData.role || (userData.isAdmin ? 'admin' : 'user');
      
      // Check if user has required role
      const hasPermission = allowedRoles.includes(userRole);
      
      if (!hasPermission) {
        logger.warn('Authorization failed - insufficient permissions', {
          userId,
          userRole,
          requiredRoles: allowedRoles,
          method: req.method,
          url: req.url,
          ip: req.ip
        });
        return ResponseHandler.forbidden(res, 'Insufficient permissions to access this resource');
      }
      
      // Attach user info to request for use in controllers
      req.userRole = userRole;
      req.userInfo = userData;
      
      logger.debug('Authorization successful', {
        userId,
        userRole,
        method: req.method,
        url: req.url
      });
      
      next();
    } catch (error) {
      logger.error('Authorization check error', { 
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        method: req.method,
        url: req.url
      });
      return ResponseHandler.error(
        res,
        ERROR_CODES.INTERNAL_ERROR,
        'Authorization check failed',
        500
      );
    }
  };
};

/**
 * Check if user has at least the specified role level
 * Uses role hierarchy (admin > moderator > user)
 */
const checkRoleLevel = (minimumRole) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return ResponseHandler.unauthorized(res, 'Authentication required');
      }

      // Check cache first
      let userData = getCachedUserRole(userId);
      
      if (!userData) {
        const user = await User.findById(userId)
          .select('role isAdmin isBanned')
          .lean();
        
        if (!user) {
          return ResponseHandler.unauthorized(res, 'User not found');
        }
        
        userData = user;
        setCachedUserRole(userId, userData);
      }
      
      if (userData.isBanned) {
        return ResponseHandler.forbidden(res, 'Your account has been banned');
      }
      
      const userRole = userData.role || (userData.isAdmin ? 'admin' : 'user');
      const userLevel = ROLE_HIERARCHY[userRole] || 0;
      const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;
      
      if (userLevel < requiredLevel) {
        logger.warn('Authorization failed - insufficient role level', {
          userId,
          userRole,
          userLevel,
          requiredRole: minimumRole,
          requiredLevel,
          method: req.method,
          url: req.url
        });
        return ResponseHandler.forbidden(res, 'Insufficient permissions');
      }
      
      req.userRole = userRole;
      req.userInfo = userData;
      
      next();
    } catch (error) {
      logger.error('Role level check error', { 
        error: error.message,
        userId: req.user?.id
      });
      return ResponseHandler.error(
        res,
        ERROR_CODES.INTERNAL_ERROR,
        'Authorization check failed',
        500
      );
    }
  };
};

// Convenience middleware exports
const requireAdmin = checkRole('admin');
const requireModerator = checkRole('admin', 'moderator');
const requireUser = checkRole('admin', 'moderator', 'user');

// Export all middleware
module.exports = { 
  verifyToken, 
  protect: verifyToken,
  checkRole,
  checkRoleLevel,
  requireAdmin,
  requireModerator,
  requireUser,
  clearUserRoleCache // Export for use when user roles change
};
