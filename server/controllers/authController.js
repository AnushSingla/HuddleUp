const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.register = async (req, res) => {
    console.log("Received register request:", req.body);
    try {
        const { username, email, password } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashed });
        await newUser.save();
        console.log("User saved:", newUser);

        res.status(201).json("User registered");
    } catch (err) {
        console.log("Error in register:", err);
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
        }
        res.status(500).json(err.message || "Internal Server Error")
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            return (
                res.status(404).json("User not Found")
            )
        }
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            return (
                res.status(401).json("Password Incorrect")
            )
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ user: { username: user.username, email: user.email }, token })
    } catch (err) {
        res.status(500).json(err.message);
    }
}

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password").populate("friends").populate("friendRequests").populate("sentRequests");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
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
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile", error: err.message });
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
                return res.status(400).json({ message: "Username already exists" });
            }
        }

        if (email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
            if (existingEmail) {
                return res.status(400).json({ message: "Email already exists" });
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
            return res.status(400).json({ message: "Current password and new password are required" });
        }

        const user = await User.findById(userId);

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating password", error: err.message });
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
            return res.status(400).json({ message: "Invalid or expired reset link. Please request a new one." });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return res.status(200).json({ message: "Password reset successfully. You can now sign in." });
    } catch (err) {
        console.error("resetPassword error:", err);
        return res.status(500).json({ message: "Something went wrong. Please try again." });
    }
};