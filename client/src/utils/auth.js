// utils/auth.js
import { API } from '../api';
import { disconnectSocket } from './socket';

export const getToken = () => {
  return localStorage.getItem("token");
};

export const isLoggedIn = () => {
  return !!getToken();
};

export const logout = async () => {
  try {
    // Disconnect socket before logout
    disconnectSocket();
    // Call the secure logout endpoint
    await API.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear localStorage
    localStorage.removeItem("token");
    // Redirect to login
    window.location.href = '/login';
  }
};

export const logoutAll = async () => {
  try {
    // Disconnect socket before logout
    disconnectSocket();
    // Call the logout all devices endpoint
    await API.post('/auth/logout-all');
  } catch (error) {
    console.error('Logout all error:', error);
  } finally {
    // Always clear localStorage
    localStorage.removeItem("token");
    // Redirect to login
    window.location.href = '/login';
  }
};

// ✅ NEW FUNCTION: Extract user ID from token
export const getUserId = () => {
  const token = getToken();
  if (!token) return null;

  try {
    // Decode JWT payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload._id || null;
  } catch (err) {
    console.error("Failed to parse token:", err);
    return null;
  }
};

// ✅ NEW FUNCTION: Check if user is authenticated (works with cookies)
export const checkAuth = async () => {
  try {
    const response = await API.get('/auth/profile');
    return response.data.user;
  } catch (error) {
    return null;
  }
};

// ✅ NEW FUNCTION: Get user sessions
export const getSessions = async () => {
  try {
    const response = await API.get('/auth/sessions');
    return response.data.data.sessions;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
};

// ✅ NEW FUNCTION: Revoke a specific session
export const revokeSession = async (sessionId) => {
  try {
    await API.delete(`/auth/sessions/${sessionId}`);
    return true;
  } catch (error) {
    console.error('Error revoking session:', error);
    return false;
  }
};
