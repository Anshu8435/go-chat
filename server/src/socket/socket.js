import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  },
});

// Map of userId -> socketId
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[String(receiverId)];
};

// Middleware to authenticate socket connections via JWT or userId fallback
io.use((socket, next) => {
  try {
    const authHeader = socket.handshake.headers?.authorization;
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

    const secret = process.env.JWT_SECRET || "gochatapp_jwt_secret_key_2026";

    if (token) {
      try {
        const decoded = jwt.verify(token, secret);
        const resolvedId = decoded.id || decoded._id || decoded.userId;
        if (resolvedId) {
          socket.userId = String(resolvedId);
        }
      } catch (tokenErr) {
        console.warn("Socket JWT token verification fallback:", tokenErr.message);
      }
    }

    if (!socket.userId) {
      const explicitUserId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
      if (explicitUserId) {
        socket.userId = String(explicitUserId);
      }
    }

    if (!socket.userId) {
      return next(new Error("Authentication error: No valid token or userId provided"));
    }

    next();
  } catch (err) {
    console.error("Socket authentication failed:", err.message || err);
    next(new Error("Authentication error: Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log(`Socket connected: ${socket.id} (User: ${userId})`);

  if (userId) {
    userSocketMap[String(userId)] = socket.id;
    socket.join(`user:${String(userId)}`);
  }

  // Broadcast list of online user IDs to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id} (User: ${userId})`);
    if (userId) {
      delete userSocketMap[String(userId)];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
