const AuditLog = require("../models/AuditLog");
const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Audit Logger Service
 * Provides immutable audit trail for all soft delete operations
 */
class AuditLogger {
  /**
   * Log a soft deletion operation
   */
  static async logDeletion(contentType, contentId, deletedBy, deleteReason, metadata = {}) {
    try {
      const auditEntry = new AuditLog({
        eventType: 'SOFT_DELETE',
        contentType,
        contentId,
        userId: deletedBy,
        reason: deleteReason,
        metadata: {
          originalData: metadata.originalData,
          systemInfo: metadata.systemInfo || {}
        }
      });

      await auditEntry.save();
      
      logger.info('Audit log created for deletion', {
        eventId: auditEntry.eventId,
        contentType,
        contentId,
        deletedBy
      });

      return auditEntry;
    } catch (error) {
      logger.error('Failed to create audit log for deletion', {
        error: error.message,
        contentType,
        contentId,
        deletedBy
      });
      // Don't throw - audit logging failure shouldn't break the main operation
    }
  }

  /**
   * Log a restoration operation
   */
  static async logRestoration(contentType, contentId, restoredBy, metadata = {}) {
    try {
      const auditEntry = new AuditLog({
        eventType: 'RESTORE',
        contentType,
        contentId,
        userId: restoredBy,
        reason: 'Content restored',
        metadata: {
          originalData: metadata.originalData,
          systemInfo: metadata.systemInfo || {}
        }
      });

      await auditEntry.save();
      
      logger.info('Audit log created for restoration', {
        eventId: auditEntry.eventId,
        contentType,
        contentId,
        restoredBy
      });

      return auditEntry;
    } catch (error) {
      logger.error('Failed to create audit log for restoration', {
        error: error.message,
        contentType,
        contentId,
        restoredBy
      });
    }
  }

  /**
   * Log a permanent deletion operation
   */
  static async logPermanentDeletion(contentType, contentId, deletedBy, metadata = {}) {
    try {
      const auditEntry = new AuditLog({
        eventType: 'PERMANENT_DELETE',
        contentType,
        contentId,
        userId: deletedBy,
        reason: metadata.reason || 'Permanent deletion',
        metadata: {
          originalData: metadata.originalData,
          systemInfo: metadata.systemInfo || {}
        }
      });

      await auditEntry.save();
      
      logger.info('Audit log created for permanent deletion', {
        eventId: auditEntry.eventId,
        contentType,
        contentId,
        deletedBy
      });

      return auditEntry;
    } catch (error) {
      logger.error('Failed to create audit log for permanent deletion', {
        error: error.message,
        contentType,
        contentId,
        deletedBy
      });
    }
  }

  /**
   * Log a cascade operation
   */
  static async logCascadeOperation(parentType, parentId, cascadeActions, userId, eventType = 'CASCADE_DELETE', metadata = {}) {
    try {
      const auditEntry = new AuditLog({
        eventType,
        contentType: parentType,
        contentId: parentId,
        userId,
        reason: `Cascade ${eventType.toLowerCase().replace('cascade_', '')} operation`,
        metadata: {
          cascadeInfo: {
            parentType,
            parentId,
            affectedChildren: cascadeActions
          },
          systemInfo: metadata.systemInfo || {}
        }
      });

      await auditEntry.save();
      
      logger.info('Audit log created for cascade operation', {
        eventId: auditEntry.eventId,
        parentType,
        parentId,
        affectedChildren: cascadeActions.length,
        eventType
      });

      return auditEntry;
    } catch (error) {
      logger.error('Failed to create audit log for cascade operation', {
        error: error.message,
        parentType,
        parentId,
        eventType
      });
    }
  }

  /**
   * Log cleanup operations
   */
  static async logCleanupOperation(results, cutoffDate, dryRun = false, metadata = {}) {
    try {
      const totalDeleted = Object.values(results).reduce((sum, result) => {
        return sum + (result.deletedCount || 0);
      }, 0);

      const auditEntry = new AuditLog({
        eventType: 'CLEANUP',
        contentType: 'System',
        contentId: new mongoose.Types.ObjectId(), // Dummy ID for system operations
        userId: metadata.userId || new mongoose.Types.ObjectId(), // System user ID
        reason: dryRun ? 'Cleanup dry run' : 'Automatic cleanup',
        metadata: {
          originalData: {
            cutoffDate,
            dryRun,
            results,
            totalDeleted
          },
          systemInfo: metadata.systemInfo || {}
        }
      });

      await auditEntry.save();
      
      logger.info('Audit log created for cleanup operation', {
        eventId: auditEntry.eventId,
        totalDeleted,
        dryRun,
        cutoffDate
      });

      return auditEntry;
    } catch (error) {
      logger.error('Failed to create audit log for cleanup operation', {
        error: error.message,
        totalDeleted: Object.values(results).reduce((sum, result) => sum + (result.deletedCount || 0), 0)
      });
    }
  }

