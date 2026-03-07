const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isRevoked: {
        type: Boolean,
        default: false
    },
    deviceInfo: {
        userAgent: String,
        ipAddress: String,
        deviceId: String
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true 
});

// Index for efficient queries
RefreshTokenSchema.index({ token: 1 });
RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Instance method to check if token is valid
RefreshTokenSchema.methods.isValid = function() {
    return !this.isRevoked && this.expiresAt > new Date();
};

// Static method to cleanup expired tokens
RefreshTokenSchema.statics.cleanupExpired = async function() {
    return this.deleteMany({
        $or: [
            { expiresAt: { $lt: new Date() } },
            { isRevoked: true }
        ]
    });
};

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);