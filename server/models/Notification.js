const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "comment_reply", "video_comment", "post_comment", "reaction"],
      required: true,
    },
    // Legacy: for old like/comment notifications
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    // New: generic resource reference
    resource: {
      resourceType: { type: String, enum: ["comment", "post", "video"] },
      resourceId: { type: mongoose.Schema.Types.ObjectId },
      parentId: { type: mongoose.Schema.Types.ObjectId },
    },
    message: { type: String },
    isRead: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1, recipient: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL optional: MongoDB can auto-delete expired

module.exports = mongoose.model("Notification", notificationSchema);
