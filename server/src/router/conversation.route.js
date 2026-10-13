import express from "express";
import {
  getChats,
  getMessageRequests,
  acceptMessageRequest,
  deleteMessageRequest,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from "../controller/conversationController.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/chats", verifyToken, getChats);
router.get("/requests", verifyToken, getMessageRequests);
router.post("/requests/:conversationId/accept", verifyToken, acceptMessageRequest);
router.post("/requests/:conversationId/delete", verifyToken, deleteMessageRequest);

// Blocking & Unblocking
router.post("/block", verifyToken, blockUser);
router.post("/unblock", verifyToken, unblockUser);
router.get("/blocked", verifyToken, getBlockedUsers);

export default router;
