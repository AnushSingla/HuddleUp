/**
 * Standardized Response Handler
 * Provides consistent API response formats and error handling
 */

const logger = require('./logger');

// Standard error codes
const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Business Logic
  OPERATION_FAILED: 'OPERATION_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RATE_LIMITED: 'RATE_LIMITED'
};

// User-friendly error messages
const ERROR_MESSAGES = {
  [ERROR_CODES.UNAUTHORIZED]: 'Authentication required to access this resource',
  [ERROR_CODES.FORBIDDEN]: 'You do not have permission to perform this action',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Your session has expired. Please log in again',
  [ERROR_CODES.INVALID_TOKEN]: 'Invalid authentication token',
  [ERROR_CODES.VALIDATION_ERROR]: 'The provided data is invalid',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input provided',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Required fields are missing',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found',
  [ERROR_CODES.ALREADY_EXISTS]: 'Resource already exists',
  [ERROR_CODES.CONFLICT]: 'Request conflicts with current state',
  [ERROR_CODES.INTERNAL_ERROR]: 'An internal server error occurred',
  [ERROR_CODES.DATABASE_ERROR]: 'Database service is temporarily unavailable',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable',
  [ERROR_CODES.OPERATION_FAILED]: 'Operation could not be completed',
  [ERROR_CODES.PERMISSION_DENIED]: 'Permission denied for this operation',
  [ERROR_CODES.RATE_LIMITED]: 'Too many requests. Please try again later'
};

class ResponseHandler {
  /**
   * Send success response
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };
    
    if (data !== null) {
      response.data = data;
    }
    
    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(res, errorCode, message = null, statusCode = 500, details = null) {
    const response = {
      success: false,
      error: {
        code: errorCode,
        message: message || ERROR_MESSAGES[errorCode] || 'An error occurred'
      },
      timestamp: new Date().toISOString()
    };
    
    // Add validation details if provided
    if (details && Array.isArray(details)) {
      response.error.details = details;
    }
    
    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'development' && details && !Array.isArray(details)) {
      response.error.debug = details;
    }
    
    return res.status(statusCode).json(response);
  }

  /**
   * Handle async controller errors
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Handle common error types
   */
  static handleError(error, req, res, context = 'Operation') {
    logger.logError(error, req, `${context} failed`, { context });
    
    // MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return this.error(
        res, 
        ERROR_CODES.ALREADY_EXISTS, 
        `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        409
      );
    }
    
    // MongoDB validation error
    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return this.error(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'Validation failed',
        400,
        details
      );
    }
    
    // MongoDB cast error (invalid ObjectId)
    if (error.name === 'CastError') {
      return this.error(
        res,
        ERROR_CODES.INVALID_INPUT,
        'Invalid ID format',
        400
      );
    }
    
    // JWT errors
    if (error.name === 'JsonWebTokenError') {
      return this.error(
        res,
        ERROR_CODES.INVALID_TOKEN,
        'Invalid authentication token',
        401
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return this.error(
        res,
        ERROR_CODES.TOKEN_EXPIRED,
        'Authentication token has expired',
        401
      );
    }
    
    // Default internal server error
    return this.error(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      'An unexpected error occurred',
      500
    );
  }

  /**
   * Validation error helper
   */
  static validationError(res, errors) {
    const details = Array.isArray(errors) ? errors : [errors];
    return this.error(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      'Validation failed',
      400,
      details
    );
  }

  /**
   * Not found error helper
   */
  static notFound(res, resource = 'Resource') {
    return this.error(
      res,
      ERROR_CODES.NOT_FOUND,
      `${resource} not found`,
      404
    );
  }

  /**
   * Unauthorized error helper
   */
  static unauthorized(res, message = null) {
    return this.error(
      res,
      ERROR_CODES.UNAUTHORIZED,
      message,
      401
    );
  }

  /**
   * Forbidden error helper
   */
  static forbidden(res, message = null) {
    return this.error(
      res,
      ERROR_CODES.FORBIDDEN,
      message,
      403
    );
  }

  /**
   * Conflict error helper
   */
  static conflict(res, message = null) {
    return this.error(
      res,
      ERROR_CODES.CONFLICT,
      message,
      409
    );
  }
}

module.exports = {
  ResponseHandler,
  ERROR_CODES,
  ERROR_MESSAGES
};