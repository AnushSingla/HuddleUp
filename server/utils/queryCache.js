const { getCache, setCache, deleteCache, deleteCachePattern } = require("./cache");

const QUERY_CACHE_TTL = 300;

const cacheableQuery = async (cacheKey, queryFn, ttl = QUERY_CACHE_TTL) => {
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await queryFn();
  await setCache(cacheKey, result, ttl);
  return result;
};

const invalidateQueryCache = async (patterns) => {
  if (Array.isArray(patterns)) {
    await Promise.all(patterns.map(pattern => deleteCachePattern(pattern)));
  } else {
    await deleteCachePattern(patterns);
  }
};

const buildCacheKey = (prefix, params) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join(":");
  return `${prefix}:${sortedParams}`;
};

module.exports = {
  cacheableQuery,
  invalidateQueryCache,
  buildCacheKey,
};
