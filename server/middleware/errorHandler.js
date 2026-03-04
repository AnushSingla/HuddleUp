/**
 * Global Error Handler Middleware
 * Catches unhandled errors and provides meaningful responses
 */

const errorHandler = (err, req, res, next) => {
  console.error('🔥 Unhandled Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // JWT-related errors
  if (err.message.includes('secretOrPrivateKey must have a value')) {
    return res.status(500).json({
      message: 'Authentication service is temporarily unavailable. Please try again later.',
      error: 'AUTH_CONFIG_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    return res.status(503).json({
      message: 'Database service is temporarily unavailable. Please try again later.',
      error: 'DATABASE_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors,
      timestamp: new Date().toISOString()
    });
  }

  // Duplicate key errors (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      error: 'DUPLICATE_ENTRY',
      timestamp: new Date().toISOString()
    });
  }

  // Cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
      error: 'INVALID_ID',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  // Don't expose stack traces in production
  const response = {
    message: message,
    error: err.name || 'SERVER_ERROR',
    timestamp: new Date().toISOString()
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.url} not found`,
    error: 'NOT_FOUND',
    timestamp: new Date().toISOString()
  });
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