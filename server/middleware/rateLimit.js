const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const { isRedisReady, getRedisClient } = require("../config/redis");

const isDev = process.env.NODE_ENV !== "production";

let RedisStore;
try {
    RedisStore = require("rate-limit-redis").default;
} catch {
    RedisStore = null;
}

/**
 * Creates a Redis store for rate limiting
 * Falls back to memory store if Redis is not available
 */
const createStore = (prefix) => {
    if (RedisStore && isRedisReady()) {
        return new RedisStore({
            sendCommand: (...args) => getRedisClient().call(...args),
            prefix: `rl:${prefix}:`,
        });
    }
    return undefined;
};

/**
 * Extract user ID from request for user-based rate limiting
 */
const getUserId = (req) => {
    if (req.user?.id) {
        return `user_${req.user.id}`;
    }
    return null;
};

/**
 * General API limiter - 100 requests per 15 minutes
 * Applied to most API routes
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("api"),
    keyGenerator: (req) => {
        return getUserId(req) || ipKeyGenerator(req.ip);
    },
    message: { status: 429, message: "Too many requests, please try again later." },
    skip: () => isDev,
    handler: (req, res) => {
        res.status(429).json({
            status: 429,
            message: "Rate limit exceeded. Please try again later.",
            retryAfter: req.rateLimit.resetTime
        });
    }
});

/**
 * Strict auth limiter - 15 requests per 15 minutes
 * Applied to login, registration, and password reset endpoints
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("auth"),
    message: { status: 429, message: "Too many authentication attempts, please try again later." },
    skip: () => isDev,
    handler: (req, res) => {
        res.status(429).json({
            status: 429,
            message: "Too many authentication attempts. Please try again after 15 minutes.",
            retryAfter: req.rateLimit.resetTime
        });
    }
});

/**
 * Feed limiter - 60 requests per minute
 * Applied to feed endpoints
 */
const feedLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("feed"),
    keyGenerator: (req) => {
        return getUserId(req) || ipKeyGenerator(req.ip);
    },
    message: { status: 429, message: "Too many feed requests, please slow down." },
    skip: () => isDev,
    handler: (req, res) => {
        res.status(429).json({
            status: 429,
            message: "Rate limit exceeded on feed. Please slow down.",
            retryAfter: req.rateLimit.resetTime
        });
    }
});

/**
 * Video upload limiter - 5 uploads per 24 hours
 * Applied to video upload endpoints
 */
const videoUploadLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("video_upload"),
    keyGenerator: (req) => {
        return getUserId(req) || ipKeyGenerator(req.ip);
    },
    message: { status: 429, message: "Too many video uploads, please try again later." },
    skip: () => isDev,
    handler: (req, res) => {
        res.status(429).json({
            status: 429,
            message: "Daily video upload limit exceeded. Please try again tomorrow.",
            retryAfter: req.rateLimit.resetTime
        });
    }
});

/**
 * Search limiter - 30 requests per minute
 * Applied to search endpoints
 */
const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("search"),
    keyGenerator: (req) => {
        return getUserId(req) || ipKeyGenerator(req.ip);
    },
    message: { status: 429, message: "Too many search requests." },
    skip: () => isDev,
    handler: (req, res) => {
        res.status(429).json({
            status: 429,
            message: "Too many search requests. Please wait before searching again.",
            retryAfter: req.rateLimit.resetTime
        });
    }
});

/**
 * Comment limiter - 30 comments per 15 minutes
 * Prevents spam in comments
 */
const commentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("comment"),
    keyGenerator: (req) => {
        return getUserId(req) || ipKeyGenerator(req.ip);
    },
    message: { status: 429, message: "Too many comments, please slow down." },
    skip: () => isDev,
    handler: (req, res) => {
        res.status(429).json({
            status: 429,
            message: "Comment rate limit exceeded. Please slow down.",
            retryAfter: req.rateLimit.resetTime
        });
    }
});

/**
 * Post creation limiter - 10 posts per 24 hours
 * Prevents spam posts
 */
const postCreationLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("post_creation"),
    keyGenerator: (req) => {
        return getUserId(req) || ipKeyGenerator(req.ip);
    },
    message: { status: 429, message: "Too many posts created, please try again later." },
    skip: () => isDev,
    handler: (req, res) => {
        res.status(429).json({
            status: 429,
            message: "Daily post creation limit exceeded.",
            retryAfter: req.rateLimit.resetTime
        });
    }
});

/**
 * Password reset limiter - 3 requests per hour
 * Prevents brute force password reset attempts
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("password_reset"),
    message: { status: 429, message: "Too many password reset attempts." },
    skip: () => isDev,
    handler: (req, res) => {
        res.status(429).json({
            status: 429,
            message: "Too many password reset attempts. Please try again in 1 hour.",
            retryAfter: req.rateLimit.resetTime
        });
    }
});

/**
 * Admin operations limiter - 50 requests per hour
 * Applied to admin endpoints
 */
const adminLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("admin"),
    keyGenerator: (req) => {
        return getUserId(req) || ipKeyGenerator(req.ip);
    },
    message: { status: 429, message: "Too many admin operations." },
    skip: () => isDev,
    handler: (req, res) => {
        res.status(429).json({
            status: 429,
            message: "Admin operation rate limit exceeded.",
            retryAfter: req.rateLimit.resetTime
        });
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    feedLimiter,
    videoUploadLimiter,
    searchLimiter,
    commentLimiter,
    postCreationLimiter,
    passwordResetLimiter,
    adminLimiter
};
