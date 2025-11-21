const express = require("express");
const router = express.Router();
const { createPost ,getAllPosts, likePost,deletePost} = require("../controllers/postController");
const { verifyToken } = require("../middleware/auth");
router.post("/posts",verifyToken,createPost);
router.get("/posts",getAllPosts);
router.post("/posts/:id/like",verifyToken,likePost)
router.delete("/posts/:postId",verifyToken,deletePost)

module.exports = router