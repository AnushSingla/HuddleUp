const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bio: {
        type: String,
        default: ""
    },
    savedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    isAdmin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    banReason: {
        type: String,
        default: ''
    },
    bannedAt: {
        type: Date
    },
    bannedUntil: {
        type: Date
    },
    suspensionCount: {
        type: Number,
        default: 0
    },
    warnings: [{
        reason: String,
        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        issuedAt: {
            type: Date,
            default: Date.now
        }
    }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, { timestamps: true })

// Text index must be defined before model compilation
UserSchema.index({ username: "text", bio: "text" });

module.exports = mongoose.model("User", UserSchema)
