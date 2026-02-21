const express = require("express");
const router = express.Router();
const { createPost, getAllPosts, likePost, deletePost, updatePost } = require("../controllers/postController");
const { verifyToken } = require("../middleware/auth");
const { postValidator } = require("../middleware/validation");

// Create & read posts
router.post("/posts", verifyToken, postValidator, createPost);
router.get("/posts", getAllPosts);

// Interactions
router.post("/posts/:id/like", verifyToken, likePost);

// Update & delete (owner only)
router.put("/posts/:postId", verifyToken, postValidator, updatePost);
router.delete("/posts/:postId", verifyToken, deletePost);

module.exports = router