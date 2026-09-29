import express from "express";
import { getUsersForSidebar } from "../controller/userController.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getUsersForSidebar);

export default router;
