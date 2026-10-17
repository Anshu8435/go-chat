import express from "express";
import {
  getUsersForSidebar,
  updateUserProfile,
  updateUserPassword,
  getOnlineVisibilitySettings,
  updateOnlineVisibilitySettings,
} from "../controller/userController.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getUsersForSidebar);
router.put("/profile", verifyToken, updateUserProfile);
router.put("/password", verifyToken, updateUserPassword);

// Selective Online Visibility Privacy Routes
router.get("/privacy/online-visibility", verifyToken, getOnlineVisibilitySettings);
router.put("/privacy/online-visibility", verifyToken, updateOnlineVisibilitySettings);

export default router;
