const User = require("../models/User");
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");

// Get public profile by userId or username (no auth required)
exports.getPublicProfile = async (req, res) => {
  try {
    const raw = req.params.identifier;
    const identifier = typeof raw === "string" ? raw.trim() : raw;
    if (!identifier) {
      return res.status(400).json({ message: "User identifier required" });
    }

    let user;
    if (mongoose.Types.ObjectId.isValid(identifier) && String(new mongoose.Types.ObjectId(identifier)) === identifier) {
      user = await User.findById(identifier).select("username _id").lean();
    } else {
      user = await User.findOne({ username: identifier }).select("username _id").lean();
    }

    if (!user) {
      return ResponseHandler.notFound(res, "User not found");
    }

    res.json({ user: { _id: user._id, username: user.username } });
  } catch (err) {
    // Removed console.error - use logger instead
    return ResponseHandler.handleError(err, req, res, "Error fetching profile");
  }
};