  /**
   * Generate audit report with filtering
   */
  static async generateReport(filters = {}, format = 'json') {
    try {
      const {
        eventType,
        contentType,
        userId,
        dateFrom,
        dateTo,
        page = 1,
        limit = 100
      } = filters;

      const query = {};
      
      if (eventType) query.eventType = eventType;
      if (contentType) query.contentType = contentType;
      if (userId) query.userId = userId;
      
      if (dateFrom || dateTo) {
        query.timestamp = {};
        if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
        if (dateTo) query.timestamp.$lte = new Date(dateTo);
      }

      const auditLogs = await AuditLog.find(query)
        .populate('userId', 'username email')
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const totalCount = await AuditLog.countDocuments(query);

      const report = {
        filters,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        data: auditLogs,
        generatedAt: new Date(),
        format
      };

      if (format === 'csv') {
        return this.convertToCSV(report);
      }

      return report;
    } catch (error) {
      logger.error('Failed to generate audit report', {
        error: error.message,
        filters
      });
      throw error;
    }
  }

  /**
   * Export audit trail for compliance
   */
  static async exportAuditTrail(dateRange, contentTypes = [], format = 'csv') {
    try {
      const query = {
        timestamp: {
          $gte: new Date(dateRange.from),
          $lte: new Date(dateRange.to)
        }
      };

      if (contentTypes.length > 0) {
        query.contentType = { $in: contentTypes };
      }

      const auditLogs = await AuditLog.find(query)
        .populate('userId', 'username email')
        .sort({ timestamp: -1 })
        .lean();

      const exportData = {
        exportDate: new Date(),
        dateRange,
        contentTypes,
        totalRecords: auditLogs.length,
        data: auditLogs
      };

      if (format === 'csv') {
        return this.convertToCSV(exportData);
      }

      return exportData;
    } catch (error) {
      logger.error('Failed to export audit trail', {
        error: error.message,
        dateRange,
        contentTypes
      });
      throw error;
    }
  }

  /**
   * Convert audit data to CSV format
   */
  static convertToCSV(data) {
    const headers = [
      'Event ID',
      'Timestamp',
      'Event Type',
      'Content Type',
      'Content ID',
      'User ID',
      'Username',
      'Reason',
      'IP Address',
      'User Agent'
    ];

    const rows = data.data.map(log => [
      log.eventId,
      log.timestamp.toISOString(),
      log.eventType,
      log.contentType,
      log.contentId,
      log.userId._id || log.userId,
      log.userId.username || 'Unknown',
      log.reason || '',
      log.metadata?.systemInfo?.ipAddress || '',
      log.metadata?.systemInfo?.userAgent || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return {
      content: csvContent,
      filename: `audit_trail_${new Date().toISOString().split('T')[0]}.csv`,
      contentType: 'text/csv'
    };
  }

  /**
   * Get audit statistics
   */
  static async getAuditStats(dateRange = {}) {
    try {
      const query = {};
      
      if (dateRange.from || dateRange.to) {
        query.timestamp = {};
        if (dateRange.from) query.timestamp.$gte = new Date(dateRange.from);
        if (dateRange.to) query.timestamp.$lte = new Date(dateRange.to);
      }

      const stats = await AuditLog.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 },
            latestEvent: { $max: '$timestamp' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const contentTypeStats = await AuditLog.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$contentType',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const totalEvents = await AuditLog.countDocuments(query);

      return {
        totalEvents,
        eventTypeStats: stats,
        contentTypeStats,
        dateRange
      };
    } catch (error) {
      logger.error('Failed to get audit statistics', {
        error: error.message,
        dateRange
      });
      throw error;
    }
  }
}

module.exports = AuditLogger;