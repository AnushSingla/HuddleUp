const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true
  },
  revokedAt: {
    type: Date
  },
  revokedReason: {
    type: String
  }
}, { 
  timestamps: true 
});

// Index for cleanup queries
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for finding user's active tokens
RefreshTokenSchema.index({ userId: 1, isRevoked: 1, expiresAt: 1 });

// Method to revoke token
RefreshTokenSchema.methods.revoke = function(reason = 'Manual revocation') {
  this.isRevoked = true;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  return this.save();
};

// Static method to revoke all user tokens
RefreshTokenSchema.statics.revokeAllUserTokens = async function(userId, reason = 'Revoke all sessions') {
  return this.updateMany(
    { userId, isRevoked: false },
    { 
      isRevoked: true, 
      revokedAt: new Date(),
      revokedReason: reason
    }
  );
};

// Static method to cleanup expired tokens
RefreshTokenSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  return result.deletedCount;
};

// Static method to get user's active sessions
RefreshTokenSchema.statics.getUserActiveSessions = async function(userId) {
  return this.find({
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  })
  .select('ipAddress userAgent createdAt expiresAt')
  .sort({ createdAt: -1 })
  .lean();
};

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
