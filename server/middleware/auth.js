const jwt = require("jsonwebtoken");
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

    // First, try to get token from cookies (new secure method)
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
      isFromCookie = true;
    } 
    // Fallback to Authorization header (for backward compatibility during migration)
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
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
      if (error.message === 'ACCESS_TOKEN_EXPIRED' && isFromCookie && req.cookies.refreshToken) {
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
      ip: req.ip
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
