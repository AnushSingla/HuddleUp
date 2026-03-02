const mongoose = require("mongoose")

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
  }]
})

VideoSchema.index({ postedBy: 1 });
VideoSchema.index({ category: 1 });
VideoSchema.index({ uploadDate: -1 });
VideoSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Video", VideoSchema)