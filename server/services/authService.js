const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");
const { getJWTSecret } = require("../utils/validateEnv");
const logger = require("../utils/logger");

class AuthService {
    constructor() {
        this.ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
        this.REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        this.COOKIE_OPTIONS = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        };
    }

    /**
     * Generate access token
     */
    generateAccessToken(userId) {
        try {
            const jwtSecret = getJWTSecret();
            return jwt.sign(
                { 
                    id: userId,
                    type: 'access',
                    iat: Math.floor(Date.now() / 1000)
                }, 
                jwtSecret, 
                { expiresIn: this.ACCESS_TOKEN_EXPIRY }
            );
        } catch (error) {
            logger.error('Error generating access token', { userId, error: error.message });
            throw new Error('Failed to generate access token');
        }
    }

    /**
     * Generate refresh token
     */
    async generateRefreshToken(userId, deviceInfo = {}) {
        try {
            const tokenValue = crypto.randomBytes(64).toString('hex');
            const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY);

            const refreshToken = new RefreshToken({
                token: tokenValue,
                userId,
                expiresAt,
                deviceInfo: {
                    userAgent: deviceInfo.userAgent || '',
                    ipAddress: deviceInfo.ipAddress || '',
                    deviceId: deviceInfo.deviceId || crypto.randomUUID()
                }
            });

            await refreshToken.save();

            logger.info('Refresh token generated', { 
                userId, 
                tokenId: refreshToken._id,
                expiresAt 
            });

            return tokenValue;
        } catch (error) {
            logger.error('Error generating refresh token', { userId, error: error.message });
            throw new Error('Failed to generate refresh token');
        }
    }

    /**
     * Generate token pair (access + refresh)
     */
    async generateTokenPair(userId, deviceInfo = {}) {
        try {
            const accessToken = this.generateAccessToken(userId);
            const refreshToken = await this.generateRefreshToken(userId, deviceInfo);

            return { accessToken, refreshToken };
        } catch (error) {
            logger.error('Error generating token pair', { userId, error: error.message });
            throw error;
        }
    }

    /**
     * Verify access token
     */
    verifyAccessToken(token) {
        try {
            const jwtSecret = getJWTSecret();
            const decoded = jwt.verify(token, jwtSecret);
            
            if (decoded.type !== 'access') {
                throw new Error('Invalid token type');
            }

            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('ACCESS_TOKEN_EXPIRED');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('INVALID_ACCESS_TOKEN');
            }
            throw error;
        }
    }

    /**
     * Verify and validate refresh token
     */
    async verifyRefreshToken(tokenValue) {
        try {
            const refreshToken = await RefreshToken.findOne({ 
                token: tokenValue,
                isRevoked: false 
            }).populate('userId', 'username email');

            if (!refreshToken) {
                throw new Error('INVALID_REFRESH_TOKEN');
            }

            if (!refreshToken.isValid()) {
                // Clean up expired token
                await RefreshToken.findByIdAndUpdate(refreshToken._id, { isRevoked: true });
                throw new Error('REFRESH_TOKEN_EXPIRED');
            }

            // Update last used timestamp
            refreshToken.lastUsed = new Date();
            await refreshToken.save();

            return refreshToken;
        } catch (error) {
            logger.warn('Refresh token verification failed', { 
                token: tokenValue?.substring(0, 10) + '...', 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Refresh token pair (with rotation)
     */
    async refreshTokenPair(oldRefreshToken, deviceInfo = {}) {
        try {
            // Verify old refresh token
            const refreshTokenDoc = await this.verifyRefreshToken(oldRefreshToken);
            const userId = refreshTokenDoc.userId._id;

            // Revoke old refresh token (rotation)
            refreshTokenDoc.isRevoked = true;
            await refreshTokenDoc.save();

            // Generate new token pair
            const { accessToken, refreshToken } = await this.generateTokenPair(userId, deviceInfo);

            logger.info('Token pair refreshed', { 
                userId,
                oldTokenId: refreshTokenDoc._id 
            });

            return { 
                accessToken, 
                refreshToken, 
                user: {
                    id: userId,
                    username: refreshTokenDoc.userId.username,
                    email: refreshTokenDoc.userId.email
                }
            };
        } catch (error) {
            logger.error('Token refresh failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Revoke refresh token (logout)
     */
    async revokeRefreshToken(tokenValue) {
        try {
            const result = await RefreshToken.findOneAndUpdate(
                { token: tokenValue },
                { isRevoked: true },
                { new: true }
            );

            if (result) {
                logger.info('Refresh token revoked', { 
                    tokenId: result._id,
                    userId: result.userId 
                });
            }

            return !!result;
        } catch (error) {
            logger.error('Error revoking refresh token', { error: error.message });
            throw error;
        }
    }

    /**
     * Revoke all refresh tokens for a user (global logout)
     */
    async revokeAllUserTokens(userId) {
        try {
            const result = await RefreshToken.updateMany(
                { userId, isRevoked: false },
                { isRevoked: true }
            );

            logger.info('All user tokens revoked', { 
                userId, 
                revokedCount: result.modifiedCount 
            });

            return result.modifiedCount;
        } catch (error) {
            logger.error('Error revoking all user tokens', { userId, error: error.message });
            throw error;
        }
    }

    /**
     * Get user's active sessions
     */
    async getUserSessions(userId) {
        try {
            const sessions = await RefreshToken.find({
                userId,
                isRevoked: false,
                expiresAt: { $gt: new Date() }
            }).select('deviceInfo lastUsed createdAt expiresAt').sort({ lastUsed: -1 });

            return sessions.map(session => ({
                id: session._id,
                deviceInfo: session.deviceInfo,
                lastUsed: session.lastUsed,
                createdAt: session.createdAt,
                expiresAt: session.expiresAt,
                isCurrent: false // Will be set by caller if needed
            }));
        } catch (error) {
            logger.error('Error fetching user sessions', { userId, error: error.message });
            throw error;
        }
    }

    /**
     * Set secure cookies
     */
    setAuthCookies(res, accessToken, refreshToken) {
        // Set access token cookie
        res.cookie('accessToken', accessToken, {
            ...this.COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        // Set refresh token cookie
        res.cookie('refreshToken', refreshToken, {
            ...this.COOKIE_OPTIONS,
            maxAge: this.REFRESH_TOKEN_EXPIRY
        });
    }

    /**
     * Clear auth cookies
     */
    clearAuthCookies(res) {
        res.clearCookie('accessToken', this.COOKIE_OPTIONS);
        res.clearCookie('refreshToken', this.COOKIE_OPTIONS);
    }

    /**
     * Extract device info from request
     */
    extractDeviceInfo(req) {
        return {
            userAgent: req.get('User-Agent') || '',
            ipAddress: req.ip || req.connection.remoteAddress || '',
            deviceId: req.get('X-Device-ID') || crypto.randomUUID()
        };
    }

    /**
     * Cleanup expired tokens (should be run periodically)
     */
    async cleanupExpiredTokens() {
        try {
            const result = await RefreshToken.cleanupExpired();
            logger.info('Expired tokens cleaned up', { deletedCount: result.deletedCount });
            return result.deletedCount;
        } catch (error) {
            logger.error('Error cleaning up expired tokens', { error: error.message });
            throw error;
        }
    }
}

module.exports = new AuthService();