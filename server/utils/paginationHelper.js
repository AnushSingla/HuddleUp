/**
 * Pagination Helper Utility
 * Provides consistent pagination across all endpoints
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

class PaginationHelper {
  /**
   * Parse and validate pagination parameters
   * @param {Object} query - Request query parameters
   * @returns {Object} Validated pagination params
   */
  static getPaginationParams(query) {
    const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
    let limit = parseInt(query.limit) || DEFAULT_LIMIT;
    
    // Enforce maximum limit to prevent abuse
    limit = Math.min(limit, MAX_LIMIT);
    
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
  }

  /**
   * Create pagination metadata
   * @param {Number} total - Total number of documents
   * @param {Number} page - Current page
   * @param {Number} limit - Items per page
   * @returns {Object} Pagination metadata
   */
  static createPaginationMeta(total, page, limit) {
    const pages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
      nextPage: page < pages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    };
  }

  /**
   * Create paginated response
   * @param {Array} data - Array of documents
   * @param {Number} total - Total number of documents
   * @param {Number} page - Current page
   * @param {Number} limit - Items per page
   * @returns {Object} Paginated response
   */
  static createPaginatedResponse(data, total, page, limit) {
    return {
      data,
      pagination: this.createPaginationMeta(total, page, limit)
    };
  }

  /**
   * Execute paginated query
   * @param {Object} model - Mongoose model
   * @param {Object} query - Query filter
   * @param {Object} options - Query options (select, populate, sort)
   * @param {Object} paginationParams - Pagination parameters
   * @returns {Promise<Object>} Paginated results
   */
  static async executePaginatedQuery(model, query, options = {}, paginationParams) {
    const { page, limit, skip } = paginationParams;
    
    let queryBuilder = model.find(query);
    
    // Apply options
    if (options.select) queryBuilder = queryBuilder.select(options.select);
    if (options.populate) {
      if (Array.isArray(options.populate)) {
        options.populate.forEach(pop => queryBuilder = queryBuilder.populate(pop));
      } else {
        queryBuilder = queryBuilder.populate(options.populate);
      }
    }
    if (options.sort) queryBuilder = queryBuilder.sort(options.sort);
    
    // Apply pagination
    queryBuilder = queryBuilder.limit(limit).skip(skip).lean();
    
    // Execute query and count in parallel
    const [data, total] = await Promise.all([
      queryBuilder.exec(),
      model.countDocuments(query)
    ]);
    
    return this.createPaginatedResponse(data, total, page, limit);
  }

  /**
   * Execute paginated aggregation
   * @param {Object} model - Mongoose model
   * @param {Array} pipeline - Aggregation pipeline
   * @param {Object} paginationParams - Pagination parameters
   * @returns {Promise<Object>} Paginated results
   */
  static async executePaginatedAggregation(model, pipeline, paginationParams) {
    const { page, limit, skip } = paginationParams;
    
    // Create count pipeline (without pagination stages)
    const countPipeline = [
      ...pipeline,
      { $count: 'total' }
    ];
    
    // Create data pipeline (with pagination)
    const dataPipeline = [
      ...pipeline,
      { $skip: skip },
      { $limit: limit }
    ];
    
    // Execute both pipelines in parallel
    const [dataResult, countResult] = await Promise.all([
      model.aggregate(dataPipeline),
      model.aggregate(countPipeline)
    ]);
    
    const data = dataResult;
    const total = countResult[0]?.total || 0;
    
    return this.createPaginatedResponse(data, total, page, limit);
  }
}

module.exports = PaginationHelper;
