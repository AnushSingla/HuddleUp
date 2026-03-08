const cron = require('node-cron');
const tokenService = require('./tokenService');
const logger = require('../utils/logger');

/**
 * Schedule cleanup of expired refresh tokens
 * Runs every day at 2:00 AM
 */
const scheduleTokenCleanup = () => {
  // Run every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Starting scheduled token cleanup');
      const count = await tokenService.cleanupExpiredTokens();
      logger.info('Token cleanup completed', { tokensRemoved: count });
    } catch (error) {
      logger.error('Token cleanup failed', { error: error.message });
    }
  });

  logger.info('Token cleanup scheduler initialized (runs daily at 2:00 AM)');
};

/**
 * Manual cleanup trigger (for admin use)
 */
const manualTokenCleanup = async () => {
  try {
    logger.info('Manual token cleanup triggered');
    const count = await tokenService.cleanupExpiredTokens();
    logger.info('Manual token cleanup completed', { tokensRemoved: count });
    return { success: true, tokensRemoved: count };
  } catch (error) {
    logger.error('Manual token cleanup failed', { error: error.message });
    return { success: false, error: error.message };
  }
};

module.exports = {
  scheduleTokenCleanup,
  manualTokenCleanup
};
