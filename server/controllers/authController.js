const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { getJWTSecret } = require("../utils/validateEnv");
const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");
const authService = require("../services/authService");

exports.register = ResponseHandler.asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    
    logger.info('User registration attempt', { 
        username, 
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    
    try {
        const hashed = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashed });
        await newUser.save();
        
        logger.info('User registered successfully', { 
            userId: newUser._id,
            username: newUser.username,
            email: newUser.email
        });

        return ResponseHandler.success(res, 
            { 
                user: { 
                    id: newUser._id, 
                    username: newUser.username, 
                    email: newUser.email 
                } 
            }, 
            "User registered successfully", 
            201
        );
    } catch (error) {
        return ResponseHandler.handleError(error, req, res, 'User registration');
    }
});


exports.login = ResponseHandler.asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    logger.info('User login attempt', { 
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn('Login failed - user not found', { email });
            return ResponseHandler.error(
                res,
                ERROR_CODES.UNAUTHORIZED,
                'Invalid email or password',
                401
            );
        }
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            logger.warn('Login failed - invalid password', { 
                email,
                userId: user._id
            });
            return ResponseHandler.error(
                res,
                ERROR_CODES.UNAUTHORIZED,
                'Invalid email or password',
                401
            );
        }
        
        try {
            // Generate secure token pair
            const deviceInfo = authService.extractDeviceInfo(req);
            const { accessToken, refreshToken } = await authService.generateTokenPair(user._id, deviceInfo);

            // Set secure HTTP-only cookies
            authService.setAuthCookies(res, accessToken, refreshToken);

            logger.info('User logged in successfully', { 
                userId: user._id,
                username: user.username,
                email: user.email,
                deviceInfo: deviceInfo.userAgent
            });
            
            return ResponseHandler.success(res, {
                user: { 
                    id: user._id,
                    username: user.username, 
                    email: user.email 
                },
                // For backward compatibility during migration, also return token
                token: accessToken
            }, 'Login successful');
        } catch (authError) {
            logger.error('Authentication service error during login', { 
                error: authError.message,
                userId: user._id
            });
            return ResponseHandler.error(
                res,
                ERROR_CODES.SERVICE_UNAVAILABLE,
                "Authentication service temporarily unavailable. Please try again later.",
                503
            );
        }
    } catch (error) {
        return ResponseHandler.handleError(error, req, res, 'User login');
    }
});

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password").populate("friends").populate("friendRequests").populate("sentRequests");

        if (!user) {
            return ResponseHandler.notFound(res, "User");
        }

        return ResponseHandler.success(res, {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                createdAt: user.createdAt,
                friendsCount: user.friends.length,
                followersCount: user.friendRequests.length,
                followingCount: user.sentRequests.length
            }
        }, "Profile retrieved successfully");
    } catch (err) {
        return ResponseHandler.handleError(err, req, res, "Error fetching profile");
    }
}

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email } = req.body;

        // Check if username or email already exists (if being changed)
        if (username) {
            const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUsername) {
                return ResponseHandler.error(res, ERROR_CODES.ALREADY_EXISTS, "Username already exists", 409);
            }
        }

        if (email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
            if (existingEmail) {
                return ResponseHandler.error(res, ERROR_CODES.ALREADY_EXISTS, "Email already exists", 409);
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...(username && { username }),
                ...(email && { email }),
                ...(req.body.bio !== undefined && { bio: req.body.bio })
            },
            { new: true }
        ).select("-password");

        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: "Error updating profile", error: err.message });
    }
}

// Update password
exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return ResponseHandler.error(res, ERROR_CODES.MISSING_REQUIRED_FIELD, "Current password and new password are required", 400);
        }

        const user = await User.findById(userId);

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return ResponseHandler.error(res, ERROR_CODES.UNAUTHORIZED, "Current password is incorrect", 401);
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return ResponseHandler.success(res, null, "Password updated successfully");
    } catch (err) {
        return ResponseHandler.handleError(err, req, res, "Error updating password");
    }
}

// Forgot password: accept email, create token, send reset link (no user enumeration)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        // Always return same success message whether user exists or not
        const genericMessage = "If an account exists with this email, you will receive a reset link shortly.";
        if (!user) {
            return res.status(200).json({ message: genericMessage });
        }
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save({ validateBeforeSave: false });

        const baseUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";
        const resetLink = `${baseUrl}/reset-password?token=${token}`;

        const hasSmtp = process.env.SMTP_USER && process.env.SMTP_PASS;
        if (!hasSmtp) {
            // Dev fallback: no SMTP configured – log link so you can copy and test
            console.log("\n--- Forgot password (SMTP not configured) ---");
            console.log("Reset link (valid 1 hour, copy and open in browser):");
            console.log(resetLink);
            console.log("--- To send real emails, set SMTP_USER and SMTP_PASS in server/.env ---\n");
        } else {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || "smtp.gmail.com",
                    port: parseInt(process.env.SMTP_PORT || "587", 10),
                    secure: process.env.SMTP_SECURE === "true",
                    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
                });
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@huddleup.com",
                    to: user.email,
                    subject: "HuddleUp – Reset your password",
                    text: `You requested a password reset. Click the link below (valid for 1 hour):\n\n${resetLink}\n\nIf you didn't request this, ignore this email.`,
                    html: `<p>You requested a password reset. Click the link below (valid for 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you didn't request this, ignore this email.</p>`,
                });
            } catch (mailErr) {
                console.error("Forgot password email error:", mailErr.message);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                await user.save({ validateBeforeSave: false });
            }
        }
        return res.status(200).json({ message: genericMessage });
    } catch (err) {
        console.error("forgotPassword error:", err);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};

