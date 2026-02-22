const rateLimit = require("express-rate-limit");
const { isRedisReady, getRedisClient } = require("../config/redis");

let RedisStore;
try {
    RedisStore = require("rate-limit-redis").default;
} catch {
    RedisStore = null;
}

const createStore = (prefix) => {
    if (RedisStore && isRedisReady()) {
        return new RedisStore({
            sendCommand: (...args) => getRedisClient().call(...args),
            prefix: `rl:${prefix}:`,
        });
    }
    return undefined;
};

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("api"),
    message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("auth"),
    message: { message: "Too many login attempts, please try again later." },
});

const feedLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("feed"),
    message: { message: "Too many feed requests, please slow down." },
});

module.exports = { apiLimiter, authLimiter, feedLimiter };
