const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Transaction Helper Utility
 * Provides safe transaction handling for MongoDB operations
 */

class TransactionHelper {
  /**
   * Execute operations within a transaction
   * @param {Function} operations - Async function containing database operations
   * @param {Object} options - Transaction options
   * @returns {Promise} Result of operations
   */
  static async withTransaction(operations, options = {}) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction({
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
        ...options
      });

      logger.debug('Transaction started', { sessionId: session.id });

      const result = await operations(session);

      await session.commitTransaction();
      logger.debug('Transaction committed successfully', { sessionId: session.id });

      return result;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Transaction aborted due to error', {
        sessionId: session.id,
        error: error.message,
        stack: error.stack
      });
      throw error;
    } finally {
      session.endSession();
      logger.debug('Transaction session ended', { sessionId: session.id });
    }
  }

  /**
   * Execute multiple operations in parallel within a transaction
   * @param {Array<Function>} operations - Array of async functions
   * @param {Object} options - Transaction options
   * @returns {Promise<Array>} Results of all operations
   */
  static async withTransactionParallel(operations, options = {}) {
    return this.withTransaction(async (session) => {
      const promises = operations.map(op => op(session));
      return Promise.all(promises);
    }, options);
  }

  /**
   * Retry transaction on transient errors
   * @param {Function} operations - Async function containing database operations
   * @param {Number} maxRetries - Maximum number of retries
   * @param {Object} options - Transaction options
   * @returns {Promise} Result of operations
   */
  static async withRetry(operations, maxRetries = 3, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.withTransaction(operations, options);
      } catch (error) {
        lastError = error;
        
        // Check if error is transient (can be retried)
        const isTransient = 
          error.hasErrorLabel?.('TransientTransactionError') ||
          error.code === 112 || // WriteConflict
          error.code === 251;   // NoSuchTransaction
        
        if (!isTransient || attempt === maxRetries) {
          logger.error('Transaction failed after retries', {
            attempt,
            maxRetries,
            error: error.message
          });
          throw error;
        }
        
        logger.warn('Transaction failed, retrying', {
          attempt,
          maxRetries,
          error: error.message
        });
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
    
    throw lastError;
  }

  /**
   * Check if transactions are supported
   * @returns {Boolean} True if transactions are supported
   */
  static isTransactionSupported() {
    try {
      const connection = mongoose.connection;
      
      // Transactions require replica set or sharded cluster
      if (!connection.readyState) {
        return false;
      }
      
      // Check if using replica set
      const topology = connection.client?.topology;
      return topology?.description?.type === 'ReplicaSetWithPrimary' ||
             topology?.description?.type === 'Sharded';
    } catch (error) {
      logger.warn('Could not determine transaction support', { error: error.message });
      return false;
    }
  }

  /**
   * Execute with transaction if supported, otherwise execute normally
   * @param {Function} operations - Async function containing database operations
   * @param {Object} options - Transaction options
   * @returns {Promise} Result of operations
   */
  static async withTransactionIfSupported(operations, options = {}) {
    if (this.isTransactionSupported()) {
      return this.withTransaction(operations, options);
    } else {
      logger.warn('Transactions not supported, executing without transaction');
      return operations(null);
    }
  }
}

module.exports = TransactionHelper;
