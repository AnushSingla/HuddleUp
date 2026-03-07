const cron = require('node-cron');
const mongoose = require('mongoose');
const logger = require("../utils/logger");
const AuditLogger = require("./auditLogger");

/**
 * Cleanup Scheduler Service
 * Handles automatic cleanup of expired soft deleted content
 */
class CleanupScheduler {
  static isScheduled = false;
  static defaultRetentionDays = 30;

  /**
   * Schedule automatic cleanup to run daily at 2 AM
   */
  static scheduleCleanup() {
    if (this.isScheduled) {
      logger.warn('Cleanup scheduler already running');
      return;
    }

    // Run daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      logger.info('Starting scheduled cleanup operation');
      try {
        await this.performCleanup();
      } catch (error) {
        logger.error('Scheduled cleanup failed', { error: error.message });
      }
    });

    this.isScheduled = true;
    logger.info('Cleanup scheduler started - will run daily at 2 AM');
  }

  /**
   * Perform cleanup operation
   */
  static async performCleanup(options = {}) {
    const {
      retentionDays = this.defaultRetentionDays,
      batchSize = 100,
      dryRun = false
    } = options;

    logger.info('Starting cleanup operation', { retentionDays, batchSize, dryRun });

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const models = ['Video', 'Post', 'Comment', 'Playlist'];
    const results = {};

    for (const modelName of models) {
      try {
        const Model = mongoose.model(modelName);
        const result = await this.cleanupModel(Model, cutoffDate, batchSize, dryRun);
        results[modelName] = result;
        
        logger.info(`Cleanup completed for ${modelName}`, {
          deletedCount: result.deletedCount,
          dryRun
        });
      } catch (error) {
        logger.error(`Cleanup failed for ${modelName}`, { error: error.message });
        results[modelName] = { error: error.message, deletedCount: 0 };
      }
    }

    // Log cleanup operation in audit trail
    await AuditLogger.logCleanupOperation(results, cutoffDate, dryRun, {
      userId: new mongoose.Types.ObjectId(), // System operation
      systemInfo: {
        operation: 'automatic_cleanup',
        retentionDays,
        batchSize
      }
    });

    const totalDeleted = Object.values(results).reduce((sum, result) => {
      return sum + (result.deletedCount || 0);
    }, 0);

    logger.info('Cleanup operation completed', {
      totalDeleted,
      dryRun,
      cutoffDate,
      results
    });

    return results;
  }

  /**
   * Clean up a specific model
   */
  static async cleanupModel(Model, cutoffDate, batchSize, dryRun) {
    let totalDeleted = 0;
    let hasMore = true;

    while (hasMore) {
      // Find expired soft deleted content
      const batch = await Model.find({
        isDeleted: true,
        deletedAt: { $lt: cutoffDate }
      }, null, { includeSoftDeleted: true })
      .limit(batchSize)
      .select('_id deletedAt deletedBy deleteReason title name text')
      .lean();

      if (batch.length === 0) {
        hasMore = false;
        continue;
      }

      if (!dryRun) {
        // Log each document before permanent deletion
        for (const doc of batch) {
          await AuditLogger.logPermanentDeletion(
            Model.modelName,
            doc._id,
            new mongoose.Types.ObjectId(), // System cleanup user
            {
              reason: 'Automatic cleanup - retention period expired',
              originalDeletionDate: doc.deletedAt,
              originalDeletedBy: doc.deletedBy,
              originalReason: doc.deleteReason,
              systemInfo: {
                operation: 'automatic_cleanup',
                cutoffDate
              }
            }
          );
        }

        // Permanently delete the batch
        const deleteResult = await Model.deleteMany({
          _id: { $in: batch.map(doc => doc._id) }
        });

        totalDeleted += deleteResult.deletedCount;

        logger.debug(`Permanently deleted ${deleteResult.deletedCount} ${Model.modelName} documents`);
      } else {
        // Dry run - just count what would be deleted
        totalDeleted += batch.length;
        logger.debug(`Would delete ${batch.length} ${Model.modelName} documents (dry run)`);
      }

      hasMore = batch.length === batchSize;
    }

    return { deletedCount: totalDeleted };
  }

  /**
   * Manual cleanup trigger with validation
   */
  static async manualCleanup(options = {}, userId = 'admin') {
    try {
      logger.info('Manual cleanup triggered', { userId, options });

      // Add user info to options
      const cleanupOptions = {
        ...options,
        systemInfo: {
          operation: 'manual_cleanup',
          triggeredBy: userId,
          timestamp: new Date()
        }
      };

      const results = await this.performCleanup(cleanupOptions);

      return {
        success: true,
        results,
        message: options.dryRun ? 'Dry run completed' : 'Cleanup completed successfully'
      };
    } catch (error) {
      logger.error('Manual cleanup failed', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get cleanup statistics
   */
  static async getCleanupStats(days = 30) {
    try {
      const models = ['Video', 'Post', 'Comment', 'Playlist'];
      const stats = {};

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      for (const modelName of models) {
        const Model = mongoose.model(modelName);
        
        const [total, deleted, expiring] = await Promise.all([
          Model.countDocuments({}),
          Model.countDocuments({ isDeleted: true }, { includeSoftDeleted: true }),
          Model.countDocuments({
            isDeleted: true,
            deletedAt: { $lt: cutoffDate }
          }, { includeSoftDeleted: true })
        ]);

        stats[modelName] = {
          total,
          deleted,
          expiring,
          active: total - deleted
        };
      }

      // Get recent cleanup operations from audit log
      const recentCleanups = await AuditLogger.generateReport({
        eventType: 'CLEANUP',
        dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        limit: 10
      });

      return {
        stats,
        recentCleanups: recentCleanups.data,
        retentionDays: days,
        nextCleanupDate: this.getNextCleanupDate()
      };
    } catch (error) {
      logger.error('Failed to get cleanup statistics', { error: error.message });
      throw error;
    }
  }

  /**
   * Get next scheduled cleanup date
   */
  static getNextCleanupDate() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0); // 2 AM tomorrow
    
    return tomorrow;
  }

  /**
   * Stop the cleanup scheduler
   */
  static stopScheduler() {
    if (this.isScheduled) {
      // Note: node-cron doesn't provide a direct way to stop specific tasks
      // This would need to be implemented with task tracking
      this.isScheduled = false;
      logger.info('Cleanup scheduler stopped');
    }
  }

  /**
   * Update retention period configuration
   */
  static updateRetentionPeriod(days) {
    if (days < 1 || days > 365) {
      throw new Error('Retention period must be between 1 and 365 days');
    }

    this.defaultRetentionDays = days;
    logger.info('Retention period updated', { retentionDays: days });

    return {
      success: true,
      retentionDays: days,
      message: `Retention period updated to ${days} days`
    };
  }
}

module.exports = CleanupScheduler;