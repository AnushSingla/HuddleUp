const mongoose = require("mongoose");
const SoftDeleteService = require("../services/softDeleteService");

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ""
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  }],
  // Soft delete fields
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    index: true
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  deleteReason: {
    type: String
  },
  restoredAt: {
    type: Date
  },
  restoredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

playlistSchema.index({ isDeleted: 1, deletedAt: -1 });

// Add soft delete middleware
SoftDeleteService.addMiddleware(playlistSchema);

module.exports = mongoose.model("Playlist", playlistSchema);