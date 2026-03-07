const mongoose = require('mongoose');
const Video = require('../models/Video');
const Post = require('../models/Post');
const logger = require('../utils/logger');

/**
 * Database Index Creation Script
 * 
 * This script ensures all necessary indexes are created for optimal query performance.
 * It can be run manually or as part of the application startup process.
 */

const createIndexes = async () => {
  try {
    logger.info('Starting database index creation...');

    // Video indexes
    logger.info('Creating Video collection indexes...');
    await Video.collection.createIndexes([
      // Core indexes
      { key: { postedBy: 1 }, name: 'postedBy_1' },
      { key: { category: 1 }, name: 'category_1' },
      { key: { uploadDate: -1 }, name: 'uploadDate_-1' },
      { key: { createdAt: -1 }, name: 'createdAt_-1' },
      
      // Search indexes
      { key: { title: 1 }, name: 'title_1' },
      { key: { hashtags: 1 }, name: 'hashtags_1' },
      { key: { views: -1 }, name: 'views_-1' },
      { key: { processingStatus: 1 }, name: 'processingStatus_1' },
      
      // Compound indexes for common query patterns
      { key: { category: 1, createdAt: -1 }, name: 'category_1_createdAt_-1' },
      { key: { category: 1, views: -1 }, name: 'category_1_views_-1' },
      { key: { postedBy: 1, createdAt: -1 }, name: 'postedBy_1_createdAt_-1' },
      { key: { postedBy: 1, category: 1 }, name: 'postedBy_1_category_1' },
      { key: { isDeleted: 1, createdAt: -1 }, name: 'isDeleted_1_createdAt_-1' },
      { key: { isDeleted: 1, category: 1 }, name: 'isDeleted_1_category_1' },
      
      // Specialized indexes
      { key: { fileHash: 1 }, name: 'fileHash_1' },
      { key: { 'metadata.duration': 1, 'metadata.fileSize': 1 }, name: 'metadata_duration_1_fileSize_1' },
      { key: { isDeleted: 1, deletedAt: -1 }, name: 'isDeleted_1_deletedAt_-1' },
      { key: { flagged: 1 }, name: 'flagged_1' },
      
      // Text search index
      { key: { title: 'text', description: 'text' }, name: 'title_text_description_text' }
    ]);

    // Post indexes
    logger.info('Creating Post collection indexes...');
    await Post.collection.createIndexes([
      // Core indexes
      { key: { postedBy: 1 }, name: 'postedBy_1' },
      { key: { category: 1 }, name: 'category_1' },
      { key: { createdAt: -1 }, name: 'createdAt_-1' },
      
      // Search indexes
      { key: { title: 1 }, name: 'title_1' },
      { key: { views: -1 }, name: 'views_-1' },
      
      // Compound indexes for common query patterns
      { key: { createdAt: -1, _id: -1 }, name: 'createdAt_-1_id_-1' },
      { key: { category: 1, createdAt: -1 }, name: 'category_1_createdAt_-1' },
      { key: { category: 1, views: -1 }, name: 'category_1_views_-1' },
      { key: { postedBy: 1, createdAt: -1 }, name: 'postedBy_1_createdAt_-1' },
      { key: { postedBy: 1, category: 1 }, name: 'postedBy_1_category_1' },
      { key: { isDeleted: 1, createdAt: -1 }, name: 'isDeleted_1_createdAt_-1' },
      { key: { isDeleted: 1, category: 1 }, name: 'isDeleted_1_category_1' },
      
      // Specialized indexes
      { key: { isDeleted: 1, deletedAt: -1 }, name: 'isDeleted_1_deletedAt_-1' },
      { key: { flagged: 1 }, name: 'flagged_1' },
      
      // Text search index
      { key: { title: 'text', content: 'text' }, name: 'title_text_content_text' }
    ]);

    logger.info('Database indexes created successfully');
    
    // Get index information for verification
    const videoIndexes = await Video.collection.listIndexes().toArray();
    const postIndexes = await Post.collection.listIndexes().toArray();
    
    logger.info(`Video collection has ${videoIndexes.length} indexes`);
    logger.info(`Post collection has ${postIndexes.length} indexes`);
    
    return {
      success: true,
      videoIndexes: videoIndexes.length,
      postIndexes: postIndexes.length
    };

  } catch (error) {
    logger.error('Error creating database indexes:', error);
    throw error;
  }
};

// Allow script to be run directly
if (require.main === module) {
  const connectDB = require('../config/database');
  
  connectDB()
    .then(() => createIndexes())
    .then((result) => {
      console.log('Index creation completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Index creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createIndexes };