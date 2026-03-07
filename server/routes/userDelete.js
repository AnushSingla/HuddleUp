const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { ResponseHandler } = require("../utils/responseHandler");
const SoftDeleteService = require("../services/softDeleteService");
const Video = require("../models/Video");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Playlist = require("../models/Playlist");
const logger = require("../utils/logger");

/**
 * Get user's deleted content
 */
router.get("/deleted", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'all' } = req.query;

    const results = {};

    if (type === 'all' || type === 'videos') {
      const videos = await Video.find({ 
        postedBy: userId, 
        isDeleted: true 
      }, null, { includeSoftDeleted: true })
      .populate('deletedBy', 'username')
      .sort({ deletedAt: -1 })
      .lean();
      results.videos = videos;
    }

    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({ 
        postedBy: userId, 
        isDeleted: true 
      }, null, { includeSoftDeleted: true })
      .populate('deletedBy', 'username')
      .sort({ deletedAt: -1 })
      .lean();
      results.posts = posts;
    }

    if (type === 'all' || type === 'comments') {
      const comments = await Comment.find({ 
        userId: userId, 
        isDeleted: true 
      }, null, { includeSoftDeleted: true })
      .populate('deletedBy', 'username')
      .populate('videoId', 'title')
      .populate('postId', 'title')
      .sort({ deletedAt: -1 })
      .lean();
      results.comments = comments;
    }

    if (type === 'all' || type === 'playlists') {
      const playlists = await Playlist.find({ 
        userId: userId, 
        isDeleted: true 
      }, null, { includeSoftDeleted: true })
      .populate('deletedBy', 'username')
      .sort({ deletedAt: -1 })
      .lean();
      results.playlists = playlists;
    }

    return ResponseHandler.success(res, results, 'Deleted content retrieved successfully');
  } catch (error) {
    logger.error('Failed to get user deleted content', {
      error: error.message,
      userId: req.user?.id
    });
    return ResponseHandler.error(res, 'INTERNAL_ERROR', 'Failed to retrieve deleted content', 500);
  }
});

/**
 * Restore user's own deleted content
 */
router.post("/deleted/restore/:type/:id", verifyToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user.id;

    // Get the appropriate model
    let Model;
    switch (type) {
      case 'video':
        Model = Video;
        break;
      case 'post':
        Model = Post;
        break;
      case 'comment':
        Model = Comment;
        break;
      case 'playlist':
        Model = Playlist;
        break;
      default:
        return ResponseHandler.error(res, 'INVALID_CONTENT_TYPE', 'Invalid content type', 400);
    }

    // Find the deleted content
    const content = await Model.findById(id, null, { includeSoftDeleted: true });
    if (!content) {
      return ResponseHandler.notFound(res, 'Content not found');
    }

    if (!content.isDeleted) {
      return ResponseHandler.error(res, 'ALREADY_RESTORED', 'Content is not deleted', 400);
    }

    // Check ownership
    const ownerField = type === 'comment' ? 'userId' : (type === 'playlist' ? 'userId' : 'postedBy');
    if (content[ownerField].toString() !== userId.toString()) {
      return ResponseHandler.forbidden(res, 'You can only restore your own content');
    }

    // Check recovery window (30 days)
    const recoveryWindow = 30 * 24 * 60 * 60 * 1000; // 30 days
    const deletedAt = new Date(content.deletedAt);
    const now = new Date();
    
    if (now - deletedAt > recoveryWindow) {
      return ResponseHandler.error(res, 'RESTORATION_EXPIRED', 'Recovery window has expired', 400);
    }

    // Restore the content with system info
    const systemInfo = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      apiVersion: '1.0'
    };

    const restoredContent = await SoftDeleteService.restore(Model, id, userId, { 
      systemInfo,
      checkRecoveryWindow: false // Already checked above
    });

    logger.info('User restored own content', {
      contentType: type,
      contentId: id,
      userId
    });

    return ResponseHandler.success(res, {
      id: restoredContent._id,
      type,
      restoredAt: restoredContent.restoredAt,
      restoredBy: restoredContent.restoredBy
    }, 'Content restored successfully');
  } catch (error) {
    logger.error('Failed to restore user content', {
      error: error.message,
      contentType: req.params.type,
      contentId: req.params.id,
      userId: req.user?.id
    });

    if (error.message === 'Recovery window has expired') {
      return ResponseHandler.error(res, 'RESTORATION_EXPIRED', error.message, 400);
    }

    return ResponseHandler.error(res, 'INTERNAL_ERROR', 'Failed to restore content', 500);
  }
});

/**
 * Permanently delete user's own deleted content
 */
