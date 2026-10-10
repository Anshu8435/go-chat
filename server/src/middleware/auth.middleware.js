import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    let token = null;

    // 1. Authorization header takes highest priority
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader) {
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else {
        token = authHeader;
      }
    }

    // 2. Cookie fallback if no header is present
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const secret = process.env.JWT_SECRET || "gochatapp_jwt_secret_key_2026";
    let decoded;

    try {
      decoded = jwt.verify(token, secret);
    } catch {
      // If header token was invalid, try cookie as secondary fallback if available
      if (req.cookies?.token && token !== req.cookies.token) {
        try {
          decoded = jwt.verify(req.cookies.token, secret);
        } catch {
          return res.status(401).json({ message: "Invalid or expired token." });
        }
      } else {
        return res.status(401).json({ message: "Invalid or expired token." });
      }
    }

    const userId = decoded.id || decoded._id || decoded.userId;
    req.user = { ...decoded, id: userId, _id: userId };
    next();
  } catch (error) {
    console.error("Token verification error:", error.message || error);
    return res.status(401).json({ message: "Authentication failed. Please login again." });
  }
};
