/**
 * Global Error Handler Middleware
 * Catches unhandled errors and provides meaningful responses using centralized logging and response handling
 */

const logger = require('../utils/logger');
const { ResponseHandler, ERROR_CODES } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  // Log the error with full context
  logger.logError(err, req, 'Unhandled error in global error handler');

  // Handle specific JWT configuration errors
  if (err.message.includes('secretOrPrivateKey must have a value')) {
    return ResponseHandler.error(
      res,
      ERROR_CODES.SERVICE_UNAVAILABLE,
      'Authentication service is temporarily unavailable. Please try again later.',
      503
    );
  }

  // Handle MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    return ResponseHandler.error(
      res,
      ERROR_CODES.DATABASE_ERROR,
      'Database service is temporarily unavailable. Please try again later.',
      503
    );
  }

  // Use the centralized error handler for all other errors
  return ResponseHandler.handleError(err, req, res, 'Global error handler');
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
  logger.info('Route not found', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  return ResponseHandler.notFound(res, `Route ${req.method} ${req.url}`);
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};