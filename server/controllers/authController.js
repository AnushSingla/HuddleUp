const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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