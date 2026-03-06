const express = require("express");
const router =  express.Router();
const authController = require("../controllers/authController")
const { register, login, getUserProfile, updateUserProfile, updatePassword } = require('../controllers/authController');
const { verifyToken } = require("../middleware/auth");
const { loginLimiter, registerLimiter, passwordLimiter } = require("../middleware/rateLimiter");

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);
router.put("/password", verifyToken, passwordLimiter, updatePassword);

module.exports = router;