router.delete("/deleted/permanent/:type/:id", verifyToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user.id;

    // Get the appropriate model
    let Model;
    switch (type) {
      case 'video':
        Model = Video;
        break;
      case 'post':
        Model = Post;
        break;
      case 'comment':
        Model = Comment;
        break;
      case 'playlist':
        Model = Playlist;
        break;
      default:
        return ResponseHandler.error(res, 'INVALID_CONTENT_TYPE', 'Invalid content type', 400);
    }

    // Find the deleted content
    const content = await Model.findById(id, null, { includeSoftDeleted: true });
    if (!content) {
      return ResponseHandler.notFound(res, 'Content not found');
    }

    if (!content.isDeleted) {
      return ResponseHandler.error(res, 'NOT_DELETED', 'Content is not deleted', 400);
    }

    // Check ownership
    const ownerField = type === 'comment' ? 'userId' : (type === 'playlist' ? 'userId' : 'postedBy');
    if (content[ownerField].toString() !== userId.toString()) {
      return ResponseHandler.forbidden(res, 'You can only permanently delete your own content');
    }

    // Permanently delete the content
    const systemInfo = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      apiVersion: '1.0'
    };

    await SoftDeleteService.permanentDelete(Model, id, userId, { systemInfo });

    logger.info('User permanently deleted own content', {
      contentType: type,
      contentId: id,
      userId
    });

    return ResponseHandler.success(res, null, 'Content permanently deleted');
  } catch (error) {
    logger.error('Failed to permanently delete user content', {
      error: error.message,
      contentType: req.params.type,
      contentId: req.params.id,
      userId: req.user?.id
    });

    return ResponseHandler.error(res, 'INTERNAL_ERROR', 'Failed to permanently delete content', 500);
  }
});

/**
 * Bulk restore user's deleted content
 */
router.post("/deleted/bulk-restore", verifyToken, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(items) || items.length === 0) {
      return ResponseHandler.error(res, 'INVALID_INPUT', 'Items array is required', 400);
    }

    const results = [];
    const errors = [];

    for (const item of items) {
      try {
        const { type, id } = item;

        // Get the appropriate model
        let Model;
        switch (type) {
          case 'video':
            Model = Video;
            break;
          case 'post':
            Model = Post;
            break;
          case 'comment':
            Model = Comment;
            break;
          case 'playlist':
            Model = Playlist;
            break;
          default:
            errors.push({ id, type, error: 'Invalid content type' });
            continue;
        }

        // Find and validate the content
        const content = await Model.findById(id, null, { includeSoftDeleted: true });
        if (!content) {
          errors.push({ id, type, error: 'Content not found' });
          continue;
        }

        if (!content.isDeleted) {
          errors.push({ id, type, error: 'Content is not deleted' });
          continue;
        }

        // Check ownership
        const ownerField = type === 'comment' ? 'userId' : (type === 'playlist' ? 'userId' : 'postedBy');
        if (content[ownerField].toString() !== userId.toString()) {
          errors.push({ id, type, error: 'Permission denied' });
          continue;
        }

        // Check recovery window
        const recoveryWindow = 30 * 24 * 60 * 60 * 1000; // 30 days
        const deletedAt = new Date(content.deletedAt);
        const now = new Date();
        
        if (now - deletedAt > recoveryWindow) {
          errors.push({ id, type, error: 'Recovery window expired' });
          continue;
        }

        // Restore the content
        const systemInfo = {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          apiVersion: '1.0'
        };

        const restoredContent = await SoftDeleteService.restore(Model, id, userId, { 
          systemInfo,
          checkRecoveryWindow: false
        });

        results.push({
          id: restoredContent._id,
          type,
          restoredAt: restoredContent.restoredAt
        });
      } catch (error) {
        errors.push({ id: item.id, type: item.type, error: error.message });
      }
    }

    logger.info('User bulk restore completed', {
      userId,
      totalItems: items.length,
      successful: results.length,
      failed: errors.length
    });

    return ResponseHandler.success(res, {
      restored: results,
      errors,
      summary: {
        total: items.length,
        successful: results.length,
        failed: errors.length
      }
    }, `Bulk restore completed: ${results.length} successful, ${errors.length} failed`);
  } catch (error) {
    logger.error('Failed to bulk restore user content', {
      error: error.message,
      userId: req.user?.id
    });

    return ResponseHandler.error(res, 'INTERNAL_ERROR', 'Failed to bulk restore content', 500);
  }
});

/**
 * Get user's deleted content statistics
 */
router.get("/deleted/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [videoStats, postStats, commentStats, playlistStats] = await Promise.all([
      Video.aggregate([
        { $match: { postedBy: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            deleted: { $sum: { $cond: [{ $eq: ['$isDeleted', true] }, 1, 0] } }
          }
        }
      ]),
      Post.aggregate([
        { $match: { postedBy: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            deleted: { $sum: { $cond: [{ $eq: ['$isDeleted', true] }, 1, 0] } }
          }
        }
      ]),
      Comment.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            deleted: { $sum: { $cond: [{ $eq: ['$isDeleted', true] }, 1, 0] } }
          }
        }
      ]),
      Playlist.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            deleted: { $sum: { $cond: [{ $eq: ['$isDeleted', true] }, 1, 0] } }
          }
        }
      ])
    ]);

    const stats = {
      videos: videoStats[0] || { total: 0, deleted: 0 },
      posts: postStats[0] || { total: 0, deleted: 0 },
      comments: commentStats[0] || { total: 0, deleted: 0 },
      playlists: playlistStats[0] || { total: 0, deleted: 0 }
    };

    // Calculate totals
    const totalContent = Object.values(stats).reduce((sum, stat) => sum + stat.total, 0);
    const totalDeleted = Object.values(stats).reduce((sum, stat) => sum + stat.deleted, 0);

    return ResponseHandler.success(res, {
      ...stats,
      summary: {
        totalContent,
        totalDeleted,
        totalActive: totalContent - totalDeleted
      }
    }, 'User content statistics retrieved successfully');
  } catch (error) {
    logger.error('Failed to get user content statistics', {
      error: error.message,
      userId: req.user?.id
    });

    return ResponseHandler.error(res, 'INTERNAL_ERROR', 'Failed to retrieve statistics', 500);
  }
});

module.exports = router;