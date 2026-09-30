import express from "express";
import {
  LoginUser,
  LogoutrUser,
  RegisterUser,
  ForgotPassword,
  GetMe,
} from "../controller/authController.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", LoginUser);
router.post("/register", RegisterUser);
router.post("/forgot-password", ForgotPassword);
router.post("/logout", LogoutrUser);
router.get("/me", verifyToken, GetMe);

export default router;
