import axios from 'axios';

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper function to check if error is retryable
const isRetryableError = (error) => {
  if (!error.response) {
    // Network errors (no response received)
    return true;
  }
  
  const status = error.response.status;
  // Retry on 5xx server errors and 429 (rate limit)
  return status >= 500 || status === 429;
};

// Helper function to calculate exponential backoff delay
const getRetryDelay = (retryCount) => {
  return INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
};

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Initialize retry count
  config.retryCount = config.retryCount || 0;
  
  return config;
});

// Response interceptor for retry logic
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Check if we should retry
    if (!config || config.retryCount >= MAX_RETRIES || !isRetryableError(error)) {
      return Promise.reject(error);
    }
    
    // Increment retry count
    config.retryCount += 1;
    
    // Calculate delay with exponential backoff
    const retryDelay = getRetryDelay(config.retryCount - 1);
    
    // Wait before retrying
    await delay(retryDelay);
    
    // Retry the request
    return API(config);
  }
);

export const getNotifications = async () => {
  const res = await API.get("/notifications");
  return res.data;
};

// ─── Search ──────────────────────────────────────────────────────────────────

/**
 * @param {{ q: string, type?: string, page?: number, limit?: number, sortBy?: string }} params
 */
export const searchContent = ({ q, type = "all", page = 1, limit = 10, sortBy = "relevance" }) =>
  API.get("/search", { params: { q, type, page, limit, sortBy } }).then((r) => r.data);

export const fetchSuggestions = (q) =>
  API.get("/search/suggestions", { params: { q } }).then((r) => r.data);
