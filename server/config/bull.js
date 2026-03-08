const Bull = require("bull");
const { getRedisClient, isRedisReady } = require("./redis");

const createQueue = (queueName, options = {}) => {
  if (isRedisReady()) {
    const redisClient = getRedisClient();
    return new Bull(queueName, {
      redis: {
        port: redisClient.options.port,
        host: redisClient.options.host,
      },
      ...options,
    });
  }
  
  return new Bull(queueName, options);
};

module.exports = { createQueue };
