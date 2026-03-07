const mongoose = require("mongoose");
const SoftDeleteService = require("../services/softDeleteService");

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  category: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  videoVersions: {
    original: String,
    "1080p": String,
    "720p": String,
    "480p": String,
    "360p": String,
  },
  thumbnails: [String],
  cdnUrl: String,
  metadata: {
    duration: Number,
    resolution: String,
    fileSize: Number,
    codec: String,
  },
  processingStatus: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  processingProgress: {
    type: Number,
    default: 0,
  },
  processingError: String,
  jobId: String,
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  uploadDate: {
    type: Date,
    default: Date.now // ✅ This sets the current date when video is created
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  views: {
    type: Number,
    default: 0
  },
  flagged: {
    type: Boolean,
    default: false
  },
  flaggedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  flagReason: {
    type: String,
    default: ""
  },
  hashtags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  // Duplicate detection fields
  fileHash: {
    type: String,
    index: true
  },
  originalFileSize: {
    type: Number
  },
  originalFileName: {
    type: String
  },
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
})

// Core indexes for common queries
VideoSchema.index({ postedBy: 1 });
VideoSchema.index({ category: 1 });
VideoSchema.index({ uploadDate: -1 });
VideoSchema.index({ createdAt: -1 });
VideoSchema.index({ title: "text", description: "text" });

// Performance indexes for search and filtering
VideoSchema.index({ title: 1 }); // For title-based searches
VideoSchema.index({ hashtags: 1 }); // For hashtag searches
VideoSchema.index({ views: -1 }); // For sorting by views
VideoSchema.index({ processingStatus: 1 }); // For filtering by processing status

// Compound indexes for common query combinations
VideoSchema.index({ category: 1, createdAt: -1 }); // Category + time sorting
VideoSchema.index({ category: 1, views: -1 }); // Category + popularity
VideoSchema.index({ postedBy: 1, createdAt: -1 }); // User videos + time
VideoSchema.index({ postedBy: 1, category: 1 }); // User videos by category
VideoSchema.index({ isDeleted: 1, createdAt: -1 }); // Active content by time
VideoSchema.index({ isDeleted: 1, category: 1 }); // Active content by category

// Specialized indexes
VideoSchema.index({ fileHash: 1 }); // For duplicate detection
VideoSchema.index({ "metadata.duration": 1, "metadata.fileSize": 1 }); // For metadata queries
VideoSchema.index({ isDeleted: 1, deletedAt: -1 }); // For soft delete queries
VideoSchema.index({ flagged: 1 }); // For content moderation

// Add soft delete middleware
SoftDeleteService.addMiddleware(VideoSchema);

module.exports = mongoose.model("Video", VideoSchema)