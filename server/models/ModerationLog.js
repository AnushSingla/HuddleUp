const mongoose = require("mongoose");

const ModerationLogSchema = new mongoose.Schema({
    moderator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    action: {
        type: String,
        enum: ["approve", "reject", "delete", "warn", "ban", "unban", "suspend", "dismiss", "resolve_appeal"],
        required: true
    },
    targetType: {
        type: String,
        enum: ["post", "video", "comment", "user"],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    reason: {
        type: String,
        default: ""
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

ModerationLogSchema.index({ moderator: 1, createdAt: -1 });
ModerationLogSchema.index({ targetType: 1, targetId: 1 });
ModerationLogSchema.index({ action: 1 });
ModerationLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ModerationLog", ModerationLogSchema);
