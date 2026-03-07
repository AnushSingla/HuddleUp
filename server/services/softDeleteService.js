const mongoose = require("mongoose");
const logger = require("../utils/logger");
const AuditLogger = require("./auditLogger");

/**
 * Soft Delete Service
 * Provides centralized soft delete functionality for all models
 */
class SoftDeleteService {
  /**
   * Soft delete a document with audit logging
   * @param {Object} model - Mongoose model
   * @param {String} id - Document ID
   * @param {String} deletedBy - User ID who deleted the document
   * @param {String} deleteReason - Reason for deletion
   * @param {Object} options - Additional options
   * @returns {Object} Updated document
   */
  static async softDelete(model, id, deletedBy, deleteReason = 'User deleted', options = {}) {
    try {
      // Get original document for audit trail
      const originalDoc = await model.findById(id).lean();
      if (!originalDoc) {
        throw new Error('Document not found');
      }

      const document = await model.findByIdAndUpdate(
        id,
        {
          deletedAt: new Date(),
          deletedBy: deletedBy,
          deleteReason: deleteReason,
          isDeleted: true
        },
        { new: true }
      );

      // Create audit log
      await AuditLogger.logDeletion(
        model.modelName,
        id,
        deletedBy,
        deleteReason,
        {
          originalData: originalDoc,
          systemInfo: options.systemInfo || {}
        }
      );

      // Handle cascade deletion if specified
      if (options.cascade !== false) {
        await this.handleCascadeDeletion(model.modelName, id, deletedBy, deleteReason, options);
      }

      logger.info('Document soft deleted successfully', {
        model: model.modelName,
        documentId: id,
        deletedBy,
        deleteReason
      });

      return document;
    } catch (error) {
      logger.error('Soft delete failed', {
        model: model.modelName,
        documentId: id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Restore a soft deleted document with audit logging
   * @param {Object} model - Mongoose model
   * @param {String} id - Document ID
   * @param {String} restoredBy - User ID who restored the document
   * @param {Object} options - Additional options
   * @returns {Object} Updated document
   */
  static async restore(model, id, restoredBy, options = {}) {
    try {
      // Get original document for audit trail
      const originalDoc = await model.findById(id, null, { includeSoftDeleted: true }).lean();
      if (!originalDoc) {
        throw new Error('Document not found');
      }

      if (!originalDoc.isDeleted) {
        throw new Error('Document is not deleted');
      }

      // Check recovery window if specified
      if (options.checkRecoveryWindow !== false) {
        const recoveryWindow = options.recoveryWindow || 30 * 24 * 60 * 60 * 1000; // 30 days
        const deletedAt = new Date(originalDoc.deletedAt);
        const now = new Date();
        
        if (now - deletedAt > recoveryWindow) {
          throw new Error('Recovery window has expired');
        }
      }

      const document = await model.findByIdAndUpdate(
        id,
        {
          $unset: {
            deletedAt: 1,
            deletedBy: 1,
            deleteReason: 1
          },
          isDeleted: false,
          restoredAt: new Date(),
          restoredBy: restoredBy
        },
        { new: true, includeSoftDeleted: true }
      );

      // Create audit log
      await AuditLogger.logRestoration(
        model.modelName,
        id,
        restoredBy,
        {
          originalData: originalDoc,
          systemInfo: options.systemInfo || {}
        }
      );

      // Handle cascade restoration if specified
      if (options.cascade !== false) {
        await this.handleCascadeRestoration(model.modelName, id, restoredBy, options);
      }

      logger.info('Document restored successfully', {
        model: model.modelName,
        documentId: id,
        restoredBy
      });

      return document;
    } catch (error) {
      logger.error('Document restoration failed', {
        model: model.modelName,
        documentId: id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Handle cascade deletion for parent-child relationships
   */
  static async handleCascadeDeletion(parentModel, parentId, deletedBy, deleteReason, options = {}) {
    const cascadeActions = [];

    try {
      if (parentModel === 'Video') {
        // Soft delete all comments for this video
        const Comment = require("../models/Comment");
        const comments = await Comment.find({ videoId: parentId, isDeleted: { $ne: true } });
        
        for (const comment of comments) {
          await Comment.findByIdAndUpdate(comment._id, {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: deletedBy,
            deleteReason: 'Parent video deleted'
          });
          
          cascadeActions.push({
            type: 'Comment',
            id: comment._id,
            action: 'soft_deleted'
          });
        }
      } else if (parentModel === 'Post') {
        // Soft delete all comments for this post
        const Comment = require("../models/Comment");
        const comments = await Comment.find({ postId: parentId, isDeleted: { $ne: true } });
        
        for (const comment of comments) {
          await Comment.findByIdAndUpdate(comment._id, {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: deletedBy,
            deleteReason: 'Parent post deleted'
          });
          
          cascadeActions.push({
            type: 'Comment',
            id: comment._id,
            action: 'soft_deleted'
          });
        }
      }

      // Log cascade operation if any actions were taken
      if (cascadeActions.length > 0) {
        await AuditLogger.logCascadeOperation(
          parentModel,
          parentId,
          cascadeActions,
          deletedBy,
          'CASCADE_DELETE',
          { systemInfo: options.systemInfo || {} }
        );
      }

      return cascadeActions;
    } catch (error) {
      logger.error('Cascade deletion failed', {
        parentModel,
        parentId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Handle cascade restoration for parent-child relationships
   */
  static async handleCascadeRestoration(parentModel, parentId, restoredBy, options = {}) {
    const cascadeActions = [];

    try {
      if (parentModel === 'Video') {
        // Restore comments that were cascade-deleted with this video
        const Comment = require("../models/Comment");
        const comments = await Comment.find({ 
          videoId: parentId, 
          isDeleted: true,
          deleteReason: 'Parent video deleted'
        }, null, { includeSoftDeleted: true });
        
        for (const comment of comments) {
          await Comment.findByIdAndUpdate(comment._id, {
            $unset: {
              deletedAt: 1,
              deletedBy: 1,
              deleteReason: 1
            },
            isDeleted: false,
            restoredAt: new Date(),
            restoredBy: restoredBy
          }, { includeSoftDeleted: true });
          
          cascadeActions.push({
            type: 'Comment',
            id: comment._id,
            action: 'restored'
          });
        }
      } else if (parentModel === 'Post') {
        // Restore comments that were cascade-deleted with this post
        const Comment = require("../models/Comment");
        const comments = await Comment.find({ 
          postId: parentId, 
          isDeleted: true,
          deleteReason: 'Parent post deleted'
        }, null, { includeSoftDeleted: true });
        
        for (const comment of comments) {
          await Comment.findByIdAndUpdate(comment._id, {
            $unset: {
              deletedAt: 1,
              deletedBy: 1,
              deleteReason: 1
            },
            isDeleted: false,
            restoredAt: new Date(),
            restoredBy: restoredBy
          }, { includeSoftDeleted: true });
          
          cascadeActions.push({
            type: 'Comment',
            id: comment._id,
            action: 'restored'
          });
        }
      }

      // Log cascade operation if any actions were taken
      if (cascadeActions.length > 0) {
        await AuditLogger.logCascadeOperation(
          parentModel,
          parentId,
          cascadeActions,
          restoredBy,
          'CASCADE_RESTORE',
          { systemInfo: options.systemInfo || {} }
        );
      }

      return cascadeActions;
    } catch (error) {
      logger.error('Cascade restoration failed', {
        parentModel,
        parentId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Permanently delete a document (hard delete)
   * @param {Object} model - Mongoose model
   * @param {String} id - Document ID
   * @param {String} deletedBy - User ID who permanently deleted the document
   * @returns {Object} Deleted document
   */
  static async permanentDelete(model, id, deletedBy) {
    try {
      const document = await model.findByIdAndDelete(id);

      if (!document) {
        throw new Error('Document not found');
      }

      logger.warn('Document permanently deleted', {
        model: model.modelName,
        documentId: id,
        deletedBy,
        originalDocument: document
      });

      return document;
    } catch (error) {
      logger.error('Permanent deletion failed', {
        model: model.modelName,
        documentId: id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get soft deleted documents with pagination
   * @param {Object} model - Mongoose model
   * @param {Object} options - Query options
   * @returns {Object} Paginated results
   */
  static async getDeleted(model, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'deletedAt',
        sortOrder = -1,
        deletedBy = null,
        dateFrom = null,
        dateTo = null
      } = options;

      const filter = { isDeleted: true };
      
      if (deletedBy) {
        filter.deletedBy = deletedBy;
      }

      if (dateFrom || dateTo) {
        filter.deletedAt = {};
        if (dateFrom) filter.deletedAt.$gte = new Date(dateFrom);
        if (dateTo) filter.deletedAt.$lte = new Date(dateTo);
      }

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder };

      const [documents, total] = await Promise.all([
        model.find(filter)
          .populate('deletedBy', 'username email')
          .populate('restoredBy', 'username email')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        model.countDocuments(filter)
      ]);

      return {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get deleted documents', {
        model: model.modelName,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Clean up old soft deleted documents (auto-delete after retention period)
   * @param {Object} model - Mongoose model
   * @param {Number} retentionDays - Days to keep soft deleted documents
   * @returns {Number} Number of documents permanently deleted
   */
  static async cleanup(model, retentionDays = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await model.deleteMany({
        isDeleted: true,
        deletedAt: { $lt: cutoffDate }
      });

      logger.info('Soft delete cleanup completed', {
        model: model.modelName,
        retentionDays,
        deletedCount: result.deletedCount
      });

      return result.deletedCount;
    } catch (error) {
      logger.error('Soft delete cleanup failed', {
        model: model.modelName,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get default query filter to exclude soft deleted documents
   * @param {Object} additionalFilter - Additional filter conditions
   * @returns {Object} Combined filter
   */
  static getActiveFilter(additionalFilter = {}) {
    return {
      ...additionalFilter,
      $or: [
        { isDeleted: { $exists: false } },
        { isDeleted: false }
      ]
    };
  }

  /**
   * Add soft delete middleware to a schema
   * @param {Object} schema - Mongoose schema
   */
  static addMiddleware(schema) {
    // Add default filter to exclude soft deleted documents
    schema.pre(/^find/, function() {
      if (!this.getOptions().includeSoftDeleted) {
        this.where({
          $or: [
            { isDeleted: { $exists: false } },
            { isDeleted: false }
          ]
        });
      }
    });

    // Add instance methods
    schema.methods.softDelete = function(deletedBy, deleteReason = 'User deleted') {
      return SoftDeleteService.softDelete(this.constructor, this._id, deletedBy, deleteReason);
    };

    schema.methods.restore = function(restoredBy) {
      return SoftDeleteService.restore(this.constructor, this._id, restoredBy);
    };

    // Add static methods
    schema.statics.findWithDeleted = function(filter = {}) {
      return this.find(filter, null, { includeSoftDeleted: true });
    };

    schema.statics.findDeleted = function(filter = {}) {
      return this.find({ ...filter, isDeleted: true }, null, { includeSoftDeleted: true });
    };

    schema.statics.softDeleteById = function(id, deletedBy, deleteReason) {
      return SoftDeleteService.softDelete(this, id, deletedBy, deleteReason);
    };

    schema.statics.restoreById = function(id, restoredBy) {
      return SoftDeleteService.restore(this, id, restoredBy);
    };
  }
}

module.exports = SoftDeleteService;