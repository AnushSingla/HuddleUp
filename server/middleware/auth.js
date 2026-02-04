const jwt = require("jsonwebtoken");

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Save user data
    next();
  } catch (error) {
    return res.status(403).json({ message: "Session expired or invalid. Please login again." });
  }
};

module.exports = { verifyToken };
