const mongoose = require('mongoose');
const Video = require('../models/Video');
const Post = require('../models/Post');
const logger = require('../utils/logger');

/**
 * Query Performance Analysis Script
 * 
 * This script analyzes common query patterns to ensure they are using indexes effectively.
 * It provides execution statistics and recommendations for query optimization.
 */

const analyzeQueryPerformance = async () => {
  try {
    logger.info('Starting query performance analysis...');

    const results = {
      videoQueries: [],
      postQueries: [],
      recommendations: []
    };

    // Test common Video queries
    const videoQueries = [
      {
        name: 'Find videos by category',
        query: { category: 'gaming', isDeleted: false },
        sort: { createdAt: -1 }
      },
      {
        name: 'Find videos by user',
        query: { postedBy: new mongoose.Types.ObjectId(), isDeleted: false },
        sort: { createdAt: -1 }
      },
      {
        name: 'Find popular videos',
        query: { isDeleted: false, flagged: false },
        sort: { views: -1 }
      },
      {
        name: 'Search videos by title',
        query: { title: /test/i, isDeleted: false },
        sort: { createdAt: -1 }
      },
      {
        name: 'Find videos by hashtag',
        query: { hashtags: 'gaming', isDeleted: false },
        sort: { createdAt: -1 }
      }
    ];

    for (const testQuery of videoQueries) {
      try {
        const explain = await Video.find(testQuery.query)
          .sort(testQuery.sort)
          .limit(10)
          .explain('executionStats');

        const stats = explain.executionStats;
        results.videoQueries.push({
          name: testQuery.name,
          executionTimeMillis: stats.executionTimeMillis,
          totalDocsExamined: stats.totalDocsExamined,
          totalDocsReturned: stats.totalDocsReturned,
          indexesUsed: explain.queryPlanner.winningPlan.inputStage?.indexName || 'COLLSCAN',
          efficient: stats.totalDocsExamined <= stats.totalDocsReturned * 2 // Rough efficiency metric
        });
      } catch (error) {
        logger.warn(`Failed to analyze video query: ${testQuery.name}`, error.message);
      }
    }

    // Test common Post queries
    const postQueries = [
      {
        name: 'Find posts by category',
        query: { category: 'discussion', isDeleted: false },
        sort: { createdAt: -1 }
      },
      {
        name: 'Find posts by user',
        query: { postedBy: new mongoose.Types.ObjectId(), isDeleted: false },
        sort: { createdAt: -1 }
      },
      {
        name: 'Find popular posts',
        query: { isDeleted: false, flagged: false },
        sort: { views: -1 }
      },
      {
        name: 'Search posts by title',
        query: { title: /test/i, isDeleted: false },
        sort: { createdAt: -1 }
      }
    ];

    for (const testQuery of postQueries) {
      try {
        const explain = await Post.find(testQuery.query)
          .sort(testQuery.sort)
          .limit(10)
          .explain('executionStats');

        const stats = explain.executionStats;
        results.postQueries.push({
          name: testQuery.name,
          executionTimeMillis: stats.executionTimeMillis,
          totalDocsExamined: stats.totalDocsExamined,
          totalDocsReturned: stats.totalDocsReturned,
          indexesUsed: explain.queryPlanner.winningPlan.inputStage?.indexName || 'COLLSCAN',
          efficient: stats.totalDocsExamined <= stats.totalDocsReturned * 2
        });
      } catch (error) {
        logger.warn(`Failed to analyze post query: ${testQuery.name}`, error.message);
      }
    }

    // Generate recommendations
    const inefficientQueries = [
      ...results.videoQueries.filter(q => !q.efficient),
      ...results.postQueries.filter(q => !q.efficient)
    ];

    if (inefficientQueries.length > 0) {
      results.recommendations.push('Some queries are not using indexes efficiently. Consider reviewing the query patterns.');
    }

    const collScans = [
      ...results.videoQueries.filter(q => q.indexesUsed === 'COLLSCAN'),
      ...results.postQueries.filter(q => q.indexesUsed === 'COLLSCAN')
    ];

    if (collScans.length > 0) {
      results.recommendations.push('Some queries are performing collection scans. Additional indexes may be needed.');
    }

    // Get current index information
    const videoIndexes = await Video.collection.listIndexes().toArray();
    const postIndexes = await Post.collection.listIndexes().toArray();

    results.indexInfo = {
      videoIndexes: videoIndexes.map(idx => ({ name: idx.name, key: idx.key })),
      postIndexes: postIndexes.map(idx => ({ name: idx.name, key: idx.key }))
    };

    logger.info('Query performance analysis completed');
    return results;

  } catch (error) {
    logger.error('Error analyzing query performance:', error);
    throw error;
  }
};

// Allow script to be run directly
if (require.main === module) {
  const connectDB = require('../config/database');
  
  connectDB()
    .then(() => analyzeQueryPerformance())
    .then((results) => {
      console.log('\n=== QUERY PERFORMANCE ANALYSIS ===\n');
      
      console.log('VIDEO QUERIES:');
      results.videoQueries.forEach(query => {
        console.log(`  ${query.name}:`);
        console.log(`    Execution Time: ${query.executionTimeMillis}ms`);
        console.log(`    Docs Examined: ${query.totalDocsExamined}`);
        console.log(`    Docs Returned: ${query.totalDocsReturned}`);
        console.log(`    Index Used: ${query.indexesUsed}`);
        console.log(`    Efficient: ${query.efficient ? 'Yes' : 'No'}`);
        console.log('');
      });

      console.log('POST QUERIES:');
      results.postQueries.forEach(query => {
        console.log(`  ${query.name}:`);
        console.log(`    Execution Time: ${query.executionTimeMillis}ms`);
        console.log(`    Docs Examined: ${query.totalDocsExamined}`);
        console.log(`    Docs Returned: ${query.totalDocsReturned}`);
        console.log(`    Index Used: ${query.indexesUsed}`);
        console.log(`    Efficient: ${query.efficient ? 'Yes' : 'No'}`);
        console.log('');
      });

      if (results.recommendations.length > 0) {
        console.log('RECOMMENDATIONS:');
        results.recommendations.forEach(rec => console.log(`  - ${rec}`));
        console.log('');
      }

      console.log('CURRENT INDEXES:');
      console.log('  Video Collection:', results.indexInfo.videoIndexes.length, 'indexes');
      console.log('  Post Collection:', results.indexInfo.postIndexes.length, 'indexes');
      
      process.exit(0);
    })
    .catch((error) => {
      console.error('Performance analysis failed:', error);
      process.exit(1);
    });
}

module.exports = { analyzeQueryPerformance };