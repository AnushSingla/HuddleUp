const User = require("../models/User");

/**
 * Middleware to check if an authenticated user is banned or suspended.
 * If banned permanently or until a future date, blocks the request.
 * If the ban has expired, auto-unbans the user and allows the request.
 */
const banCheck = async (req, res, next) => {
    try {
        // Only check if user is authenticated
        if (!req.user || !req.user.id) {
            return next();
        }

        const user = await User.findById(req.user.id).select('isBanned bannedUntil banReason');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isBanned) {
            return next();
        }

        // Check if ban has expired (temporary suspension)
        if (user.bannedUntil && new Date(user.bannedUntil) < new Date()) {
            // Auto-unban: suspension has expired
            user.isBanned = false;
            user.banReason = '';
            user.bannedUntil = null;
            await user.save();
            return next();
        }

        // User is still banned
        const banType = user.bannedUntil ? 'suspended' : 'banned';
        const message = user.bannedUntil
            ? `Your account is suspended until ${new Date(user.bannedUntil).toLocaleDateString()}. Reason: ${user.banReason || 'Policy violation'}`
            : `Your account has been permanently banned. Reason: ${user.banReason || 'Policy violation'}. You may submit an appeal.`;

        return res.status(403).json({
            message,
            banned: true,
            banType,
            bannedUntil: user.bannedUntil || null,
            banReason: user.banReason || 'Policy violation'
        });
    } catch (error) {
        console.error("Ban check error:", error);
        return next(); // Fail open to not block legitimate users on DB errors
    }
};

module.exports = { banCheck };
