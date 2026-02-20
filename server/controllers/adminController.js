const Post = require("../models/Post");
const Video = require("../models/Video");
const Comment = require("../models/Comment");
const User = require("../models/User");

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
            return res.status(404).json({ message: "Post not found" });
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
            return res.status(404).json({ message: "Video not found" });
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
            return res.status(404).json({ message: "Comment not found" });
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

// Delete a post (admin only)
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        
        const post = await Post.findByIdAndDelete(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Also delete associated comments
        await Comment.deleteMany({ postId: id });

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error: error.message });
    }
};

// Delete a video (admin only)
exports.deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;
        
        const video = await Video.findByIdAndDelete(id);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        // Also delete associated comments
        await Comment.deleteMany({ videoId: id });

        res.json({ message: "Video deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting video", error: error.message });
    }
};

// Delete a comment (admin only)
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const comment = await Comment.findByIdAndDelete(id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        res.json({ message: "Comment deleted successfully" });
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

// Get admin statistics
exports.getAdminStats = async (req, res) => {
    try {
        const flaggedPostsCount = await Post.countDocuments({ flagged: true });
        const flaggedVideosCount = await Video.countDocuments({ flagged: true });
        const flaggedCommentsCount = await Comment.countDocuments({ flagged: true });
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const totalVideos = await Video.countDocuments();

        res.json({
            flaggedPosts: flaggedPostsCount,
            flaggedVideos: flaggedVideosCount,
            flaggedComments: flaggedCommentsCount,
            totalUsers,
            totalPosts,
            totalVideos
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching admin stats", error: error.message });
    }
};

// Check if user is admin
exports.checkAdminStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ isAdmin: user.isAdmin || false });
    } catch (error) {
        res.status(500).json({ message: "Error checking admin status", error: error.message });
    }
};
