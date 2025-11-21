const Comment = require("../models/Comment");
const mongoose = require("mongoose");
const Video = require("../models/Video");

// Create a comment or reply
exports.createComment = async (req, res) => {
  const { videoId, postId, text, parentId } = req.body;
  const userId = req.user.id;

  console.log("🟡 Incoming Comment:", { text, videoId, postId, parentId, userId });

  try {
    if (!text || (!videoId && !postId)) {
      console.warn("⚠️ Missing text or target (videoId/postId)");
      return res.status(400).json({ message: "Missing content or target (videoId/postId)" });
    }

    const commentData = {
      text,
      userId: new mongoose.Types.ObjectId(userId),
      parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
    };

    // Validate and assign videoId if present
    if (videoId) {
      if (!mongoose.Types.ObjectId.isValid(videoId)) {
        console.error("❌ Invalid videoId:", videoId);
        return res.status(400).json({ message: "Invalid videoId" });
      }
      commentData.videoId = new mongoose.Types.ObjectId(videoId);
    }

    // Validate and assign postId if present
    if (postId) {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        console.error("❌ Invalid postId:", postId);
        return res.status(400).json({ message: "Invalid postId" });
      }
      commentData.postId = new mongoose.Types.ObjectId(postId);
    }

    console.log("🛠 Final commentData to be saved:", commentData);

    const newComment = new Comment(commentData);
    const saved = await newComment.save();

    console.log("✅ Saved Comment:", saved);

    await saved.populate("userId", "username");

    res.status(201).json({
      _id: saved._id,
      author: saved.userId.username,
      content: saved.text,
      createdAt: saved.createdAt,
      parentId: saved.parentId,
      replies: [],
      targetId: saved.videoId?.toString() || saved.postId?.toString(),
    });
  } catch (err) {
    console.error("🔥 Error creating comment:", err);
    res.status(500).json({ message: "Error creating comment", error: err.message });
  }
};



// Get all comments for a specific video
exports.getAllComments = async (req, res) => {
  try {
    const videoId = req.params.videoId;
     console.log("Fetching comments for videoId:", videoId); 

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid videoId format" });
    }

    const comments = await Comment.find({ videoId: new mongoose.Types.ObjectId(videoId) })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .lean();
       console.log("Returning comments:", comments);

    const formatted = comments.map(comment => ({
      id: comment._id,
      author: comment.userId?.username || 'Anonymous',
      content: comment.text,
      timestamp: comment.createdAt,
      parentId: comment.parentId?.toString() || null,
      videoId: comment.videoId?.toString(), 
      replies: [],
      likes: comment.likes || [],

    }));

    // nest replies
    const commentMap = {};
    formatted.forEach(c => commentMap[c.id] = c);

    const topLevel = [];
    formatted.forEach(c => {
      if (c.parentId && commentMap[c.parentId]) {
        commentMap[c.parentId].replies.push(c);
      } else {
        topLevel.push(c);
      }
    });

    console.log("Returning comments:", topLevel);
    res.json(topLevel);
  } catch (err) {
    console.error("Failed to fetch comments:", err);
    res.status(500).json({ message: "Error fetching comments", error: err.message });
  }
};

exports.getAllPostComments = async (req, res) => {
  const postId = req.params.postId;

  try {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid postId format" });
    }

    const comments = await Comment.find({ postId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = comments.map(comment => ({
      id: comment._id,
      author: comment.userId?.username || 'Anonymous',
      content: comment.text,
      timestamp: comment.createdAt,
      parentId: comment.parentId?.toString() || null,
      postId: comment.postId?.toString(),
      replies: [],
       likes: comment.likes || [],
    }));

    const commentMap = {};
    formatted.forEach(c => commentMap[c.id] = c);

    const topLevel = [];
    formatted.forEach(c => {
      if (c.parentId && commentMap[c.parentId]) {
        commentMap[c.parentId].replies.push(c);
      } else {
        topLevel.push(c);
      }
    });

    res.json(topLevel);
  } catch (err) {
    console.error("Failed to fetch post comments:", err);
    res.status(500).json({ message: "Error fetching post comments", error: err.message });
  }
};


exports.likeVideo = async(req,res)=>{
  const {id} = req.params;
  const userId = req.user.id;
  try{
    const video =await Video.findById(id);
    if(!video) return res.status(404).json({message:"Video not Found"})
    const likedindex = video.likes.indexOf(userId)
    if(likedindex==-1){
      video.likes.push(userId);
    }else{
      video.likes.splice(likedindex,1)
    }
    await video.save();
    res.json({likes:video.likes.length,liked:likedindex===-1});
  }catch(err){
    res.status(500).json({ message: "Error liking video", error: err.message });
  }
}

exports.viewVideo = async(req,res)=>{
  const {id} = req.params;
  try{
    const video = await Video.findById(id)
    if(!video) return res.status(404).json({message:"Video Not Found"})
    video.views += 1;
    await video.save();
    res.json({views:video.views})
    
  }catch(err){
    res.status(500).json({ message: "Error incrementing view", error: err.message });
  }
}

exports.getSingleVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Optional: If using verifyToken middleware, req.user will be available
    const currentUserId = req.user?.id || null;

    res.json({
      likes: video.likes ||[],
      views: video.views || 0,
      currentUserId: currentUserId
    });
  } catch (err) {
    console.error("Error fetching video:", err);
    res.status(500).json({ message: "Error fetching video", error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Only the comment's author can delete (fixed: using userId instead of author)
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized - You can only delete your own comments" });
    }

    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.toggleLikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const userId = req.user.id; // from verifyToken middleware

    const alreadyLiked = comment.likes.includes(userId);
    if (alreadyLiked) {
      comment.likes = comment.likes.filter(id => id !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.status(200).json({ likes: comment.likes.length, liked: !alreadyLiked });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

