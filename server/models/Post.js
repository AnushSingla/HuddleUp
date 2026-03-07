const mongoose = require("mongoose");
const SoftDeleteService = require("../services/softDeleteService");

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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
    views: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
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
});

// Core indexes for common queries
postSchema.index({ postedBy: 1 });
postSchema.index({ category: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ title: "text", content: "text" });

// Performance indexes for search and filtering
postSchema.index({ title: 1 }); // For title-based searches
postSchema.index({ views: -1 }); // For sorting by views

// Compound indexes for common query combinations
postSchema.index({ createdAt: -1, _id: -1 }); // For pagination
postSchema.index({ category: 1, createdAt: -1 }); // Category + time sorting
postSchema.index({ category: 1, views: -1 }); // Category + popularity
postSchema.index({ postedBy: 1, createdAt: -1 }); // User posts + time
postSchema.index({ postedBy: 1, category: 1 }); // User posts by category
postSchema.index({ isDeleted: 1, createdAt: -1 }); // Active content by time
postSchema.index({ isDeleted: 1, category: 1 }); // Active content by category

// Specialized indexes
postSchema.index({ isDeleted: 1, deletedAt: -1 }); // For soft delete queries
postSchema.index({ flagged: 1 }); // For content moderation

// Add soft delete middleware
SoftDeleteService.addMiddleware(postSchema);

module.exports = mongoose.model("Post", postSchema)