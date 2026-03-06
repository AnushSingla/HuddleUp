jest.mock("../config/redis", () => {
    const store = {};
    return {
        getRedisClient: () => ({
            get: jest.fn(async (key) => store[key] || null),
            setex: jest.fn(async (key, ttl, value) => { store[key] = value; }),
            del: jest.fn(async (...keys) => { keys.forEach((k) => delete store[k]); }),
            scan: jest.fn(async () => ["0", Object.keys(store)]),
        }),
        isRedisReady: () => true,
    };
});

const { getCache, setCache, deleteCache, deleteCachePattern } = require("../utils/cache");

describe("cache utility", () => {
    test("setCache and getCache round-trip", async () => {
        await setCache("test:key", { hello: "world" }, 30);
        const result = await getCache("test:key");
        expect(result).toEqual({ hello: "world" });
    });

    test("getCache returns null for missing key", async () => {
        const result = await getCache("nonexistent");
        expect(result).toBeNull();
    });

    test("deleteCache removes key", async () => {
        await setCache("test:del", { a: 1 }, 30);
        await deleteCache("test:del");
        const result = await getCache("test:del");
        expect(result).toBeNull();
    });

    test("deleteCachePattern clears matching keys", async () => {
        await setCache("feed:a", { data: 1 }, 30);
        await setCache("feed:b", { data: 2 }, 30);
        await deleteCachePattern("feed:*");
        const a = await getCache("feed:a");
        const b = await getCache("feed:b");
        expect(a).toBeNull();
        expect(b).toBeNull();
    });
});

describe("cache utility with Redis unavailable", () => {
    beforeAll(() => {
        const redisModule = require("../config/redis");
        redisModule.isRedisReady = () => false;
    });

    test("getCache returns null gracefully", async () => {
        const result = await getCache("any:key");
        expect(result).toBeNull();
    });

    test("setCache does not throw", async () => {
        await expect(setCache("any:key", { data: 1 })).resolves.toBeUndefined();
    });
});
