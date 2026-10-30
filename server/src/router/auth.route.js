import express from "express";
import {
  LoginUser,
  LogoutrUser,
  RegisterUser,
  SendLoginOtp,
  VerifyLoginOtp,
  SendForgotPasswordOtp,
  ResetPasswordWithOtp,
  ForgotPassword,
  GetMe,
} from "../controller/authController.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", LoginUser);
router.post("/register", RegisterUser);

// OTP Login routes
router.post("/send-login-otp", SendLoginOtp);
router.post("/verify-login-otp", VerifyLoginOtp);

// Forgot password with OTP verification
router.post("/forgot-password/send-otp", SendForgotPasswordOtp);
router.post("/forgot-password/reset", ResetPasswordWithOtp);
router.post("/forgot-password", ForgotPassword);

router.post("/logout", LogoutrUser);
router.get("/me", verifyToken, GetMe);

export default router;
