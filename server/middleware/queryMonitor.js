const mongoose = require("mongoose");

const queryStats = {
  totalQueries: 0,
  slowQueries: [],
  queryTypes: {},
};

const SLOW_QUERY_THRESHOLD = 100;
const MAX_SLOW_QUERIES = 50;

const initQueryMonitoring = () => {
  if (process.env.ENABLE_QUERY_MONITORING !== "true") {
    return;
  }

  mongoose.set("debug", (collectionName, method, query, doc, options) => {
    const startTime = Date.now();
    
    queryStats.totalQueries++;
    const queryType = `${collectionName}.${method}`;
    queryStats.queryTypes[queryType] = (queryStats.queryTypes[queryType] || 0) + 1;

    process.nextTick(() => {
      const duration = Date.now() - startTime;
      
      if (duration > SLOW_QUERY_THRESHOLD) {
        const slowQuery = {
          collection: collectionName,
          method,
          query: JSON.stringify(query),
          duration,
          timestamp: new Date(),
        };

        queryStats.slowQueries.unshift(slowQuery);
        if (queryStats.slowQueries.length > MAX_SLOW_QUERIES) {
          queryStats.slowQueries.pop();
        }

        console.warn(`⚠️ Slow query detected (${duration}ms): ${collectionName}.${method}`);
      }
    });
  });
};

const queryPerformanceMiddleware = (req, res, next) => {
  if (process.env.ENABLE_QUERY_METRICS !== "true") {
    return next();
  }

  const startQueries = queryStats.totalQueries;
  const startTime = Date.now();

  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const queriesExecuted = queryStats.totalQueries - startQueries;

    res.setHeader("X-Query-Count", queriesExecuted);
    res.setHeader("X-Response-Time", `${duration}ms`);

    if (queriesExecuted > 10) {
      console.warn(`⚠️ High query count: ${queriesExecuted} queries for ${req.method} ${req.path}`);
    }

    return originalJson(data);
  };

  next();
};

const getQueryStats = () => ({
  ...queryStats,
  slowQueries: queryStats.slowQueries.slice(0, 20),
});

const resetQueryStats = () => {
  queryStats.totalQueries = 0;
  queryStats.slowQueries = [];
  queryStats.queryTypes = {};
};

module.exports = {
  initQueryMonitoring,
  queryPerformanceMiddleware,
  getQueryStats,
  resetQueryStats,
};
