const Post = require("../models/Post");
const Video = require("../models/Video");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Report = require("../models/Report");
const ModerationLog = require("../models/ModerationLog");
const Appeal = require("../models/Appeal");
const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");

// Get all flagged posts
exports.getFlaggedPosts = async (req, res) => {
    try {
        const posts = await Post.find({ flagged: true })
            .populate('postedBy', 'username email')
            .populate('flaggedBy', 'username')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching flagged posts", error: error.message });
    }
};

// Get all flagged videos
exports.getFlaggedVideos = async (req, res) => {
    try {
        const videos = await Video.find({ flagged: true })
            .populate('postedBy', 'username email')
            .populate('flaggedBy', 'username')
            .sort({ createdAt: -1 });

        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: "Error fetching flagged videos", error: error.message });
    }
};

// Get all flagged comments
exports.getFlaggedComments = async (req, res) => {
    try {
        const comments = await Comment.find({ flagged: true })
            .populate('userId', 'username email')
            .populate('flaggedBy', 'username')
            .populate('videoId', 'title')
            .populate('postId', 'title')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching flagged comments", error: error.message });
    }
};

// Flag a post
exports.flagPost = async (req, res) => {
    try {
        const { postId, reason } = req.body;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) {
            return ResponseHandler.notFound(res, "Post not found");
        }

        if (!post.flaggedBy.includes(userId)) {
            post.flaggedBy.push(userId);
        }
        post.flagged = true;
        post.flagReason = reason || post.flagReason;

        await post.save();
        res.json({ message: "Post flagged successfully", post });
    } catch (error) {
        res.status(500).json({ message: "Error flagging post", error: error.message });
    }
};

// Flag a video
exports.flagVideo = async (req, res) => {
    try {
        const { videoId, reason } = req.body;
        const userId = req.user.id;

        const video = await Video.findById(videoId);
        if (!video) {
            return ResponseHandler.notFound(res, "Video not found");
        }

        if (!video.flaggedBy.includes(userId)) {
            video.flaggedBy.push(userId);
        }
        video.flagged = true;
        video.flagReason = reason || video.flagReason;

        await video.save();
        res.json({ message: "Video flagged successfully", video });
    } catch (error) {
        res.status(500).json({ message: "Error flagging video", error: error.message });
    }
};

// Flag a comment
exports.flagComment = async (req, res) => {
    try {
        const { commentId, reason } = req.body;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return ResponseHandler.notFound(res, "Comment not found");
        }

        if (!comment.flaggedBy.includes(userId)) {
            comment.flaggedBy.push(userId);
        }
        comment.flagged = true;
        comment.flagReason = reason || comment.flagReason;

        await comment.save();
        res.json({ message: "Comment flagged successfully", comment });
    } catch (error) {
        res.status(500).json({ message: "Error flagging comment", error: error.message });
    }
};

// Delete a post (admin only) - soft delete
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { permanent = false, reason = 'Admin deleted' } = req.body;

        const post = await Post.findById(id);
        if (!post) {
            return ResponseHandler.notFound(res, "Post not found");
        }

        if (permanent) {
            // Permanent delete - also permanently delete associated comments
            await Comment.deleteMany({ postId: id });
            await Post.findByIdAndDelete(id);
            res.json({ message: "Post permanently deleted" });
        } else {
            // Soft delete - also soft delete associated comments
            await post.softDelete(req.user.id, reason);
            await Comment.updateMany(
                { postId: id, isDeleted: { $ne: true } },
                { 
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedBy: req.user.id,
                    deleteReason: 'Parent post deleted by admin'
                }
            );
            res.json({ message: "Post deleted successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error: error.message });
    }
};

// Delete a video (admin only) - soft delete
exports.deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { permanent = false, reason = 'Admin deleted' } = req.body;

        const video = await Video.findById(id);
        if (!video) {
            return ResponseHandler.notFound(res, "Video not found");
        }

        if (permanent) {
            // Permanent delete - also permanently delete associated comments
            await Comment.deleteMany({ videoId: id });
            await Video.findByIdAndDelete(id);
            res.json({ message: "Video permanently deleted" });
        } else {
            // Soft delete - also soft delete associated comments
            await video.softDelete(req.user.id, reason);
            await Comment.updateMany(
                { videoId: id, isDeleted: { $ne: true } },
                { 
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedBy: req.user.id,
                    deleteReason: 'Parent video deleted by admin'
                }
            );
            res.json({ message: "Video deleted successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting video", error: error.message });
    }
};

