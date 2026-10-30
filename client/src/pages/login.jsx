import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  KeyRound,
  RotateCw,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const {
    login,
    sendLoginOtp,
    verifyLoginOtp,
    sendForgotPasswordOtp,
    resetPasswordWithOtp,
  } = useAuth();

  // Tab: "password" | "otp"
  const [authMode, setAuthMode] = useState("password");

  // Standard Password Login State
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Login State
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState("request"); // "request" | "verify"
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Forgot Password Modal State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [fpStep, setFpStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpShowPassword, setFpShowPassword] = useState(false);
  const [fpIsSending, setFpIsSending] = useState(false);
  const [fpIsResetting, setFpIsResetting] = useState(false);
  const [fpTimer, setFpTimer] = useState(0);

  // Countdown timer for Login OTP
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Countdown timer for Forgot Password OTP
  useEffect(() => {
    let interval = null;
    if (fpTimer > 0) {
      interval = setInterval(() => setFpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [fpTimer]);

  const handlePasswordLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Password Login
  const handlePasswordLoginSubmit = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(loginData.email, loginData.password);
      toast.success(res.message || "Welcome back to GoChat!");
      navigate("/chatPage");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to login. Please check your credentials.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send OTP for Login
  const handleSendLoginOtp = async (e) => {
    if (e) e.preventDefault();

    if (!otpEmail || !otpEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setIsSendingOtp(true);
      const res = await sendLoginOtp(otpEmail);
      toast.success(res.message || "OTP sent to your email!");
      setOtpStep("verify");
      setOtpTimer(60); // 60s cooldown
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to send OTP. Please check your email.";
      toast.error(errorMsg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP for Login
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();

    if (!otpEmail || !otpCode) {
      toast.error("Please enter both email and the 6-digit OTP.");
      return;
    }

    if (otpCode.trim().length < 6) {
      toast.error("OTP code must be 6 digits.");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const res = await verifyLoginOtp(otpEmail, otpCode.trim());
      toast.success(res.message || "OTP verified! Welcome back!");
      navigate("/chatPage");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Invalid or expired OTP. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Forgot Password: Step 1 - Send OTP
  const handleSendFpOtp = async (e) => {
    e.preventDefault();

    if (!fpEmail || !fpEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setFpIsSending(true);
      const res = await sendForgotPasswordOtp(fpEmail);
      toast.success(res.message || "Reset OTP sent to your email!");
      setFpStep(2);
      setFpTimer(60);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to send reset OTP. Check your email.";
      toast.error(errorMsg);
    } finally {
      setFpIsSending(false);
    }
  };

  // Forgot Password: Step 2 - Verify OTP & Set New Password
  const handleResetPasswordWithOtp = async (e) => {
    e.preventDefault();

    if (!fpEmail || !fpOtp || !fpNewPassword || !fpConfirmPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (fpOtp.trim().length < 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }

    if (fpNewPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (fpNewPassword !== fpConfirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setFpIsResetting(true);
      const res = await resetPasswordWithOtp(fpEmail, fpOtp.trim(), fpNewPassword);
      toast.success(res.message || "Password updated successfully!");
      setShowForgotPassword(false);
      // Reset form
      setFpStep(1);
      setFpEmail("");
      setFpOtp("");
      setFpNewPassword("");
      setFpConfirmPassword("");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to reset password. Please verify your OTP.";
      toast.error(errorMsg);
    } finally {
      setFpIsResetting(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans"
      style={{ background: "var(--bg-page)", color: "var(--text)" }}
    >
      {/* AMBIENT BACKGROUND GLOW LIGHTS */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* MESH PATTERN */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center">
        {/* LEFT BRAND SHOWCASE (Desktop) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden lg:flex lg:col-span-6 flex-col justify-between p-8 space-y-8"
        >
          {/* LOGO */}
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent font-heading">
                GoChat
              </span>
              <p className="text-xs text-emerald-400/80 font-medium">Next-Gen Messaging</p>
            </div>
          </Link>

          {/* HERO BANNER CARD */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ultra-Secure Chat Suite</span>
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight leading-tight font-heading">
              Welcome Back to <br />
              <span className="bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                Private Digital Spaces
              </span>
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Sign in with password or instant OTP verification to resume end-to-end encrypted
              conversations, voice calls, and real-time socket updates.
            </p>
          </div>

          {/* FEATURE POINTS */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-knowledge server encryption & privacy guarantee</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <KeyRound className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Instant One-Time Password (OTP) login directly via email</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT FORM CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-6 w-full max-w-md mx-auto"
        >
          <div
            className="rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--line)",
              boxShadow: "0 25px 60px var(--shadow-glow)",
            }}
          >
            {/* CARD HEADER */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold font-heading" style={{ color: "var(--text-strong)" }}>
                  Sign In
                </h1>
                <Link to="/" className="text-xs text-slate-400 hover:text-emerald-400 transition-colors">
                  ← Back to Home
                </Link>
              </div>
              <p className="text-sm text-slate-400">
                Choose your preferred login method to continue
              </p>
            </div>

            {/* TAB SELECTOR: PASSWORD VS OTP */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => setAuthMode("password")}
                className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  authMode === "password"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Password
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("otp")}
                className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  authMode === "otp"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Email OTP
              </button>
            </div>

            {/* PASSWORD LOGIN FORM */}
            {authMode === "password" && (
              <form onSubmit={handlePasswordLoginSubmit} className="space-y-5">
                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={loginData.email}
                      onChange={handlePasswordLoginChange}
                      required
                      className="w-full h-13 rounded-2xl pl-12 pr-4 text-sm transition-all shadow-inner theme-input"
                      style={{ borderColor: "var(--line)" }}
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setFpStep(1);
                        if (loginData.email) setFpEmail(loginData.email);
                      }}
                      className="text-xs font-medium text-emerald-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      value={loginData.password}
                      onChange={handlePasswordLoginChange}
                      required
                      className="w-full h-13 rounded-2xl pl-12 pr-12 text-sm transition-all shadow-inner theme-input"
                      style={{ borderColor: "var(--line)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to GoChat</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* OTP LOGIN FORM */}
            {authMode === "otp" && (
              <div className="space-y-5">
                {otpStep === "request" ? (
                  <form onSubmit={handleSendLoginOtp} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Enter Your Registered Email
                      </label>
                      <div className="relative">
                        <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          required
                          className="w-full h-13 rounded-2xl pl-12 pr-4 text-sm transition-all shadow-inner theme-input"
                          style={{ borderColor: "var(--line)" }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        We will send a 6-digit login OTP code to this email address.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="w-full h-13 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSendingOtp ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Sending Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Login OTP</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyLoginOtp} className="space-y-5">
                    <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-3.5 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <p className="text-cyan-300 font-medium">OTP Code sent to:</p>
                        <p className="text-white font-semibold truncate">{otpEmail}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpStep("request")}
                        className="text-cyan-400 hover:underline font-semibold shrink-0"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        6-Digit Verification Code
                      </label>
                      <div className="relative">
                        <KeyRound className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          required
                          autoFocus
                          className="w-full h-13 rounded-2xl pl-12 pr-4 text-center text-xl tracking-[0.35em] font-mono font-bold transition-all shadow-inner theme-input text-white"
                          style={{ borderColor: "var(--line)" }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Didn't receive the email?</span>
                      <button
                        type="button"
                        disabled={otpTimer > 0 || isSendingOtp}
                        onClick={() => handleSendLoginOtp()}
                        className="text-cyan-400 hover:underline font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend OTP"}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifyingOtp}
                      className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Verifying & Signing In...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Sign In</span>
                          <CheckCircle2 className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* DIVIDER */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">OR</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* REGISTER LINK */}
            <div className="text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-emerald-400 hover:underline">
                Create one now
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FORGOT PASSWORD MODAL (WITH EMAIL OTP VERIFICATION) */}
      <AnimatePresence>
        {showForgotPassword && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            style={{ background: "rgba(2,6,23,0.75)" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative"
              style={{
                background: "var(--bg-panel-strong)",
                border: "1px solid var(--line)",
                boxShadow: "0 25px 60px var(--shadow-glow)",
              }}
            >
              {/* MODAL HEADER */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white font-heading">
                    {fpStep === 1 ? "Forgot Password" : "Enter OTP & Reset"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {fpStep === 1
                      ? "Enter your email to receive a password reset OTP code."
                      : `Enter the 6-digit OTP code sent to ${fpEmail} and choose a new password.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="rounded-full bg-slate-800 p-2 text-slate-300 transition-colors hover:text-white shrink-0 ml-2"
                >
                  ✕
                </button>
              </div>

              {/* STEP 1: ENTER EMAIL TO SEND OTP */}
              {fpStep === 1 ? (
                <form onSubmit={handleSendFpOtp} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Your Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={fpEmail}
                        onChange={(e) => setFpEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                        className="w-full rounded-2xl border border-white/10 bg-slate-800/80 pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={fpIsSending}
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {fpIsSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* STEP 2: ENTER OTP & NEW PASSWORD */
                <form onSubmit={handleResetPasswordWithOtp} className="space-y-4">
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 flex items-center justify-between text-xs">
                    <span className="text-emerald-300 truncate">Sent to: {fpEmail}</span>
                    <button
                      type="button"
                      onClick={() => setFpStep(1)}
                      className="text-emerald-400 hover:underline font-semibold"
                    >
                      Change
                    </button>
                  </div>

                  {/* OTP INPUT */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={fpOtp}
                      onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      required
                      autoFocus
                      className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-2.5 text-center text-lg font-mono tracking-[0.25em] text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* NEW PASSWORD */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={fpShowPassword ? "text" : "password"}
                        value={fpNewPassword}
                        onChange={(e) => setFpNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        className="w-full rounded-2xl border border-white/10 bg-slate-800/80 pl-4 pr-11 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setFpShowPassword(!fpShowPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {fpShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Confirm New Password
                    </label>
                    <input
                      type={fpShowPassword ? "text" : "password"}
                      value={fpConfirmPassword}
                      onChange={(e) => setFpConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* RESEND TIMER */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Didn't get code?</span>
                    <button
                      type="button"
                      disabled={fpTimer > 0 || fpIsSending}
                      onClick={handleSendFpOtp}
                      className="text-emerald-400 hover:underline font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {fpTimer > 0 ? `Resend in ${fpTimer}s` : "Resend OTP"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={fpIsResetting}
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    {fpIsResetting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
