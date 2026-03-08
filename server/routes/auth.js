const express = require("express");
const router =  express.Router();
const authController = require("../controllers/authController")
const { 
    register, 
    login, 
    logout, 
    logoutAll,
    refreshToken,
    getActiveSessions,
    revokeSession,
    getUserProfile, 
    updateUserProfile, 
    updatePassword, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/authController');
const { verifyToken } = require("../middleware/auth");
const { registerValidator, loginValidator, profileUpdateValidator, passwordUpdateValidator } = require("../middleware/validation");
const { passwordResetLimiter } = require("../middleware/rateLimit");
const { loginLimiter, registerLimiter, passwordLimiter } = require("../middleware/rateLimiter");

// Authentication
router.post("/register", registerLimiter, registerValidator, register);
router.post("/login", loginLimiter, loginValidator, login);
router.post("/logout", logout);
router.post("/logout-all", verifyToken, logoutAll);

// Token management
router.post("/refresh", refreshToken);

// Session management
router.get("/sessions", verifyToken, getActiveSessions);
router.post("/sessions/revoke", verifyToken, revokeSession);

// Password management
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);
router.put("/password", verifyToken, passwordLimiter, passwordUpdateValidator, updatePassword);

// Profile management
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, profileUpdateValidator, updateUserProfile);

module.exports = router;

