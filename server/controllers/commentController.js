const Comment = require("../models/Comment");
const mongoose = require("mongoose");
const Video = require("../models/Video");
const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { emitFeedEvent } = require("../socketEmitter");
const Report = require("../models/Report");
const { trackLike, trackView, trackComment } = require("./analyticsController");
const { getNestedComments } = require("../services/optimizedCommentService");
const { invalidateQueryCache } = require("../utils/queryCache");
const { emitToContentRoom } = require("../socketRegistry");
const { filterContent } = require("../services/contentFilterService");
const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");

async function createCommentNotification({ recipientId, senderId, type, resource, message }) {
  if (!recipientId || recipientId.toString() === senderId.toString()) return;
  try {
    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      resource,
      message,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    emitFeedEvent("notification:toast", {
      recipientId: recipientId.toString(),
      message,
      type,
    });
  } catch (e) {
    // Removed console.error - use logger instead
  }
}

exports.createComment = ResponseHandler.asyncHandler(async (req, res) => {
  const { videoId, postId, text, parentId } = req.body;
  const userId = req.user.id;

  let targetVideoId = videoId;
  let targetPostId = postId;

  if (!targetVideoId && !targetPostId && parentId) {
    logger.debug('Inheriting target from parent comment', { parentId });
    const parentComment = await Comment.findById(parentId);
    if (parentComment) {
      targetVideoId = parentComment.videoId;
      targetPostId = parentComment.postId;
    }
  }

  if (!text || (!targetVideoId && !targetPostId)) {
    logger.warn('Comment creation failed - missing required fields', {
      userId,
      hasText: !!text,
      hasVideoId: !!targetVideoId,
      hasPostId: !!targetPostId
    });
    return ResponseHandler.error(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      'Comment text and target (video or post) are required',
      400
    );
  }

  // Run content filter on comment text
  const filterResult = filterContent(text);

  const commentData = {
    text,
    userId: new mongoose.Types.ObjectId(userId),
    parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
    videoId: targetVideoId ? new mongoose.Types.ObjectId(targetVideoId) : null,
    postId: targetPostId ? new mongoose.Types.ObjectId(targetPostId) : null,
    flagged: filterResult.flagged,
    flagReason: filterResult.flagged ? filterResult.reasons.join('; ') : ''
  };

  const newComment = new Comment(commentData);
  const saved = await newComment.save();

  // Auto-create report if comment is flagged
  if (filterResult.flagged) {
    logger.warn('Comment auto-flagged for inappropriate content', {
      commentId: saved._id,
      userId,
      reasons: filterResult.reasons,
      severity: filterResult.severity
    });

    await Report.create({
      reportedBy: userId,
      contentType: 'comment',
      contentId: saved._id,
      reason: 'spam',
      description: `Auto-flagged: ${filterResult.reasons.join('; ')}`,
      status: 'pending',
      priority: filterResult.severity === 'high' ? 'high' : 'medium',
      contentSnapshot: { content: text, author: userId }
    });
  }

  await saved.populate("userId", "username");

  await invalidateQueryCache([
    `comments:nested:*`,
    `comments:stats:*`,
    `comments:top:*`,
  ]);

  if (targetVideoId) {
    trackComment(targetVideoId.toString()).catch(() => { });
  }

  const senderUser = await User.findById(userId).select("username").lean();
  const senderName = senderUser?.username || "Someone";

  // Handle notifications
  if (parentId) {
    const parentComment = await Comment.findById(parentId).select("userId").lean();
    if (parentComment && parentComment.userId) {
      await createCommentNotification({
        recipientId: parentComment.userId,
        senderId: userId,
        type: "comment_reply",
        resource: {
          resourceType: "comment",
          resourceId: saved._id,
          parentId: parentId,
        },
        message: `${senderName} replied to your comment`,
      });
    }
  } else {
    if (targetVideoId) {
      const video = await Video.findById(targetVideoId).select("postedBy").lean();
      if (video && video.postedBy) {
        await createCommentNotification({
          recipientId: video.postedBy,
          senderId: userId,
          type: "video_comment",
          resource: { resourceType: "video", resourceId: targetVideoId },
          message: `${senderName} commented on your video`,
        });
      }
    }
    if (targetPostId) {
      const post = await Post.findById(targetPostId).select("postedBy").lean();
      if (post && post.postedBy) {
        const recipientId = post.postedBy._id || post.postedBy;
        if (recipientId.toString() !== userId.toString()) {
          await createCommentNotification({
            recipientId,
            senderId: userId,
            type: "post_comment",
            resource: { resourceType: "post", resourceId: targetPostId },
            message: `${senderName} commented on your post`,
          });
        }
      }
    }
  }

  const responseComment = {
    _id: saved._id,
    author: saved.userId?.username || "Anonymous",
    content: saved.text,
    createdAt: saved.createdAt,
    parentId: saved.parentId,
    replies: [],
    likes: saved.likes || [],
    videoId: saved.videoId,
    postId: saved.postId,
  };

  const contentIdForSocket = (targetVideoId || targetPostId || "").toString();

  if (contentIdForSocket) {
    emitToContentRoom("comment:new", {
      comment: responseComment,
      contentId: contentIdForSocket,
      contentType: targetVideoId ? "video" : "post",
      videoId: targetVideoId ? contentIdForSocket : null,
      postId: targetPostId ? contentIdForSocket : null,
    });
  }

  logger.info('Comment created successfully', {
    commentId: saved._id,
    userId,
    contentType: targetVideoId ? 'video' : 'post',
    contentId: contentIdForSocket,
    flagged: saved.flagged
  });

  return ResponseHandler.success(res, responseComment, 'Comment created successfully', 201);
});

