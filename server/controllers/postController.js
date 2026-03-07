const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Report = require("../models/Report");
const { deleteCachePattern } = require("../utils/cache");
const { emitFeedEvent } = require("../socketEmitter");
const { invalidateQueryCache } = require("../utils/queryCache");
const { emitToContentRoom } = require("../socketRegistry");
const { filterMultipleFields } = require("../services/contentFilterService");
const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");

exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    // Run content filter
    const filterResult = filterMultipleFields({ title, content });

    const newPost = new Post({
      title,
      content,
      category,
      postedBy: req.user.id,
      flagged: filterResult.flagged,
      flagReason: filterResult.flagged ? filterResult.reasons.join('; ') : ''
    });
    const savedPost = await newPost.save();

    // Auto-create report if content is flagged
    if (filterResult.flagged) {
      await Report.create({
        reportedBy: req.user.id,
        contentType: 'post',
        contentId: savedPost._id,
        reason: 'spam',
        description: `Auto-flagged: ${filterResult.reasons.join('; ')}`,
        status: 'pending',
        priority: filterResult.severity === 'high' ? 'high' : 'medium',
        contentSnapshot: { title, content, author: req.user.id }
      });
    }

    const populatedPost = await savedPost.populate("postedBy", "username");
    await Promise.all([
      deleteCachePattern("feed:*"),
      invalidateQueryCache("post:*"),
    ]);
    res.status(201).json(savedPost);
  } catch (err) {
    return ResponseHandler.handleError(err, req, res, "Failed to create Post");
  }
}

exports.getAllPosts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.postedBy) filter.postedBy = req.query.postedBy;
    const posts = await Post.find(filter)
      .populate("postedBy", "username _id")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    return ResponseHandler.handleError(err, req, res, "Failed to fetch Post");
  }
}

exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return ResponseHandler.notFound(res, "Post not found");

    const isLiked = post.likes.includes(userId);

    const update = isLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      update,
      { new: true }
    );

    if (!isLiked && post.postedBy.toString() !== userId.toString()) {
      const senderUser = await User.findById(userId).select("username").lean();
      const senderName = senderUser?.username || "Someone";
      const message = `${senderName} liked your post`;
      await Notification.create({
        recipient: post.postedBy,
        sender: userId,
        type: "reaction",
        resource: { resourceType: "post", resourceId: post._id },
        message,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      emitFeedEvent("notification:toast", {
        recipientId: post.postedBy.toString(),
        message,
        type: "reaction",
      });
    }

    await deleteCachePattern("feed:*");

    emitToContentRoom("content:like_toggled", {
      contentId: postId,
      contentType: "post",
      likes: updatedPost.likes.length,
      liked: !isLiked,
      videoId: null,
      postId,
    });

    res.status(200).json({
      likedByUser: !isLiked,
      likesCount: updatedPost.likes.length,
    });

  } catch (err) {
    res.status(500).json({
      message: "Error toggling like",
      error: err.message,
    });
  }
};



const SoftDeleteService = require("../services/softDeleteService");

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    if (!userId) {
      return ResponseHandler.unauthorized(res, "Unauthorized: User not authenticated");
    }

    const post = await Post.findById(postId);
    if (!post) return ResponseHandler.notFound(res, "Post not found");

    if (post.postedBy.toString() !== userId.toString()) {
      return ResponseHandler.forbidden(res, "Not Allowed To Delete");
    }

    // Soft delete the post with enhanced service (includes cascade and audit logging)
    const systemInfo = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      apiVersion: '1.0'
    };

    await SoftDeleteService.softDelete(Post, postId, userId, 'User deleted', { systemInfo });
    
    await Promise.all([
      deleteCachePattern("feed:*"),
      invalidateQueryCache("post:*"),
    ]);
    res.status(200).json({ message: "Post deleted" });

  } catch (err) {
    // Removed console.error - use logger instead
    return ResponseHandler.handleError(err, req, res, "Error deleting post");
  }
}

// Update an existing post (only owner can edit)
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;
    const { title, content, category } = req.body;

    if (!userId) {
      return ResponseHandler.unauthorized(res, "Unauthorized: User not authenticated");
    }

    const post = await Post.findById(postId);
    if (!post) {
      return ResponseHandler.notFound(res, "Post not found");
    }

    if (post.postedBy.toString() !== userId.toString()) {
      return ResponseHandler.forbidden(res, "Not Allowed To Edit");
    }

    if (typeof title === "string") post.title = title;
    if (typeof content === "string") post.content = content;
    if (typeof category === "string") post.category = category;

    const updatedPost = await post.save();
    const populatedPost = await updatedPost.populate("postedBy", "username");
    await Promise.all([
      deleteCachePattern("feed:*"),
      invalidateQueryCache("post:*"),
    ]);

    res.status(200).json({
      message: "Post updated successfully",
      post: populatedPost,
    });
  } catch (err) {
    // Removed console.error - use logger instead
    return ResponseHandler.handleError(err, req, res, "Error updating post");
  }
}
