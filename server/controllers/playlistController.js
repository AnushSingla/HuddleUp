const Playlist = require("../models/Playlist");
const Video = require("../models/Video");

// Create a new playlist
exports.createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    // Create new playlist
    const playlist = new Playlist({
      name,
      description,
      userId,
      videos: []
    });

    await playlist.save();
    
    res.status(201).json({
      success: true,
      message: "Playlist created successfully",
      playlist
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create playlist",
      error: error.message
    });
  }
};

// Get all playlists for a user
exports.getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user.id;

    const playlists = await Playlist.find({ userId })
      .populate("videos", "title thumbnail duration videoUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      playlists
    });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch playlists",
      error: error.message
    });
  }
};

// Get a specific playlist
exports.getPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findOne({ _id: id, userId })
      .populate("videos", "title thumbnail duration videoUrl uploadedBy createdAt");

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }

    res.status(200).json({
      success: true,
      playlist
    });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch playlist",
      error: error.message
    });
  }
};

// Add a video to playlist
exports.addVideoToPlaylist = async (req, res) => {
  try {
    const { id } = req.params; // playlist id
    const { videoId } = req.body;
    const userId = req.user.id;

    // Check if playlist exists and belongs to user
    const playlist = await Playlist.findOne({ _id: id, userId });
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found"
      });
    }

    // Check if video is already in playlist
    if (playlist.videos.includes(videoId)) {
      return res.status(400).json({
        success: false,
        message: "Video is already in this playlist"
      });
    }

    // Add video to playlist
    playlist.videos.push(videoId);
    await playlist.save();

    res.status(200).json({
      success: true,
      message: "Video added to playlist successfully",
      playlist
    });
  } catch (error) {
    console.error("Error adding video to playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add video to playlist",
      error: error.message
    });
  }
};

// Remove a video from playlist
exports.removeVideoFromPlaylist = async (req, res) => {
  try {
    const { id, videoId } = req.params; // playlist id and video id
    const userId = req.user.id;

    // Check if playlist exists and belongs to user
    const playlist = await Playlist.findOne({ _id: id, userId });
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }

    // Check if video is in playlist
    if (!playlist.videos.includes(videoId)) {
      return res.status(400).json({
        success: false,
        message: "Video is not in this playlist"
      });
    }

    // Remove video from playlist
    playlist.videos = playlist.videos.filter(vid => vid.toString() !== videoId);
    await playlist.save();

    res.status(200).json({
      success: true,
      message: "Video removed from playlist successfully",
      playlist
    });
  } catch (error) {
    console.error("Error removing video from playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove video from playlist",
      error: error.message
    });
  }
};

// Delete a playlist
exports.deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find and delete playlist
    const playlist = await Playlist.findOneAndDelete({ _id: id, userId });
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete playlist",
      error: error.message
    });
  }
};