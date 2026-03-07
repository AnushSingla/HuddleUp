const crypto = require('crypto');

// Simple CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and auth endpoints that don't modify state
  if (req.method === 'GET' || req.path === '/auth/login' || req.path === '/auth/register' || req.path === '/auth/refresh') {
    return next();
  }

  // For cookie-based authentication, we rely on SameSite cookies for CSRF protection
  // This is a simplified implementation - in production, you might want more robust CSRF protection
  
  // Check if request has valid authentication cookies
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;
  
  if (!accessToken && !refreshToken) {
    // No cookies present, likely not authenticated - let auth middleware handle it
    return next();
  }

  // For authenticated requests, check Origin/Referer headers
  const origin = req.get('Origin') || req.get('Referer');
  const allowedOrigins = [
    'https://huddle-up-beta.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174'
  ];

  if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    return res.status(403).json({ 
      success: false,
      message: 'CSRF protection: Invalid origin' 
    });
  }

  next();
};

module.exports = { csrfProtection };