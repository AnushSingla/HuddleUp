const User = require("../models/User");
const mongoose = require("mongoose");

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
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: { _id: user._id, username: user.username } });
  } catch (err) {
    console.error("getPublicProfile error:", err);
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
};
