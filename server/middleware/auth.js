const jwt = require("jsonwebtoken");
const { getJWTSecret } = require("../utils/validateEnv");

const verifyToken = (req, res, next) => {
  // Allow preflight CORS requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Login required to perform this action" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Invalid authentication format" });
  }

  try {
    // Use safe JWT secret with proper error handling
    const jwtSecret = getJWTSecret();
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // Save user data
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    
    if (error.message.includes('JWT_SECRET')) {
      // Configuration error - don't expose to client
      return res.status(500).json({ 
        message: "Authentication service temporarily unavailable. Please try again later.",
        error: "AUTH_CONFIG_ERROR"
      });
    }
    
    // Token-related errors (expired, invalid, etc.)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: "Session expired or invalid. Please login again." });
    }
    
    // Other unexpected errors
    console.error('Unexpected auth error:', error);
    return res.status(500).json({ 
      message: "Authentication failed. Please try again.",
      error: "AUTH_ERROR"
    });
  }
};

module.exports = { verifyToken, protect: verifyToken };
