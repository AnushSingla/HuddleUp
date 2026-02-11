const Post = require("../models/Post")
exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const newPost = new Post({
      title,
      content,
      category,
      postedBy: req.user.id
    });
    const savedPost = await newPost.save();
    const populatedPost = await savedPost.populate("postedBy", "username");
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: "Failed to create Post", error: err.message })
  }
}

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("postedBy", "username")
      .sort({ createdAt: -1 })
      .limit(50); // Limit to reduce lag
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch Post", error: err.message })
  }
}


exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLiked = post.likes.includes(userId);
    const update = isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(postId, update, { new: true });

    res.status(200).json({
      likedByUser: !isLiked,
      likesCount: updatedPost.likes.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Error toggling like", error: err.message });
  }
}

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

    res.status(200).json({
      message: "Post updated successfully",
      post: populatedPost,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating post", error: err.message });
  }
}