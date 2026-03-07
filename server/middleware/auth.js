const jwt = require("jsonwebtoken");
const { getJWTSecret } = require("../utils/validateEnv");
const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");

const verifyToken = (req, res, next) => {
  // Allow preflight CORS requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  // Try to get token from Authorization header first, then from cookies
  let token = null;
  
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    // Check for HTTP-only cookie
    token = req.cookies.accessToken;
  }

  if (!token) {
    logger.warn('Authentication failed - no token found in header or cookies', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      hasAuthHeader: !!authHeader,
      hasCookies: !!req.cookies,
      cookieKeys: req.cookies ? Object.keys(req.cookies) : []
    });
    return ResponseHandler.unauthorized(res);
  }

  try {
    // Use safe JWT secret with proper error handling
    const jwtSecret = getJWTSecret();
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // Save user data
    
    logger.debug('Token verified successfully', {
      userId: decoded.id,
      method: req.method,
      url: req.url,
      tokenSource: authHeader ? 'header' : 'cookie'
    });
    
    next();
  } catch (error) {
    logger.warn('JWT verification failed', {
      error: error.message,
      method: req.method,
      url: req.url,
      ip: req.ip,
      tokenSource: authHeader ? 'header' : 'cookie'
    });
    
    if (error.message.includes('JWT_SECRET')) {
      // Configuration error - don't expose to client
      return ResponseHandler.error(
        res,
        ERROR_CODES.SERVICE_UNAVAILABLE,
        'Authentication service temporarily unavailable. Please try again later.',
        503
      );
    }
    
    // Token-related errors (expired, invalid, etc.)
    if (error.name === 'JsonWebTokenError') {
      return ResponseHandler.error(
        res,
        ERROR_CODES.INVALID_TOKEN,
        'Invalid authentication token',
        401
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return ResponseHandler.error(
        res,
        ERROR_CODES.TOKEN_EXPIRED,
        'Authentication token has expired',
        401
      );
    }
    
    // Other unexpected errors
    return ResponseHandler.error(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      'Authentication failed. Please try again.',
      500
    );
  }
};

module.exports = { verifyToken, protect: verifyToken };
