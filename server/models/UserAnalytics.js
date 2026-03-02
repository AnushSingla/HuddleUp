const mongoose = require("mongoose");
const { Schema } = mongoose;

const userAnalyticsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  totalViews: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  totalComments: { type: Number, default: 0 },
  totalShares: { type: Number, default: 0 },
  totalWatchTimeMinutes: { type: Number, default: 0 },

  // Follower/subscriber count snapshots over time
  followers: [
    {
      timestamp: { type: Date, required: true },
      count: { type: Number, default: 0 },
    },
  ],

  // Top videos by views
  topVideos: [
    {
      videoId: { type: Schema.Types.ObjectId, ref: "Video" },
      title: { type: String },
      views: { type: Number, default: 0 },
    },
  ],

  engagementRate: { type: Number, default: 0 }, // (likes + comments + shares) / views

  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserAnalytics", userAnalyticsSchema);
