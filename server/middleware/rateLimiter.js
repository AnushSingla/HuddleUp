const rateLimit = require('express-rate-limit');

// Strict rate limiter for login attempts (5 attempts per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for login from IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many login attempts from this IP, please try again after 15 minutes',
      retryAfter: '15 minutes'
    });
  }
});

// Strict rate limiter for registration (3 attempts per hour)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    message: 'Too many registration attempts from this IP, please try again after 1 hour',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for registration from IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many registration attempts from this IP, please try again after 1 hour',
      retryAfter: '1 hour'
    });
  }
});

// Rate limiter for password reset/update (3 attempts per hour)
const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    message: 'Too many password change attempts from this IP, please try again after 1 hour',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for password change from IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many password change attempts from this IP, please try again after 1 hour',
      retryAfter: '1 hour'
    });
  }
});

// General API rate limiter (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`API rate limit exceeded from IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many requests from this IP, please try again after 15 minutes',
      retryAfter: '15 minutes'
    });
  }
});

// Moderate rate limiter for video/post uploads (10 per hour)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    message: 'Too many upload attempts from this IP, please try again after 1 hour',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Upload rate limit exceeded from IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many upload attempts from this IP, please try again after 1 hour',
      retryAfter: '1 hour'
    });
  }
});

// Moderate rate limiter for comments (30 per 15 minutes)
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 comments per 15 minutes
  message: {
    message: 'Too many comments from this IP, please slow down',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Comment rate limit exceeded from IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many comments from this IP, please slow down',
      retryAfter: '15 minutes'
    });
  }
});

module.exports = {
  loginLimiter,
  registerLimiter,
  passwordLimiter,
  apiLimiter,
  uploadLimiter,
  commentLimiter
};
