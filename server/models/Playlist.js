const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ""
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  }]
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model("Playlist", playlistSchema);