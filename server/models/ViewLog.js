const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * ViewLog – one document per individual video view.
 * Kept lightweight; no PII beyond optional userId reference.
 */
const viewLogSchema = new Schema({
  video: {
    type: Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },

  // Nullable – anonymous viewers allowed
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  // Device type derived from user-agent (no raw UA stored)
  device: {
    type: String,
    enum: ["mobile", "tablet", "desktop", "unknown"],
    default: "unknown",
  },

  // ISO country code derived from IP (no raw IP stored)
  country: {
    type: String,
    default: "Unknown",
  },

  // Traffic source
  source: {
    type: String,
    enum: ["search", "recommendations", "direct", "external"],
    default: "direct",
  },

  // Hour of day (0-23) for peak hour analytics
  hourOfDay: {
    type: Number,
    min: 0,
    max: 23,
    default: 0,
  },

  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

viewLogSchema.index({ video: 1, timestamp: -1 });
viewLogSchema.index({ video: 1, user: 1, timestamp: -1 });

module.exports = mongoose.model("ViewLog", viewLogSchema);
