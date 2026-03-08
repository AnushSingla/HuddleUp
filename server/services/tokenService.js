const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");
const { getJWTSecret } = require("../utils/validateEnv");
const logger = require("../utils/logger");

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Generate access token (short-lived)
 */
const generateAccessToken = (userId) => {
  const jwtSecret = getJWTSecret();
  return jwt.sign(
    { id: userId, type: 'access' },
    jwtSecret,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generate refresh token (long-lived) and store in database
 */
const generateRefreshToken = async (userId, ipAddress, userAgent) => {
  try {
    // Generate secure random token
    const tokenValue = crypto.randomBytes(40).toString('hex');
    
    // Sign the token with JWT for additional security
    const jwtSecret = getJWTSecret();
    const signedToken = jwt.sign(
      { id: userId, type: 'refresh', token: tokenValue },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Store in database
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
    await RefreshToken.create({
      userId,
      token: signedToken,
      expiresAt,
      ipAddress,
      userAgent
    });

    logger.info('Refresh token generated', { userId, expiresAt });
    return signedToken;
  } catch (error) {
    logger.error('Error generating refresh token', { userId, error: error.message });
    throw error;
  }
};

/**
 * Generate both access and refresh tokens
 */
const generateTokenPair = async (userId, ipAddress, userAgent) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = await generateRefreshToken(userId, ipAddress, userAgent);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 900 // 15 minutes in seconds
  };
};

/**
 * Verify and decode refresh token
 */
const verifyRefreshToken = async (token) => {
  try {
    const jwtSecret = getJWTSecret();
    
    // Verify JWT signature
    const decoded = jwt.verify(token, jwtSecret);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Check if token exists in database and is not revoked
    const storedToken = await RefreshToken.findOne({
      token,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });

    if (!storedToken) {
      throw new Error('Token not found or expired');
    }

    return {
      userId: decoded.id,
      tokenId: storedToken._id
    };
  } catch (error) {
    logger.warn('Refresh token verification failed', { error: error.message });
    throw error;
  }
};

/**
 * Revoke a specific refresh token
 */
const revokeRefreshToken = async (token, reason = 'User logout') => {
  try {
    const storedToken = await RefreshToken.findOne({ token });
    if (storedToken) {
      await storedToken.revoke(reason);
      logger.info('Refresh token revoked', { tokenId: storedToken._id, reason });
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error revoking refresh token', { error: error.message });
    throw error;
  }
};

/**
 * Revoke all refresh tokens for a user
 */
const revokeAllUserTokens = async (userId, reason = 'Revoke all sessions') => {
  try {
    const result = await RefreshToken.revokeAllUserTokens(userId, reason);
    logger.info('All user tokens revoked', { userId, count: result.modifiedCount, reason });
    return result.modifiedCount;
  } catch (error) {
    logger.error('Error revoking all user tokens', { userId, error: error.message });
    throw error;
  }
};

/**
 * Get user's active sessions
 */
const getUserActiveSessions = async (userId) => {
  try {
    return await RefreshToken.getUserActiveSessions(userId);
  } catch (error) {
    logger.error('Error getting user sessions', { userId, error: error.message });
    throw error;
  }
};

/**
 * Cleanup expired tokens (run periodically)
 */
const cleanupExpiredTokens = async () => {
  try {
    const count = await RefreshToken.cleanupExpired();
    logger.info('Expired tokens cleaned up', { count });
    return count;
  } catch (error) {
    logger.error('Error cleaning up expired tokens', { error: error.message });
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  getUserActiveSessions,
  cleanupExpiredTokens,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY
};