// Reset password: accept token + new password, verify token, update password, invalidate token
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });
        if (!user) {
            return ResponseHandler.error(res, ERROR_CODES.VALIDATION_ERROR, "Invalid or expired reset link. Please request a new one.", 400);
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return ResponseHandler.success(res, null, "Password reset successfully. You can now sign in.");
    } catch (err) {
        logger.error("resetPassword error", { error: err.message });
        return ResponseHandler.handleError(err, req, res, "Password reset failed");
    }
};

// Secure logout
exports.logout = ResponseHandler.asyncHandler(async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        
        if (refreshToken) {
            // Revoke the refresh token
            await authService.revokeRefreshToken(refreshToken);
            logger.info('User logged out', { 
                userId: req.user?.id,
                ip: req.ip 
            });
        }
        
        // Clear authentication cookies
        authService.clearAuthCookies(res);
        
        return ResponseHandler.success(res, null, 'Logged out successfully');
    } catch (error) {
        logger.error('Logout error', { 
            error: error.message,
            userId: req.user?.id 
        });
        
        // Still clear cookies even if there's an error
        authService.clearAuthCookies(res);
        
        return ResponseHandler.success(res, null, 'Logged out successfully');
    }
});

// Global logout (all devices)
exports.logoutAll = ResponseHandler.asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Revoke all refresh tokens for the user
        const revokedCount = await authService.revokeAllUserTokens(userId);
        
        // Clear current cookies
        authService.clearAuthCookies(res);
        
        logger.info('User logged out from all devices', { 
            userId,
            revokedTokens: revokedCount,
            ip: req.ip 
        });
        
        return ResponseHandler.success(res, 
            { revokedSessions: revokedCount }, 
            'Logged out from all devices successfully'
        );
    } catch (error) {
        logger.error('Global logout error', { 
            error: error.message,
            userId: req.user?.id 
        });
        
        // Still clear current cookies
        authService.clearAuthCookies(res);
        
        return ResponseHandler.error(
            res,
            ERROR_CODES.INTERNAL_ERROR,
            'Logout failed. Please try again.',
            500
        );
    }
});

// Refresh token endpoint
exports.refreshToken = ResponseHandler.asyncHandler(async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        
        if (!refreshToken) {
            return ResponseHandler.error(
                res,
                ERROR_CODES.UNAUTHORIZED,
                'Refresh token not provided',
                401
            );
        }
        
        const deviceInfo = authService.extractDeviceInfo(req);
        const result = await authService.refreshTokenPair(refreshToken, deviceInfo);
        
        // Set new cookies
        authService.setAuthCookies(res, result.accessToken, result.refreshToken);
        
        logger.info('Token refreshed successfully', { 
            userId: result.user.id,
            ip: req.ip 
        });
        
        return ResponseHandler.success(res, {
            user: result.user,
            // For backward compatibility
            token: result.accessToken
        }, 'Token refreshed successfully');
    } catch (error) {
        logger.warn('Token refresh failed', { 
            error: error.message,
            ip: req.ip 
        });
        
        // Clear invalid cookies
        authService.clearAuthCookies(res);
        
        if (error.message === 'INVALID_REFRESH_TOKEN' || error.message === 'REFRESH_TOKEN_EXPIRED') {
            return ResponseHandler.error(
                res,
                ERROR_CODES.UNAUTHORIZED,
                'Session expired. Please log in again.',
                401
            );
        }
        
        return ResponseHandler.error(
            res,
            ERROR_CODES.INTERNAL_ERROR,
            'Token refresh failed. Please try again.',
            500
        );
    }
});

// Get user sessions
exports.getSessions = ResponseHandler.asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const currentRefreshToken = req.cookies?.refreshToken;
        
        const sessions = await authService.getUserSessions(userId);
        
        // Mark current session if we have the refresh token
        if (currentRefreshToken) {
            const RefreshToken = require("../models/RefreshToken");
            const currentToken = await RefreshToken.findOne({ 
                token: currentRefreshToken,
                isRevoked: false 
            });
            
            if (currentToken) {
                const currentSession = sessions.find(s => s.id.toString() === currentToken._id.toString());
                if (currentSession) {
                    currentSession.isCurrent = true;
                }
            }
        }
        
        return ResponseHandler.success(res, { sessions }, 'Sessions retrieved successfully');
    } catch (error) {
        logger.error('Error fetching user sessions', { 
            error: error.message,
            userId: req.user?.id 
        });
        
        return ResponseHandler.error(
            res,
            ERROR_CODES.INTERNAL_ERROR,
            'Failed to fetch sessions',
            500
        );
    }
});

// Revoke specific session
exports.revokeSession = ResponseHandler.asyncHandler(async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        
        const RefreshToken = require("../models/RefreshToken");
        const result = await RefreshToken.findOneAndUpdate(
            { 
                _id: sessionId,
                userId: userId,
                isRevoked: false 
            },
            { isRevoked: true },
            { new: true }
        );
        
        if (!result) {
            return ResponseHandler.error(
                res,
                ERROR_CODES.NOT_FOUND,
                'Session not found',
                404
            );
        }
        
        logger.info('Session revoked', { 
            sessionId,
            userId,
            ip: req.ip 
        });
        
        return ResponseHandler.success(res, null, 'Session revoked successfully');
    } catch (error) {
        logger.error('Error revoking session', { 
            error: error.message,
            sessionId: req.params.sessionId,
            userId: req.user?.id 
        });
        
        return ResponseHandler.error(
            res,
            ERROR_CODES.INTERNAL_ERROR,
            'Failed to revoke session',
            500
        );
    }
});
