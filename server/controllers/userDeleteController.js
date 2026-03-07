const Video = require("../models/Video");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Playlist = require("../models/Playlist");
const SoftDeleteService = require("../services/softDeleteService");
const { ResponseHandler } = require("../utils/responseHandler");
const logger = require("../utils/logger");

/**
 * User Soft Delete Controller
 * Handles user-facing soft delete operations
 */

// Get user's deleted content
exports.getUserDeletedContent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            type = 'all', 
            page = 1, 
            limit = 20, 
            sortBy = 'deletedAt',
            sortOrder = -1
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            sortOrder: parseInt(sortOrder)
        };

        let results = {};

        if (type === 'all' || type === 'videos') {
            const videoResults = await SoftDeleteService.getDeleted(Video, {
                ...options,
                deletedBy: userId
            });
            results.videos = videoResults;
        }

        if (type === 'all' || type === 'posts') {
            const postResults = await SoftDeleteService.getDeleted(Post, {
                ...options,
                deletedBy: userId
            });
            results.posts = postResults;
        }

        if (type === 'all' || type === 'comments') {
            const commentResults = await SoftDeleteService.getDeleted(Comment, {
                ...options,
                deletedBy: userId
            });
            results.comments = commentResults;
        }

        if (type === 'all' || type === 'playlists') {
            const playlistResults = await SoftDeleteService.getDeleted(Playlist, {
                ...options,
                deletedBy: userId
            });
            results.playlists = playlistResults;
        }

        return ResponseHandler.success(res, results, 'Deleted content retrieved successfully');
    } catch (error) {
        logger.error('Error fetching user deleted content', {
            userId: req.user.id,
            error: error.message
        });
        return ResponseHandler.handleError(error, req, res, 'Error fetching deleted content');
    }
};

// Restore user's own deleted content
exports.restoreUserContent = async (req, res) => {
    try {
        const { type, id } = req.params;
        const userId = req.user.id;

        let model;
        let ownerField;
        
        switch (type) {
            case 'video':
                model = Video;
                ownerField = 'postedBy';
                break;
            case 'post':
                model = Post;
                ownerField = 'postedBy';
                break;
            case 'comment':
                model = Comment;
                ownerField = 'userId';
                break;
            case 'playlist':
                model = Playlist;
                ownerField = 'userId';
                break;
            default:
                return ResponseHandler.error(res, 'INVALID_TYPE', 'Invalid content type', 400);
        }

        // Find the deleted content and verify ownership
        const content = await model.findOne({ 
            _id: id, 
            isDeleted: true,
            [ownerField]: userId 
        });

        if (!content) {
            return ResponseHandler.notFound(res, 'Deleted content not found or you do not have permission to restore it');
        }

        // Check if content was deleted within restoration window (e.g., 30 days)
        const restorationWindow = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        const deletedAt = new Date(content.deletedAt);
        const now = new Date();
        
        if (now - deletedAt > restorationWindow) {
            return ResponseHandler.error(res, 'RESTORATION_EXPIRED', 'Content restoration period has expired', 400);
        }

        const restoredContent = await SoftDeleteService.restore(model, id, userId);

        logger.info('User restored content', {
            userId,
            contentType: type,
            contentId: id
        });

        return ResponseHandler.success(res, restoredContent, `${type} restored successfully`);
    } catch (error) {
        logger.error('Error restoring user content', {
            userId: req.user.id,
            contentType: req.params.type,
            contentId: req.params.id,
            error: error.message
        });
        return ResponseHandler.handleError(error, req, res, 'Error restoring content');
    }
};

// Get restoration info (time remaining, etc.)
exports.getRestorationInfo = async (req, res) => {
    try {
        const { type, id } = req.params;
        const userId = req.user.id;

        let model;
        let ownerField;
        
        switch (type) {
            case 'video':
                model = Video;
                ownerField = 'postedBy';
                break;
            case 'post':
                model = Post;
                ownerField = 'postedBy';
                break;
            case 'comment':
                model = Comment;
                ownerField = 'userId';
                break;
            case 'playlist':
                model = Playlist;
                ownerField = 'userId';
                break;
            default:
                return ResponseHandler.error(res, 'INVALID_TYPE', 'Invalid content type', 400);
        }

        const content = await model.findOne({ 
            _id: id, 
            isDeleted: true,
            [ownerField]: userId 
        });

        if (!content) {
            return ResponseHandler.notFound(res, 'Deleted content not found');
        }

        const restorationWindow = 30 * 24 * 60 * 60 * 1000; // 30 days
        const deletedAt = new Date(content.deletedAt);
        const expiresAt = new Date(deletedAt.getTime() + restorationWindow);
        const now = new Date();
        const timeRemaining = expiresAt - now;

        const info = {
            id: content._id,
            type,
            title: content.title || content.text || content.name,
            deletedAt: content.deletedAt,
            deleteReason: content.deleteReason,
            expiresAt,
            timeRemaining: Math.max(0, timeRemaining),
            canRestore: timeRemaining > 0,
            daysRemaining: Math.max(0, Math.ceil(timeRemaining / (24 * 60 * 60 * 1000)))
        };

        return ResponseHandler.success(res, info, 'Restoration info retrieved successfully');
    } catch (error) {
        logger.error('Error getting restoration info', {
            userId: req.user.id,
            contentType: req.params.type,
            contentId: req.params.id,
            error: error.message
        });
        return ResponseHandler.handleError(error, req, res, 'Error getting restoration info');
    }
};

// Permanently delete user's own content (after soft delete)
exports.permanentlyDeleteUserContent = async (req, res) => {
    try {
        const { type, id } = req.params;
        const userId = req.user.id;

        let model;
        let ownerField;
        
        switch (type) {
            case 'video':
                model = Video;
                ownerField = 'postedBy';
                break;
            case 'post':
                model = Post;
                ownerField = 'postedBy';
                break;
            case 'comment':
                model = Comment;
                ownerField = 'userId';
                break;
            case 'playlist':
                model = Playlist;
                ownerField = 'userId';
                break;
            default:
                return ResponseHandler.error(res, 'INVALID_TYPE', 'Invalid content type', 400);
        }

        // Find the deleted content and verify ownership
        const content = await model.findOne({ 
            _id: id, 
            isDeleted: true,
            [ownerField]: userId 
        });

        if (!content) {
            return ResponseHandler.notFound(res, 'Deleted content not found or you do not have permission to delete it');
        }

        await SoftDeleteService.permanentDelete(model, id, userId);

        logger.info('User permanently deleted content', {
            userId,
            contentType: type,
            contentId: id
        });

        return ResponseHandler.success(res, null, `${type} permanently deleted`);
    } catch (error) {
        logger.error('Error permanently deleting user content', {
            userId: req.user.id,
            contentType: req.params.type,
            contentId: req.params.id,
            error: error.message
        });
        return ResponseHandler.handleError(error, req, res, 'Error permanently deleting content');
    }
};