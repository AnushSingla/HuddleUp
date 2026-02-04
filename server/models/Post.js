const mongoose = require("mongoose");
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

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

postSchema.index({ postedBy: 1 });
postSchema.index({ category: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema)