import express from "express";
import { getMessages, sendMessage } from "../controller/messageController.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:userId", verifyToken, getMessages);
router.post("/send/:receiverId", verifyToken, sendMessage);
router.post("/", verifyToken, sendMessage);

export default router;
