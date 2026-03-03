const mongoose = require("mongoose");

const AppealSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reason: {
        type: String,
        required: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    adminNotes: {
        type: String,
        default: ""
    }
}, { timestamps: true });

AppealSchema.index({ status: 1, createdAt: -1 });
AppealSchema.index({ userId: 1 });

module.exports = mongoose.model("Appeal", AppealSchema);
