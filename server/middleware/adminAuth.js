const User = require("../models/User");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");

/**
 * Verify that the authenticated user has admin privileges.
 * Must be used after verifyToken. Checks both isAdmin flag and role.
 */
const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return ResponseHandler.unauthorized(res, "Authentication required");
    }

    const user = await User.findById(req.user.id);
    if (!user || (!user.isAdmin && user.role !== "admin")) {
      return ResponseHandler.error(
        res,
        ERROR_CODES.FORBIDDEN,
        "Admin access required",
        403
      );
    }
    next();
  } catch (error) {
    return ResponseHandler.error(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Error verifying admin status",
      500
    );
  }
};

module.exports = { verifyAdmin };
