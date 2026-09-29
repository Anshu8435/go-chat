import express from "express";
import { getMessages, sendMessage, markMessagesAsRead } from "../controller/messageController.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:userId", verifyToken, getMessages);
router.post("/send/:receiverId", verifyToken, sendMessage);
router.post("/", verifyToken, sendMessage);
router.put("/read/:partnerId", verifyToken, markMessagesAsRead);

export default router;
