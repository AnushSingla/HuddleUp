const express = require("express");
const router =  express.Router();
const authController = require("../controllers/authController")
const { register, login, getUserProfile, updateUserProfile, updatePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { verifyToken } = require("../middleware/auth");
const { registerValidator, loginValidator, profileUpdateValidator, passwordUpdateValidator } = require("../middleware/validation");
const { passwordResetLimiter } = require("../middleware/rateLimit");
const { loginLimiter, registerLimiter, passwordLimiter } = require("../middleware/rateLimiter");

router.post("/register", registerLimiter, registerValidator, register);
router.post("/login", loginLimiter, loginValidator, login);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, profileUpdateValidator, updateUserProfile);
router.put("/password", verifyToken, passwordLimiter, passwordUpdateValidator, updatePassword);

module.exports = router;