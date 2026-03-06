import axios from 'axios';

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
