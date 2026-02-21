const User = require("../models/User");
const Video = require("../models/Video");
const Post = require("../models/Post");
const mongoose = require("mongoose");

const getSaved = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .populate("savedVideos")
      .populate({ path: "savedPosts", populate: { path: "postedBy", select: "username _id" } })
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    const savedVideos = (user.savedVideos || []).filter(Boolean);
    const savedPosts = (user.savedPosts || []).filter(Boolean);
    return res.json({ savedVideos, savedPosts });
  } catch (err) {
    console.error("getSaved error:", err);
    return res.status(500).json({ message: "Failed to fetch saved", error: err.message });
  }
};

const addVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId))
      return res.status(400).json({ message: "Invalid video id" });
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedVideos: videoId } },
      { new: true }
    ).select("savedVideos");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ saved: true, savedVideos: user.savedVideos });
  } catch (err) {
    console.error("addVideo saved error:", err);
    return res.status(500).json({ message: "Failed to save video", error: err.message });
  }
};

const removeVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId))
      return res.status(400).json({ message: "Invalid video id" });
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { savedVideos: videoId } },
      { new: true }
    ).select("savedVideos");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ saved: false, savedVideos: user.savedVideos });
  } catch (err) {
    console.error("removeVideo saved error:", err);
    return res.status(500).json({ message: "Failed to unsave video", error: err.message });
  }
};

const addPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId))
      return res.status(400).json({ message: "Invalid post id" });
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedPosts: postId } },
      { new: true }
    ).select("savedPosts");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ saved: true, savedPosts: user.savedPosts });
  } catch (err) {
    console.error("addPost saved error:", err);
    return res.status(500).json({ message: "Failed to save post", error: err.message });
  }
};

const removePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId))
      return res.status(400).json({ message: "Invalid post id" });
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { savedPosts: postId } },
      { new: true }
    ).select("savedPosts");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ saved: false, savedPosts: user.savedPosts });
  } catch (err) {
    console.error("removePost saved error:", err);
    return res.status(500).json({ message: "Failed to unsave post", error: err.message });
  }
};

module.exports = { getSaved, addVideo, removeVideo, addPost, removePost };
