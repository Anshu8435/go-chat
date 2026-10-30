import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/mailer.js";

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || "gochatapp_jwt_secret_key_2026";
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
};

const formatUserResponse = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone || "",
  profilePic: user.profilePic || "",
  bio: user.bio || "",
  loginType: user.loginType,
});

export const RegisterUser = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, profilePic } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full Name, Email, and Password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered. Please login instead." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || "",
      profilePic: profilePic || "",
      loginType: "normal_user",
    });

    const token = generateToken(newUser._id);

    return res.status(201).json({
      message: "Account registered successfully!",
      token,
      user: formatUserResponse(newUser),
    });
  } catch (error) {
    next(error);
  }
};

export const LoginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.password && user.loginType !== "normal_user") {
      return res.status(400).json({ message: "This account logs in with OTP or Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful!",
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send OTP to user email for OTP-based Login
 */
export const SendLoginOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email. Please register first.",
      });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Invalidate existing login OTPs for this email
    await Otp.deleteMany({ email: normalizedEmail, type: "login" });

    // Store new OTP
    await Otp.create({
      email: normalizedEmail,
      otp,
      type: "login",
    });

    // Send email
    await sendOtpEmail({
      email: normalizedEmail,
      otp,
      type: "login",
    });

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
    });
  } catch (error) {
    console.error("SendLoginOtp Error:", error);
    return res.status(500).json({
      message: "Failed to send OTP to your email. Please verify your email configuration.",
    });
  }
};

/**
 * Verify Login OTP and authenticate user
 */
export const VerifyLoginOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP code are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const enteredOtp = String(otp).trim();

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      otp: enteredOtp,
      type: "login",
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid or expired OTP code. Please request a new code.",
      });
    }

    // Delete used OTP
    await Otp.deleteMany({ email: normalizedEmail, type: "login" });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Logged in successfully with OTP!",
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send OTP for Password Reset
 */
export const SendForgotPasswordOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Invalidate existing reset OTPs for this email
    await Otp.deleteMany({ email: normalizedEmail, type: "forgot-password" });

    await Otp.create({
      email: normalizedEmail,
      otp,
      type: "forgot-password",
    });

    await sendOtpEmail({
      email: normalizedEmail,
      otp,
      type: "forgot-password",
    });

    return res.status(200).json({
      success: true,
      message: `Password reset OTP has been sent to ${normalizedEmail}.`,
    });
  } catch (error) {
    console.error("SendForgotPasswordOtp Error:", error);
    return res.status(500).json({
      message: "Failed to send reset code to your email. Please try again.",
    });
  }
};

/**
 * Verify OTP and reset password
 */
export const ResetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP code, and new password are required.",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const enteredOtp = String(otp).trim();

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      otp: enteredOtp,
      type: "forgot-password",
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid or expired OTP code. Please request a new code.",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    // Invalidate OTP
    await Otp.deleteMany({ email: normalizedEmail, type: "forgot-password" });

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(String(newPassword), salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

export const LogoutrUser = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out successfully." });
};

export const GetMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ user: formatUserResponse(user) });
  } catch (error) {
    next(error);
  }
};
