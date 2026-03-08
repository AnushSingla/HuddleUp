const UploadLock = require("../models/UploadLock");
const logger = require("../utils/logger");

class UploadLockService {
  constructor() {
    // Default lock TTL: 10 minutes
    this.LOCK_TTL_MS = 10 * 60 * 1000;
  }

  /**
   * Acquire an upload lock for a user.
   * Returns the lock document if acquired, otherwise throws UPLOAD_IN_PROGRESS.
   */
  async acquireUploadLock(userId) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.LOCK_TTL_MS);

    try {
      const lock = await UploadLock.findOneAndUpdate(
        {
          userId,
          $or: [
            { expiresAt: { $lte: now } },
            { expiresAt: { $exists: false } },
          ],
        },
        {
          userId,
          acquiredAt: now,
          expiresAt,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      logger.info("Upload lock acquired", { userId, lockId: lock._id });
      return lock;
    } catch (error) {
      // Duplicate key error on unique userId -> another lock already exists
      if (error.code === 11000) {
        logger.warn("Upload lock already held for user", { userId });
        const concurrencyError = new Error("UPLOAD_IN_PROGRESS");
        concurrencyError.code = "UPLOAD_IN_PROGRESS";
        throw concurrencyError;
      }

      logger.error("Failed to acquire upload lock", {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Release an upload lock for a user.
   */
  async releaseUploadLock(userId) {
    try {
      await UploadLock.deleteOne({ userId });
      logger.info("Upload lock released", { userId });
    } catch (error) {
      logger.warn("Failed to release upload lock", {
        userId,
        error: error.message,
      });
    }
  }
}

module.exports = new UploadLockService();