// Delete a comment (admin only) - soft delete
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { permanent = false, reason = 'Admin deleted' } = req.body;

        const comment = await Comment.findById(id);
        if (!comment) {
            return ResponseHandler.notFound(res, "Comment not found");
        }

        if (permanent) {
            await Comment.findByIdAndDelete(id);
            res.json({ message: "Comment permanently deleted" });
        } else {
            await comment.softDelete(req.user.id, reason);
            res.json({ message: "Comment deleted successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting comment", error: error.message });
    }
};

// Dismiss flag (remove flag status)
exports.dismissFlag = async (req, res) => {
    try {
        const { type, id } = req.body;

        let item;
        if (type === 'post') {
            item = await Post.findById(id);
        } else if (type === 'video') {
            item = await Video.findById(id);
        } else if (type === 'comment') {
            item = await Comment.findById(id);
        }

        if (!item) {
            return res.status(404).json({ message: `${type} not found` });
        }

        item.flagged = false;
        item.flaggedBy = [];
        item.flagReason = "";
        await item.save();

        res.json({ message: "Flag dismissed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error dismissing flag", error: error.message });
    }
};

// Get admin statistics (enhanced)
exports.getAdminStats = async (req, res) => {
    try {
        const [
            flaggedPostsCount,
            flaggedVideosCount,
            flaggedCommentsCount,
            totalUsers,
            totalPosts,
            totalVideos,
            pendingReports,
            pendingAppeals,
            bannedUsers
        ] = await Promise.all([
            Post.countDocuments({ flagged: true }),
            Video.countDocuments({ flagged: true }),
            Comment.countDocuments({ flagged: true }),
            User.countDocuments(),
            Post.countDocuments(),
            Video.countDocuments(),
            Report.countDocuments({ status: "pending" }),
            Appeal.countDocuments({ status: "pending" }),
            User.countDocuments({ isBanned: true })
        ]);

        res.json({
            flaggedPosts: flaggedPostsCount,
            flaggedVideos: flaggedVideosCount,
            flaggedComments: flaggedCommentsCount,
            totalUsers,
            totalPosts,
            totalVideos,
            pendingReports,
            pendingAppeals,
            bannedUsers
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching admin stats", error: error.message });
    }
};

// Check if user is admin
exports.checkAdminStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            isAdmin: user.isAdmin || user.role === 'admin' || false,
            role: user.role || 'user'
        });
    } catch (error) {
        res.status(500).json({ message: "Error checking admin status", error: error.message });
    }
};

// ─── User Management ─────────────────────────────────────────────────────────

// Get all users (paginated)
exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, filter } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (filter === 'banned') query.isBanned = true;
        if (filter === 'warned') query['warnings.0'] = { $exists: true };

        const [users, total] = await Promise.all([
            User.find(query)
                .select('username email role isAdmin isBanned banReason bannedAt bannedUntil suspensionCount warnings createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            User.countDocuments(query)
        ]);

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

// Ban a user
exports.banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, duration } = req.body; // duration in days, null = permanent
        const adminId = req.user.id;

        if (id === adminId) {
            return res.status(400).json({ message: "You cannot ban yourself" });
        }

        const user = await User.findById(id);
        if (!user) {
            return ResponseHandler.notFound(res, "User not found");
        }

        if (user.isAdmin || user.role === 'admin') {
            return ResponseHandler.forbidden(res, "Cannot ban an admin user");
        }

        user.isBanned = true;
        user.banReason = reason || "Policy violation";
        user.bannedAt = new Date();
        user.bannedUntil = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
        user.suspensionCount = (user.suspensionCount || 0) + 1;
        await user.save();

        // Log the action
        await ModerationLog.create({
            moderator: adminId,
            action: duration ? "suspend" : "ban",
            targetType: "user",
            targetId: id,
            reason: reason || "Policy violation",
            details: {
                duration: duration ? `${duration} days` : "permanent",
                username: user.username
            }
        });

        const banType = duration ? `suspended for ${duration} days` : "permanently banned";
        res.json({ message: `User ${user.username} has been ${banType}` });
    } catch (error) {
        res.status(500).json({ message: "Error banning user", error: error.message });
    }
};

