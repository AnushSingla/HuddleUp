const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  eventId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  timestamp: { 
    type: Date, 
    default: Date.now, 
    immutable: true 
  },
  eventType: { 
    type: String, 
    enum: ['SOFT_DELETE', 'RESTORE', 'PERMANENT_DELETE', 'CASCADE_DELETE', 'CASCADE_RESTORE', 'CLEANUP'],
    required: true,
    immutable: true
  },
  contentType: { 
    type: String, 
    enum: ['Video', 'Post', 'Comment', 'Playlist', 'System'],
    required: true, 
    immutable: true 
  },
  contentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    immutable: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    immutable: true 
  },
  reason: { 
    type: String, 
    immutable: true 
  },
  metadata: {
    originalData: { 
      type: mongoose.Schema.Types.Mixed, 
      immutable: true 
    },
    cascadeInfo: {
      parentType: { type: String },
      parentId: { type: mongoose.Schema.Types.ObjectId },
      affectedChildren: [{ 
        type: { type: String },
        id: { type: mongoose.Schema.Types.ObjectId },
        action: { type: String }
      }]
    },
    systemInfo: {
      ipAddress: { type: String },
      userAgent: { type: String },
      apiVersion: { type: String, default: '1.0' }
    }
  }
}, {
  timestamps: false, // Using custom timestamp field
  collection: 'audit_logs'
});

// Prevent any modifications to audit records
auditLogSchema.pre('save', function() {
  if (!this.isNew) {
    throw new Error('Audit records cannot be modified');
  }
});

// Prevent updates and deletions
auditLogSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function() {
  throw new Error('Audit records cannot be modified');
});

auditLogSchema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete'], function() {
  throw new Error('Audit records cannot be deleted');
});

// Indexes for performance
auditLogSchema.index({ eventType: 1, timestamp: -1 });
auditLogSchema.index({ contentType: 1, contentId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: 1 }); // For TTL if needed

module.exports = mongoose.model("AuditLog", auditLogSchema);