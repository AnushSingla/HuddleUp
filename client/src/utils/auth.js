// utils/auth.js

export const getToken = () => {
  return localStorage.getItem("token");
};

export const isLoggedIn = () => {
  return !!getToken();
};

export const logout = () => {
  localStorage.removeItem("token");
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
