const User = require("../models/User");
const Video = require("../models/Video");
const Post = require("../models/Post");
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");

const getSaved = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .populate("savedVideos")
      .populate({ path: "savedPosts", populate: { path: "postedBy", select: "username _id" } })
      .lean();
    if (!user) return ResponseHandler.notFound(res, "User not found");
    const savedVideos = (user.savedVideos || []).filter(Boolean);
    const savedPosts = (user.savedPosts || []).filter(Boolean);
    return res.json({ savedVideos, savedPosts });
  } catch (err) {
    // Removed console.error - use logger instead
    return ResponseHandler.handleError(err, req, res, "Failed to fetch saved");
  }
};

const addVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId))
      return ResponseHandler.error(res, ERROR_CODES.INVALID_INPUT, "Invalid video ID format", 400);
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedVideos: videoId } },
      { new: true }
    ).select("savedVideos");
    if (!user) return ResponseHandler.notFound(res, "User");
    return res.json({ saved: true, savedVideos: user.savedVideos });
  } catch (err) {
    return ResponseHandler.handleError(err, req, res, "Failed to save video");
  }
};

const removeVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId))
      return ResponseHandler.error(res, ERROR_CODES.INVALID_INPUT, "Invalid video ID format", 400);
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { savedVideos: videoId } },
      { new: true }
    ).select("savedVideos");
    if (!user) return ResponseHandler.notFound(res, "User");
    return res.json({ saved: false, savedVideos: user.savedVideos });
  } catch (err) {
    return ResponseHandler.handleError(err, req, res, "Failed to unsave video");
  }
};

const addPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId))
      return ResponseHandler.error(res, ERROR_CODES.INVALID_INPUT, "Invalid post ID format", 400);
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedPosts: postId } },
      { new: true }
    ).select("savedPosts");
    if (!user) return ResponseHandler.notFound(res, "User");
    return res.json({ saved: true, savedPosts: user.savedPosts });
  } catch (err) {
    return ResponseHandler.handleError(err, req, res, "Failed to save post");
  }
};

const removePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId))
      return ResponseHandler.error(res, ERROR_CODES.INVALID_INPUT, "Invalid post ID format", 400);
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { savedPosts: postId } },
      { new: true }
    ).select("savedPosts");
    if (!user) return ResponseHandler.notFound(res, "User");
    return res.json({ saved: false, savedPosts: user.savedPosts });
  } catch (err) {
    return ResponseHandler.handleError(err, req, res, "Failed to unsave post");
  }
};

module.exports = { getSaved, addVideo, removeVideo, addPost, removePost };
