const mongoose = require("mongoose");
const SoftDeleteService = require("../services/softDeleteService");

const CommentSchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: false,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: null,
        required: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    flagged: {
        type: Boolean,
        default: false
    },
    flaggedBy: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    flagReason: {
        type: String,
        default: ""
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
}, { timestamps: true });

CommentSchema.index({ videoId: 1 });
CommentSchema.index({ postId: 1 });
CommentSchema.index({ userId: 1 });
CommentSchema.index({ createdAt: -1 });
CommentSchema.index({ isDeleted: 1, deletedAt: -1 });

// Add soft delete middleware
SoftDeleteService.addMiddleware(CommentSchema);

module.exports = mongoose.model("Comment", CommentSchema)