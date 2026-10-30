import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader) {
      token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    }

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
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Authentication failed." });
  }
};
