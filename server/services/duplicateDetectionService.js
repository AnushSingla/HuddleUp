const crypto = require('crypto');
const fs = require('fs');
const Video = require('../models/Video');
const logger = require('../utils/logger');

/**
 * Generate SHA-256 hash for a file
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - SHA-256 hash
 */
const generateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('error', (err) => {
      logger.error('Error reading file for hash generation', { filePath, error: err.message });
      reject(err);
    });
    
    stream.on('data', (chunk) => {
      hash.update(chunk);
    });
    
    stream.on('end', () => {
      const fileHash = hash.digest('hex');
      logger.debug('File hash generated', { filePath, hash: fileHash });
      resolve(fileHash);
    });
  });
};

/**
 * Check for exact duplicate based on file hash
 * @param {string} fileHash - SHA-256 hash of the file
 * @param {string} userId - ID of the user uploading
 * @returns {Promise<Object|null>} - Duplicate video or null
 */
const checkExactDuplicate = async (fileHash, userId) => {
  try {
    const duplicate = await Video.findOne({ 
      fileHash,
      postedBy: { $ne: userId } // Exclude user's own videos
    }).populate('postedBy', 'username');
    
    if (duplicate) {
      logger.info('Exact duplicate detected', { 
        fileHash, 
        duplicateId: duplicate._id,
        originalUploader: duplicate.postedBy.username 
      });
    }
    
    return duplicate;
  } catch (error) {
    logger.error('Error checking exact duplicate', { fileHash, error: error.message });
    throw error;
  }
};

/**
 * Check for potential duplicates based on metadata
 * @param {number} fileSize - File size in bytes
 * @param {number} duration - Video duration in seconds
 * @param {string} userId - ID of the user uploading
 * @returns {Promise<Array>} - Array of potential duplicate videos
 */
const checkPotentialDuplicates = async (fileSize, duration, userId) => {
  try {
    if (!fileSize || !duration) {
      return [];
    }

    // Define tolerance ranges
    const sizeTolerance = 0.1; // 10% tolerance
    const durationTolerance = 1; // 1 second tolerance
    
    const minSize = fileSize * (1 - sizeTolerance);
    const maxSize = fileSize * (1 + sizeTolerance);
    const minDuration = duration - durationTolerance;
    const maxDuration = duration + durationTolerance;

    const potentialDuplicates = await Video.find({
      postedBy: { $ne: userId }, // Exclude user's own videos
      'metadata.fileSize': { $gte: minSize, $lte: maxSize },
      'metadata.duration': { $gte: minDuration, $lte: maxDuration }
    }).populate('postedBy', 'username').limit(5); // Limit to 5 potential matches

    if (potentialDuplicates.length > 0) {
      logger.info('Potential duplicates detected', { 
        fileSize, 
        duration, 
        count: potentialDuplicates.length,
        duplicateIds: potentialDuplicates.map(v => v._id)
      });
    }

    return potentialDuplicates;
  } catch (error) {
    logger.error('Error checking potential duplicates', { fileSize, duration, error: error.message });
    throw error;
  }
};

/**
 * Perform comprehensive duplicate detection
 * @param {string} filePath - Path to the uploaded file
 * @param {Object} fileInfo - File information (size, originalname)
 * @param {string} userId - ID of the user uploading
 * @param {Object} metadata - Video metadata (duration, resolution, etc.)
 * @returns {Promise<Object>} - Duplicate detection result
 */
const detectDuplicates = async (filePath, fileInfo, userId, metadata = {}) => {
  try {
    logger.info('Starting duplicate detection', { 
      filePath, 
      fileName: fileInfo.originalname,
      fileSize: fileInfo.size,
      userId 
    });

    // Generate file hash
    const fileHash = await generateFileHash(filePath);

    // Check for exact duplicate
    const exactDuplicate = await checkExactDuplicate(fileHash, userId);
    
    if (exactDuplicate) {
      return {
        isDuplicate: true,
        type: 'exact',
        duplicate: exactDuplicate,
        fileHash,
        message: 'This video has already been uploaded to the platform.'
      };
    }

    // Check for potential duplicates based on metadata (only if we have duration)
    // Note: At upload time, we might not have video metadata yet
    if (metadata.duration) {
      const potentialDuplicates = await checkPotentialDuplicates(
        fileInfo.size, 
        metadata.duration, 
        userId
      );

      if (potentialDuplicates.length > 0) {
        return {
          isDuplicate: false,
          type: 'potential',
          potentialDuplicates,
          fileHash,
          message: 'Similar videos were found. Please review before uploading.'
        };
      }
    }

    return {
      isDuplicate: false,
      type: 'none',
      fileHash,
      message: 'No duplicates detected.'
    };

  } catch (error) {
    logger.error('Error in duplicate detection', { 
      filePath, 
      userId, 
      error: error.message 
    });
    throw error;
  }
};

/**
 * Get duplicate statistics for admin dashboard
 * @returns {Promise<Object>} - Duplicate statistics
 */
const getDuplicateStats = async () => {
  try {
    const totalVideos = await Video.countDocuments();
    const videosWithHash = await Video.countDocuments({ fileHash: { $exists: true, $ne: null } });
    
    // Find videos with duplicate hashes
    const duplicateHashes = await Video.aggregate([
      { $match: { fileHash: { $exists: true, $ne: null } } },
      { $group: { _id: '$fileHash', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    const duplicateGroups = duplicateHashes.length;
    const duplicateVideos = duplicateHashes.reduce((sum, group) => sum + group.count, 0);

    return {
      totalVideos,
      videosWithHash,
      duplicateGroups,
      duplicateVideos,
      uniqueVideos: totalVideos - duplicateVideos + duplicateGroups
    };
  } catch (error) {
    logger.error('Error getting duplicate stats', { error: error.message });
    throw error;
  }
};

module.exports = {
  generateFileHash,
  checkExactDuplicate,
  checkPotentialDuplicates,
  detectDuplicates,
  getDuplicateStats
};