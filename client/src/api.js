import axios from 'axios';

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Enable cookies
});

// Token refresh interceptor
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

API.interceptors.request.use((config) => {
  // For backward compatibility, still check localStorage
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return API(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await API.post('/auth/refresh');
        
        // Update localStorage for backward compatibility
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        
        processQueue(null, response.data.data?.token);
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Clear localStorage and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
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