// Unban a user
exports.unbanUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        const user = await User.findById(id);
        if (!user) {
            return ResponseHandler.notFound(res, "User not found");
        }

        user.isBanned = false;
        user.banReason = "";
        user.bannedAt = null;
        user.bannedUntil = null;
        await user.save();

        await ModerationLog.create({
            moderator: adminId,
            action: "unban",
            targetType: "user",
            targetId: id,
            reason: "Admin unbanned user",
            details: { username: user.username }
        });

        res.json({ message: `User ${user.username} has been unbanned` });
    } catch (error) {
        res.status(500).json({ message: "Error unbanning user", error: error.message });
    }
};

// Warn a user
exports.warnUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const user = await User.findById(id);
        if (!user) {
            return ResponseHandler.notFound(res, "User not found");
        }

        user.warnings.push({
            reason: reason || "Policy violation",
            issuedBy: adminId,
            issuedAt: new Date()
        });
        await user.save();

        await ModerationLog.create({
            moderator: adminId,
            action: "warn",
            targetType: "user",
            targetId: id,
            reason: reason || "Policy violation",
            details: { username: user.username, totalWarnings: user.warnings.length }
        });

        res.json({ message: `Warning issued to ${user.username}. Total warnings: ${user.warnings.length}` });
    } catch (error) {
        res.status(500).json({ message: "Error warning user", error: error.message });
    }
};

// Get soft deleted content (admin only)
exports.getDeletedContent = async (req, res) => {
    try {
        const { 
            type = 'all', 
            page = 1, 
            limit = 20, 
            sortBy = 'deletedAt',
            sortOrder = -1,
            deletedBy = null,
            dateFrom = null,
            dateTo = null
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            sortOrder: parseInt(sortOrder),
            deletedBy,
            dateFrom,
            dateTo
        };

        let results = {};

        if (type === 'all' || type === 'videos') {
            const SoftDeleteService = require("../services/softDeleteService");
            const videoResults = await SoftDeleteService.getDeleted(Video, options);
            results.videos = videoResults;
        }

        if (type === 'all' || type === 'posts') {
            const SoftDeleteService = require("../services/softDeleteService");
            const postResults = await SoftDeleteService.getDeleted(Post, options);
            results.posts = postResults;
        }

        if (type === 'all' || type === 'comments') {
            const SoftDeleteService = require("../services/softDeleteService");
            const commentResults = await SoftDeleteService.getDeleted(Comment, options);
            results.comments = commentResults;
        }

        if (type === 'all' || type === 'playlists') {
            const SoftDeleteService = require("../services/softDeleteService");
            const playlistResults = await SoftDeleteService.getDeleted(Playlist, options);
            results.playlists = playlistResults;
        }

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching deleted content", 
            error: error.message 
        });
    }
};

