const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Report = require("../models/Report");
const { deleteCachePattern } = require("../utils/cache");
const { emitFeedEvent } = require("../socketEmitter");
const { invalidateQueryCache } = require("../utils/queryCache");
const { emitToContentRoom } = require("../socketRegistry");
const { filterMultipleFields } = require("../services/contentFilterService");

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
    res.status(500).json({ message: "Failed to create Post", error: err.message })
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
    res.status(500).json({ message: "Failed to fetch Post", error: err.message });
  }
}

exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

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



exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not Allowed To Delete" });
    }

    await Post.findByIdAndDelete(postId);
    await Promise.all([
      deleteCachePattern("feed:*"),
      invalidateQueryCache("post:*"),
    ]);
    res.status(200).json({ message: "Post deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting post", error: err.message });
  }
}

// Update an existing post (only owner can edit)
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;
    const { title, content, category } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not Allowed To Edit" });
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
    console.error(err);
    res.status(500).json({ message: "Error updating post", error: err.message });
  }
}
