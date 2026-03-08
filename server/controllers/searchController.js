const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");

const {
  performSearch,
  getAutocompleteSuggestions,
  getTrendingSearches,
  recordSearchHistory,
  getSearchHistory,
  getCacheKey,
  getCachedResults,
  setCachedResults
} = require("../services/searchService");

const search = async (req, res) => {
  try {
    const { q = "", limit = 10, page = 1, type = "all", sortBy = "relevance", category, dateFrom, minViews } = req.query;
    const query = q.trim();

    if (!query) {
      return res.json({ 
        videos: [], 
        posts: [],
        users: [], 
        hashtags: [], 
        videoTotal: 0, 
        postTotal: 0,
        userTotal: 0, 
        hashtagTotal: 0 
      });
    }

    const limitNum = Math.min(parseInt(limit) || 10, 50);
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const filters = { category, dateFrom, minViews };

    const cacheKey = getCacheKey(query, type, sortBy, pageNum, limitNum);
    const cached = await getCachedResults(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const results = await performSearch(query, type, sortBy, pageNum, limitNum, filters);
    
    await setCachedResults(cacheKey, results);

    const totalResults = (results.videoTotal || 0) + (results.postTotal || 0) + (results.userTotal || 0);
    await recordSearchHistory(req.user?.id, query, totalResults);

    return res.json(results);
  } catch (err) {
    // Handle validation errors specifically
    if (err.message.includes('Search query')) {
      logger.warn('Invalid search query', { error: err.message, query: req.query.q });
      return ResponseHandler.error(res, ERROR_CODES.VALIDATION_ERROR, err.message, 400);
    }
    
    logger.error('Search operation failed', { error: err.message, query: req.query });
    return ResponseHandler.error(res, ERROR_CODES.INTERNAL_ERROR, "Search failed", 500);
  }
};

const suggestions = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const query = q.trim();
    
    if (!query || query.length < 2) {
      return res.json([]);
    }

    const results = await getAutocompleteSuggestions(query);
    return res.json(results);
  } catch (err) {
    // Handle validation errors
    if (err.message.includes('Search query')) {
      logger.warn('Invalid autocomplete query', { error: err.message, query: req.query.q });
      return res.json([]);
    }
    
    logger.error('Autocomplete failed', { error: err.message });
    return res.status(500).json([]);
  }
};

const trending = async (req, res) => {
  try {
    const results = await getTrendingSearches();
    return res.json(results);
  } catch (err) {
    // Removed console.error - use logger instead
    return res.status(500).json([]);
  }
};

const history = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseHandler.unauthorized(res, "Authentication required");
    }
    const results = await getSearchHistory(userId);
    return res.json(results);
  } catch (err) {
    logger.error('Search history retrieval failed', { error: err.message, userId: req.user?.id });
    return ResponseHandler.error(res, ERROR_CODES.INTERNAL_ERROR, "Failed to retrieve search history", 500);
  }
};

module.exports = { 
  search, 
  suggestions,
  trending,
  history
};
