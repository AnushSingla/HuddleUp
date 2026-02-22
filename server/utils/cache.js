const { getRedisClient, isRedisReady } = require("../config/redis");

const DEFAULT_TTL = 60;

const getCache = async (key) => {
    if (!isRedisReady()) return null;
    try {
        const data = await getRedisClient().get(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

const setCache = async (key, data, ttl = DEFAULT_TTL) => {
    if (!isRedisReady()) return;
    try {
        await getRedisClient().setex(key, ttl, JSON.stringify(data));
    } catch {
        /* Redis write failure is non-critical */
    }
};

const deleteCache = async (key) => {
    if (!isRedisReady()) return;
    try {
        await getRedisClient().del(key);
    } catch {
        /* non-critical */
    }
};

const deleteCachePattern = async (pattern) => {
    if (!isRedisReady()) return;
    try {
        const client = getRedisClient();
        let cursor = "0";
        do {
            const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
            cursor = nextCursor;
            if (keys.length > 0) {
                await client.del(...keys);
            }
        } while (cursor !== "0");
    } catch {
        /* non-critical */
    }
};

module.exports = { getCache, setCache, deleteCache, deleteCachePattern };
