const mongoose = require("mongoose");
const { Schema } = mongoose;

const videoAnalyticsSchema = new Schema({
  video: {
    type: Schema.Types.ObjectId,
    ref: "Video",
    required: true,
    unique: true,
  },

  // Hourly bucketed time-series data
  views: [
    {
      timestamp: { type: Date, required: true },
      count: { type: Number, default: 0 },
    },
  ],

  likes: [
    {
      timestamp: { type: Date, required: true },
      count: { type: Number, default: 0 },
    },
  ],

  comments: [
    {
      timestamp: { type: Date, required: true },
      count: { type: Number, default: 0 },
    },
  ],

  shares: [
    {
      timestamp: { type: Date, required: true },
      count: { type: Number, default: 0 },
    },
  ],

  // Running totals for fast reads
  totalViews: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  totalComments: { type: Number, default: 0 },
  totalShares: { type: Number, default: 0 },

  watchTime: {
    total: { type: Number, default: 0 }, // seconds
    average: { type: Number, default: 0 }, // avg seconds watched per view
  },

  traffic: {
    search: { type: Number, default: 0 },
    recommendations: { type: Number, default: 0 },
    direct: { type: Number, default: 0 },
    external: { type: Number, default: 0 },
  },

  demographics: {
    byCountry: [
      {
        country: { type: String },
        viewers: { type: Number, default: 0 },
      },
    ],
    byDevice: {
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
    },
    byHour: [
      {
        hour: { type: Number, min: 0, max: 23 }, // 0-23
        viewers: { type: Number, default: 0 },
      },
    ],
  },

  lastUpdated: { type: Date, default: Date.now },
});

// 'video' field has unique:true which already creates an index
videoAnalyticsSchema.index({ lastUpdated: -1 });

module.exports = mongoose.model("VideoAnalytics", videoAnalyticsSchema);
