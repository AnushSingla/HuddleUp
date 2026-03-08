const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getJWTSecret } = require("../utils/validateEnv");
const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");
const { clearUserRoleCache } = require("../middleware/auth");
const tokenService = require("../services/tokenService");
const { sendWelcomeEmail } = require("../services/emailService");

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

        // Send welcome email asynchronously (don't wait for it)
        sendWelcomeEmail(email, username).catch((error) => {
            logger.error('Error sending welcome email', { 
                userId: newUser._id,
                email,
                error: error.message 
            });
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
        
        // Generate access and refresh tokens
        try {
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('User-Agent') || 'Unknown';
            
            const tokens = await tokenService.generateTokenPair(
                user._id,
                ipAddress,
                userAgent
            );
            
            logger.info('User logged in successfully', { 
                userId: user._id,
                username: user.username,
                email: user.email
            });
            
            return ResponseHandler.success(res, {
                user: { 
                    id: user._id,
                    username: user.username, 
                    email: user.email 
                }, 
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn
            }, 'Login successful');
        } catch (jwtError) {
            logger.error('Token generation error during login', { 
                error: jwtError.message,
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
        } catch (jwtError) {
            logger.error('JWT signing error during login', { 
                error: jwtError.message,
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

        // Revoke all refresh tokens for security
        await tokenService.revokeAllUserTokens(userId, 'Password changed');
        logger.info('All sessions revoked after password change', { userId });

        return ResponseHandler.success(res, null, "Password updated successfully. Please log in again.");
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

// Logout user and clear HTTP-only cookie
exports.logout = ResponseHandler.asyncHandler(async (req, res) => {
    try {
        // Clear the HTTP-only cookie
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/'
        });
        
        logger.info('User logged out successfully', { 
            userId: req.user?.id,
            ip: req.ip
        });
        
        return ResponseHandler.success(res, null, "Logged out successfully");
    } catch (err) {
        return ResponseHandler.handleError(err, req, res, "Logout failed");
    }
});


// Refresh access token using refresh token
exports.refreshToken = ResponseHandler.asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return ResponseHandler.error(
            res,
            ERROR_CODES.VALIDATION_ERROR,
            'Refresh token is required',
            400
        );
    }
    
    try {
        // Verify refresh token
        const { userId } = await tokenService.verifyRefreshToken(refreshToken);
        
        // Generate new access token
        const accessToken = tokenService.generateAccessToken(userId);
        
        logger.info('Access token refreshed', { userId });
        
        return ResponseHandler.success(res, {
            accessToken,
            expiresIn: 900 // 15 minutes
        }, 'Token refreshed successfully');
    } catch (error) {
        logger.warn('Token refresh failed', { error: error.message });
        return ResponseHandler.error(
            res,
            ERROR_CODES.UNAUTHORIZED,
            'Invalid or expired refresh token',
            401
        );
    }
});

// Logout - revoke refresh token
exports.logout = ResponseHandler.asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return ResponseHandler.success(res, null, 'Logged out successfully');
    }
    
    try {
        await tokenService.revokeRefreshToken(refreshToken, 'User logout');
        logger.info('User logged out', { userId: req.user?.id });
        
        return ResponseHandler.success(res, null, 'Logged out successfully');
    } catch (error) {
        logger.error('Logout error', { error: error.message });
        // Still return success even if revocation fails
        return ResponseHandler.success(res, null, 'Logged out successfully');
    }
});

// Logout from all devices - revoke all refresh tokens
exports.logoutAll = ResponseHandler.asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    try {
        const count = await tokenService.revokeAllUserTokens(userId, 'Logout from all devices');
        logger.info('User logged out from all devices', { userId, sessionsRevoked: count });
        
        return ResponseHandler.success(res, {
            sessionsRevoked: count
        }, 'Logged out from all devices successfully');
    } catch (error) {
        logger.error('Logout all error', { userId, error: error.message });
        return ResponseHandler.error(
            res,
            ERROR_CODES.INTERNAL_ERROR,
            'Error logging out from all devices',
            500
        );
    }
});

// Get active sessions
exports.getActiveSessions = ResponseHandler.asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    try {
        const sessions = await tokenService.getUserActiveSessions(userId);
        
        return ResponseHandler.success(res, {
            sessions,
            count: sessions.length
        }, 'Active sessions retrieved successfully');
    } catch (error) {
        logger.error('Get sessions error', { userId, error: error.message });
        return ResponseHandler.error(
            res,
            ERROR_CODES.INTERNAL_ERROR,
            'Error retrieving sessions',
            500
        );
    }
});

// Revoke specific session
exports.revokeSession = ResponseHandler.asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const userId = req.user.id;
    
    if (!refreshToken) {
        return ResponseHandler.error(
            res,
            ERROR_CODES.VALIDATION_ERROR,
            'Refresh token is required',
            400
        );
    }
    
    try {
        const revoked = await tokenService.revokeRefreshToken(refreshToken, 'Session revoked by user');
        
        if (revoked) {
            logger.info('Session revoked', { userId });
            return ResponseHandler.success(res, null, 'Session revoked successfully');
        } else {
            return ResponseHandler.error(
                res,
                ERROR_CODES.NOT_FOUND,
                'Session not found',
                404
            );
        }
    } catch (error) {
        logger.error('Revoke session error', { userId, error: error.message });
        return ResponseHandler.error(
            res,
            ERROR_CODES.INTERNAL_ERROR,
            'Error revoking session',
            500
        );
    }
});
