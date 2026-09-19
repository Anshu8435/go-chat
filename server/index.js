import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.js";
import AuthRouter from "./src/router/auth.route.js";
import PublicRouter from "./src/router/public.route.js";

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/auth", AuthRouter);
app.use("/contactUs", PublicRouter);

app.get("/", (req, res) => {
  res.send("GoChat Server is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  const ErrMessage = err.message || "Internal Server Error";
  const ErrStatusCode = err.statusCode || 500;
  console.error("Global Error Handler:", err);
  res.status(ErrStatusCode).json({ message: ErrMessage });
});

const PORT = process.env.PORT || 4500;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
