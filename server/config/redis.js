const Redis = require("ioredis");

let redisClient = null;

const initRedis = () => {
    const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

    try {
        redisClient = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                if (times > 5) return null;
                return Math.min(times * 200, 2000);
            },
            lazyConnect: true,
        });

        redisClient.on("connect", () => {
            console.log("✅ Redis connected");
        });

        redisClient.on("error", (err) => {
            console.error("Redis error:", err.message);
        });

        redisClient.on("close", () => {
            console.log("Redis connection closed");
        });

        redisClient.connect().catch((err) => {
            console.warn("⚠️ Redis unavailable — running without cache:", err.message);
            redisClient = null;
        });
    } catch (err) {
        console.warn("⚠️ Redis init failed — running without cache:", err.message);
        redisClient = null;
    }
};

const getRedisClient = () => redisClient;

const isRedisReady = () => {
    return redisClient !== null && redisClient.status === "ready";
};

const shutdownRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
};

module.exports = { initRedis, getRedisClient, isRedisReady, shutdownRedis };
