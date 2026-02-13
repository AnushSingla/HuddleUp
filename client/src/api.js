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

export const getNotifications = async (token) => {
  return fetch("/api/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
};