exports.getAllComments = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    // Removed console.log - use logger instead

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid videoId format" });
    }

    const comments = await getNestedComments(videoId, null);
    // Removed console.log - use logger instead

    res.json(comments);
  } catch (err) {
    // Removed console.error - use logger instead
    return ResponseHandler.handleError(err, req, res, "Error fetching comments");
  }
};

exports.getAllPostComments = async (req, res) => {
  const postId = req.params.postId;

  try {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid postId format" });
    }

    const comments = await getNestedComments(null, postId);
    res.json(comments);
  } catch (err) {
    // Removed console.error - use logger instead
    return ResponseHandler.handleError(err, req, res, "Error fetching post comments");
  }
};

exports.likeVideo = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const video = await Video.findById(id);
    if (!video) return ResponseHandler.notFound(res, "Video");

    const isLiked = video.likes.includes(userId);
    const update = isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };

    const updatedVideo = await Video.findByIdAndUpdate(id, update, { new: true });

    trackLike(id, userId, !isLiked).catch(() => { });

    emitToContentRoom("content:like_toggled", {
      contentId: id,
      contentType: "video",
      likes: updatedVideo.likes.length,
      liked: !isLiked,
      videoId: id,
      postId: null,
    });

    res.json({ likes: updatedVideo.likes.length, liked: !isLiked });
  } catch (err) {
    return ResponseHandler.handleError(err, req, res, "Error liking video");
  }
}

exports.viewVideo = async (req, res) => {
  const { id } = req.params;
  try {
    const video = await Video.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
    if (!video) return ResponseHandler.notFound(res, "Video");

    trackView(id, req).catch(() => { });

    res.json({ views: video.views })

  } catch (err) {
    return ResponseHandler.handleError(err, req, res, "Error incrementing view");
  }
}

exports.getSingleVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return ResponseHandler.notFound(res, "Video not found");
    }

    const currentUserId = req.user?.id || null;

    res.json({
      likes: video.likes || [],
      views: video.views || 0,
      currentUserId: currentUserId
    });
  } catch (err) {
    // Removed console.error - use logger instead
    return ResponseHandler.handleError(err, req, res, "Error fetching video");
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return ResponseHandler.notFound(res, "Comment not found");

    if (comment.userId.toString() !== userId) {
      return ResponseHandler.forbidden(res, "Unauthorized - You can only delete your own comments");
    }

    const { videoId, postId } = comment;

    await Comment.findByIdAndDelete(commentId);

    await invalidateQueryCache([
      `comments:nested:*`,
      `comments:stats:*`,
      `comments:top:*`,
    ]);

    if (videoId || postId) {
      emitToContentRoom("comment:deleted", {
        commentId,
        videoId: videoId ? videoId.toString() : null,
        postId: postId ? postId.toString() : null,
      });
    }

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    // Removed console.error - use logger instead
    return ResponseHandler.handleError(err, req, res, "Server error");
  }
};

exports.toggleLikeComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment)
      return ResponseHandler.notFound(res, "Comment not found");

    const isLiked = comment.likes.includes(userId);

    const update = isLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      update,
      { new: true }
    );

    if (
      !isLiked &&
      comment.userId.toString() !== userId.toString()
    ) {
      await Notification.create({
        recipient: comment.userId,
        sender: userId,
        type: "reaction",
        resource: {
          resourceType: "comment",
          resourceId: comment._id,
          parentId: comment.parentId || undefined,
        },
        message: "Someone reacted to your comment",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      emitFeedEvent("notification:toast", {
        recipientId: comment.userId.toString(),
        message: "Someone reacted to your comment",
        type: "reaction",
      });
    }

    res.status(200).json({
      likes: updatedComment.likes.length,
      liked: !isLiked,
    });

  } catch (err) {
    // Removed console.error - use logger instead
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
