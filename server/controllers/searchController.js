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
    console.error("Search error:", err);
    return res.status(500).json({ error: "Search failed" });
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
    console.error("Suggestions error:", err);
    return res.status(500).json([]);
  }
};

const trending = async (req, res) => {
  try {
    const results = await getTrendingSearches();
    return res.json(results);
  } catch (err) {
    console.error("Trending error:", err);
    return res.status(500).json([]);
  }
};

const history = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const results = await getSearchHistory(userId);
    return res.json(results);
  } catch (err) {
    console.error("History error:", err);
    return res.status(500).json([]);
  }
};

module.exports = { 
  search, 
  suggestions,
  trending,
  history
};
