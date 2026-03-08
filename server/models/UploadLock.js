const mongoose = require("mongoose");

const UploadLockSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    acquiredAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    reason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically clean up stale locks
UploadLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("UploadLock", UploadLockSchema);

