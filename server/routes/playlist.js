const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  createPlaylist,
  getUserPlaylists,
  getPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist
} = require("../controllers/playlistController");

// All playlist routes require authentication
router.use(verifyToken);

// Create a new playlist
router.post("/", createPlaylist);

// Get all playlists for the authenticated user
router.get("/", getUserPlaylists);

// Get a specific playlist
router.get("/:id", getPlaylist);

// Add a video to a playlist
router.post("/:id/videos", addVideoToPlaylist);

// Remove a video from a playlist
router.delete("/:id/videos/:videoId", removeVideoFromPlaylist);

// Delete a playlist
router.delete("/:id", deletePlaylist);

module.exports = router;