// Restore soft deleted content (admin only)
exports.restoreContent = async (req, res) => {
    try {
        const { type, id } = req.params;
        const adminId = req.user.id;

        let model;
        switch (type) {
            case 'video':
                model = Video;
                break;
            case 'post':
                model = Post;
                break;
            case 'comment':
                model = Comment;
                break;
            case 'playlist':
                model = Playlist;
                break;
            default:
                return res.status(400).json({ 
                    success: false,
                    message: "Invalid content type" 
                });
        }

        const SoftDeleteService = require("../services/softDeleteService");
        const restoredContent = await SoftDeleteService.restore(model, id, adminId);

        res.json({
            success: true,
            message: `${type} restored successfully`,
            data: restoredContent
        });
    } catch (error) {
        if (error.message === 'Document not found') {
            return res.status(404).json({ 
                success: false,
                message: "Content not found" 
            });
        }
        res.status(500).json({ 
            success: false,
            message: "Error restoring content", 
            error: error.message 
        });
    }
};

// Permanently delete soft deleted content (admin only)
exports.permanentlyDeleteContent = async (req, res) => {
    try {
        const { type, id } = req.params;
        const adminId = req.user.id;

        let model;
        switch (type) {
            case 'video':
                model = Video;
                break;
            case 'post':
                model = Post;
                break;
            case 'comment':
                model = Comment;
                break;
            case 'playlist':
                model = Playlist;
                break;
            default:
                return res.status(400).json({ 
                    success: false,
                    message: "Invalid content type" 
                });
        }

        const SoftDeleteService = require("../services/softDeleteService");
        const deletedContent = await SoftDeleteService.permanentDelete(model, id, adminId);

        // If it's a video or post, also permanently delete associated comments
        if (type === 'video') {
            await Comment.deleteMany({ videoId: id });
        } else if (type === 'post') {
            await Comment.deleteMany({ postId: id });
        }

        res.json({
            success: true,
            message: `${type} permanently deleted`,
            data: deletedContent
        });
    } catch (error) {
        if (error.message === 'Document not found') {
            return res.status(404).json({ 
                success: false,
                message: "Content not found" 
            });
        }
        res.status(500).json({ 
            success: false,
            message: "Error permanently deleting content", 
            error: error.message 
        });
    }
};

// Bulk restore soft deleted content (admin only)
exports.bulkRestoreContent = async (req, res) => {
    try {
        const { items } = req.body; // Array of { type, id }
        const adminId = req.user.id;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: "Items array is required" 
            });
        }

        const results = [];
        const SoftDeleteService = require("../services/softDeleteService");

        for (const item of items) {
            try {
                let model;
                switch (item.type) {
                    case 'video':
                        model = Video;
                        break;
                    case 'post':
                        model = Post;
                        break;
                    case 'comment':
                        model = Comment;
                        break;
                    case 'playlist':
                        model = Playlist;
                        break;
                    default:
                        results.push({
                            id: item.id,
                            type: item.type,
                            success: false,
                            error: 'Invalid content type'
                        });
                        continue;
                }

                await SoftDeleteService.restore(model, item.id, adminId);
                results.push({
                    id: item.id,
                    type: item.type,
                    success: true
                });
            } catch (error) {
                results.push({
                    id: item.id,
                    type: item.type,
                    success: false,
                    error: error.message
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        res.json({
            success: true,
            message: `Bulk restore completed: ${successCount} successful, ${failureCount} failed`,
            results
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error in bulk restore", 
            error: error.message 
        });
    }
};

// Clean up old soft deleted content (admin only)
exports.cleanupDeletedContent = async (req, res) => {
    try {
        const { retentionDays = 30 } = req.body;
        const SoftDeleteService = require("../services/softDeleteService");

        const results = await Promise.all([
            SoftDeleteService.cleanup(Video, retentionDays),
            SoftDeleteService.cleanup(Post, retentionDays),
            SoftDeleteService.cleanup(Comment, retentionDays),
            SoftDeleteService.cleanup(Playlist, retentionDays)
        ]);

        const totalCleaned = results.reduce((sum, count) => sum + count, 0);

        res.json({
            success: true,
            message: `Cleanup completed: ${totalCleaned} items permanently deleted`,
            details: {
                videos: results[0],
                posts: results[1],
                comments: results[2],
                playlists: results[3]
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error in cleanup", 
            error: error.message 
        });
    }
};