import express from "express";
import {
  getUsersForSidebar,
  updateUserProfile,
  updateUserPassword,
} from "../controller/userController.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getUsersForSidebar);
router.put("/profile", verifyToken, updateUserProfile);
router.put("/password", verifyToken, updateUserPassword);

export default router;
