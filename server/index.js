import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.js";
import AuthRouter from "./src/router/auth.route.js";
import PublicRouter from "./src/router/public.route.js";
import UserRouter from "./src/router/user.route.js";
import MessageRouter from "./src/router/message.route.js";
import { app, server } from "./src/socket/socket.js";

// Middleware - CORS configuration to support all localhost ports in dev
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/auth", AuthRouter);
app.use("/contactUs", PublicRouter);

// User & Message Routes (supports both /users and /api/users, /messages and /api/messages)
app.use("/users", UserRouter);
app.use("/api/users", UserRouter);

app.use("/messages", MessageRouter);
app.use("/api/messages", MessageRouter);

app.get("/", (req, res) => {
  res.send("GoChat Server is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  let message = err.message || "Internal Server Error";
  let statusCode = err.statusCode || 500;

  // Handle Mongoose Validation Errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value entered for ${field}. Please use another value.`;
  }

  // Handle Mongoose Cast Error (Invalid ObjectId, etc.)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  console.error("Global Error Handler:", err);
  res.status(statusCode).json({ message });
});

// Connect DB first, then start listening for HTTP & Socket.IO requests
const startServer = async () => {
  const PORT = process.env.PORT || 4500;

  try {
    await connectDB();
  } catch (err) {
    console.error("Database connection attempt failed:", err.message || err);
  }

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n⚠️  Port ${PORT} is already in use!`);
      console.error(`Another server process is already running on port ${PORT}.`);
      console.error(`Please stop the existing terminal process or kill the PID using port ${PORT}.\n`);
    } else {
      console.error("Server error:", err);
    }
  });

  server.listen(PORT, () => {
    console.log(`Server & Socket.IO running on port ${PORT}`);
  });
};

startServer();
