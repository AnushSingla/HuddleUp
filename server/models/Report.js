const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    contentType: {
        type: String,
        enum: ["post", "video", "comment"],
        required: true
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "contentType"
    },
    reason: {
        type: String,
        enum: ["spam", "harassment", "hate_speech", "nudity", "violence", "misinformation", "other"],
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "reviewing", "resolved", "dismissed"],
        default: "pending"
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "low"
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    resolution: {
        type: String,
        enum: ["approved", "rejected", "deleted", "warned", null],
        default: null
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    contentSnapshot: {
        title: String,
        content: String,
        author: String
    }
}, { timestamps: true });

ReportSchema.index({ status: 1, priority: -1, createdAt: -1 });
ReportSchema.index({ contentType: 1, contentId: 1 });
ReportSchema.index({ reportedBy: 1 });
ReportSchema.index({ assignedTo: 1 });

module.exports = mongoose.model("Report", ReportSchema);
