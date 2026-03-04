/**
 * Centralized Logging Utility
 * Provides structured logging with proper severity levels and security
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const LOG_LEVEL_NAMES = ['ERROR', 'WARN', 'INFO', 'DEBUG'];

class Logger {
  constructor() {
    this.logLevel = this.getLogLevel();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  getLogLevel() {
    const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG');
    return LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = this.sanitizeMetadata(meta);
    
    return JSON.stringify({
      timestamp,
      level: LOG_LEVEL_NAMES[level],
      message,
      ...sanitizedMeta,
      pid: process.pid,
      hostname: require('os').hostname()
    });
  }

  sanitizeMetadata(meta) {
    if (!meta || typeof meta !== 'object') return {};
    
    const sanitized = { ...meta };
    
    // Remove sensitive fields
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'auth', 'authorization',
      'cookie', 'session', 'jwt', 'refresh_token', 'access_token',
      'api_key', 'private_key', 'client_secret', 'hash'
    ];
    
    const sanitizeObject = (obj, depth = 0) => {
      if (depth > 3) return '[Object: too deep]'; // Prevent infinite recursion
      
      if (Array.isArray(obj)) {
        return obj.map(item => 
          typeof item === 'object' && item !== null 
            ? sanitizeObject(item, depth + 1) 
            : item
        );
      }
      
      if (obj && typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          const lowerKey = key.toLowerCase();
          
          if (sensitiveFields.some(field => lowerKey.includes(field))) {
            result[key] = '[REDACTED]';
          } else if (typeof value === 'object' && value !== null) {
            result[key] = sanitizeObject(value, depth + 1);
          } else {
            result[key] = value;
          }
        }
        return result;
      }
      
      return obj;
    };
    
    return sanitizeObject(sanitized);
  }

  writeLog(level, message, meta = {}) {
    if (level > this.logLevel) return;
    
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output (always in development, errors only in production)
    if (!this.isProduction || level === LOG_LEVELS.ERROR) {
      const colors = {
        [LOG_LEVELS.ERROR]: '\x1b[31m', // Red
        [LOG_LEVELS.WARN]: '\x1b[33m',  // Yellow
        [LOG_LEVELS.INFO]: '\x1b[36m',  // Cyan
        [LOG_LEVELS.DEBUG]: '\x1b[37m'  // White
      };
      
      const resetColor = '\x1b[0m';
      const color = colors[level] || '';
      
      console.log(`${color}${formattedMessage}${resetColor}`);
    }
    
    // File output (in production or when LOG_TO_FILE is enabled)
    if (this.isProduction || process.env.LOG_TO_FILE === 'true') {
      const logFile = level === LOG_LEVELS.ERROR ? 'error.log' : 'app.log';
      const logPath = path.join(logsDir, logFile);
      
      fs.appendFileSync(logPath, formattedMessage + '\n', { encoding: 'utf8' });
    }
  }

  error(message, meta = {}) {
    this.writeLog(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.writeLog(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.writeLog(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    this.writeLog(LOG_LEVELS.DEBUG, message, meta);
  }

  // Request logging helper
  logRequest(req, message, level = LOG_LEVELS.INFO, meta = {}) {
    const requestMeta = {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id,
      ...meta
    };
    
    this.writeLog(level, message, requestMeta);
  }

  // Error logging helper with stack trace
  logError(error, req = null, message = 'Unhandled error occurred', meta = {}) {
    const errorMeta = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      ...meta
    };
    
    if (req) {
      errorMeta.request = {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id
      };
    }
    
    this.error(message, errorMeta);
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;