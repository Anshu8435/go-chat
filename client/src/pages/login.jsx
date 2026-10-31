import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ThemeQuickSwitch from "../component/ThemeQuickSwitch";
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
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const { login, sendLoginOtp, verifyLoginOtp, sendForgotPasswordOtp, resetPasswordWithOtp } =
    useAuth();
  const { activeTheme } = useTheme();

  const [authMode, setAuthMode] = useState("password");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Login state
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState("request"); // "request" | "verify"
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [fpStep, setFpStep] = useState(1);
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpShowPassword, setFpShowPassword] = useState(false);
  const [fpShowConfirmPassword, setFpShowConfirmPassword] = useState(false);
  const [fpIsSending, setFpIsSending] = useState(false);
  const [fpIsResetting, setFpIsResetting] = useState(false);
  const [fpTimer, setFpTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

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

  const handleSendLoginOtp = async (e) => {
    if (e) e.preventDefault();

    if (!otpEmail || !otpEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setIsSendingOtp(true);
      const res = await sendLoginOtp(otpEmail);
      toast.success(res?.message || "Verification code sent to your Gmail!");
      setOtpStep("verify");
      setOtpTimer(60);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to send OTP. Please check your email.";
      toast.error(errorMsg);
    } finally {
      setIsSendingOtp(false);
    }
  };

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
      const errorMsg = err.response?.data?.message || "Invalid or expired OTP. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSendFpOtp = async (e) => {
    e.preventDefault();

    if (!fpEmail || !fpEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setFpIsSending(true);
      const res = await sendForgotPasswordOtp(fpEmail);
      toast.success(res?.message || "Password reset code sent to your Gmail!");
      setFpStep(2);
      setFpTimer(60);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send reset OTP. Check your email.";
      toast.error(errorMsg);
    } finally {
      setFpIsSending(false);
    }
  };

  const handleVerifyFpOtp = (e) => {
    if (e) e.preventDefault();

    if (!fpOtp || fpOtp.trim().length < 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }

    setFpStep(3);
  };

  const handleCloseFpModal = () => {
    setShowForgotPassword(false);
    setFpStep(1);
    setFpEmail("");
    setFpOtp("");
    setFpNewPassword("");
    setFpConfirmPassword("");
    setFpShowPassword(false);
    setFpShowConfirmPassword(false);
  };

  const handleResetPasswordWithOtp = async (e) => {
    e.preventDefault();

    if (!fpEmail || !fpOtp || !fpNewPassword || !fpConfirmPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (fpOtp.trim().length < 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      setFpStep(2);
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
      handleCloseFpModal();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to reset password. Please verify your OTP.";
      toast.error(errorMsg);
      if (errorMsg.toLowerCase().includes("otp")) {
        setFpStep(2);
      }
    } finally {
      setFpIsResetting(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden transition-colors duration-200"
      style={{ backgroundColor: "var(--bg-page)", color: "var(--text-main)" }}
    >
      {/* Dynamic ambient theme glows */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-40 transition-all duration-700"
        style={{ backgroundColor: activeTheme.colors.primary }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-30 transition-all duration-700"
        style={{ backgroundColor: activeTheme.colors.secondary }}
      />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Branding Column */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:col-span-6 flex-col justify-between p-8 space-y-8"
        >
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${activeTheme.colors.primary}, ${activeTheme.colors.secondary})`,
              }}
            >
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight font-heading text-[var(--text-main)]">
                GoChat
              </span>
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: activeTheme.colors.primary }}
              >
                Enterprise Messaging
              </p>
            </div>
          </Link>

          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enterprise Messaging</span>
            </div>

            <h2 className="text-4xl font-black tracking-tight leading-tight font-heading text-[var(--text-main)]">
              Welcome Back to <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${activeTheme.colors.primary}, ${activeTheme.colors.secondary})`,
                }}
              >
                Secure Workspace
              </span>
            </h2>

            <p className="text-sm leading-relaxed text-[var(--text-muted)] max-w-md">
              Sign in with password or instant OTP verification to resume encrypted real-time
              conversations, voice calls, and direct contact syncing.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>256-bit encrypted message delivery via WebSocket cluster</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
              <KeyRound className="w-4 h-4 text-[var(--primary)] shrink-0" />
              <span>Instant One-Time Password (OTP) login directly via email</span>
            </div>
          </div>
        </motion.div>

        {/* Right Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 w-full max-w-md mx-auto"
        >
          <div
            className="rounded-3xl p-8 sm:p-10 shadow-2xl border border-[var(--border)] bg-[var(--bg-card)] backdrop-blur-2xl"
            style={{
              boxShadow: "0 20px 50px -10px var(--shadow-glow)",
            }}
          >
            {/* Header & Theme Switcher */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black font-heading text-[var(--text-main)]">
                  Sign In
                </h1>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Choose your authentication method
                </p>
              </div>
              <ThemeQuickSwitch compact />
            </div>

            {/* Auth Mode Toggle Tabs */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] mb-6">
              <button
                type="button"
                onClick={() => setAuthMode("password")}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  authMode === "password"
                    ? "theme-button-primary"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Password
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("otp")}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  authMode === "otp"
                    ? "theme-button-primary"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Email OTP
              </button>
            </div>

            {/* Password Login Form */}
            {authMode === "password" && (
              <form onSubmit={handlePasswordLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={loginData.email}
                      onChange={handlePasswordLoginChange}
                      placeholder="name@example.com"
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] pl-10 pr-4 py-2.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition shadow-inner"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      value={loginData.password}
                      onChange={handlePasswordLoginChange}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] pl-10 pr-10 py-2.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition shadow-inner"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="theme-button-primary w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In with Password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Email OTP Login Form */}
            {authMode === "otp" && (
              <div className="space-y-4">
                {otpStep === "request" ? (
                  <form onSubmit={handleSendLoginOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-muted)]">
                        Your Registered Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                        <input
                          type="email"
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] pl-10 pr-4 py-2.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition shadow-inner"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="theme-button-primary w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSendingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending Code...
                        </>
                      ) : (
                        <>
                          Send One-Time Password
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                    <div className="p-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-[10px] text-[var(--text-muted)]">Code sent to:</p>
                        <p className="text-xs font-bold text-[var(--text-main)] truncate">
                          {otpEmail}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpStep("request")}
                        className="text-[11px] font-semibold text-[var(--primary)] hover:underline ml-2"
                      >
                        Change
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-muted)]">
                        Enter 6-Digit OTP Code
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="123456"
                          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] pl-10 pr-4 py-2.5 text-xs text-[var(--text-main)] tracking-widest text-center font-mono font-bold outline-none focus:border-[var(--primary)] transition"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifyingOtp}
                      className="theme-button-primary w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying Code...
                        </>
                      ) : (
                        <>
                          Verify & Sign In
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      {otpTimer > 0 ? (
                        <p className="text-[11px] text-[var(--text-muted)]">
                          Resend code in {otpTimer}s
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendLoginOtp}
                          disabled={isSendingOtp}
                          className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
                        >
                          Didn&apos;t receive code? Resend
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Footer prompt */}
            <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
              <p className="text-xs text-[var(--text-muted)]">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-[var(--primary)] hover:underline ml-1"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--primary)]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-main)]">Reset Password</h3>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {fpStep === 1
                        ? "Step 1: Enter your registered email"
                        : fpStep === 2
                        ? "Step 2: Enter 6-digit OTP"
                        : "Step 3: Set your new password"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseFpModal}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {fpStep === 1 && (
                <form onSubmit={handleSendFpOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      value={fpEmail}
                      onChange={(e) => setFpEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={fpIsSending}
                    className="theme-button-primary w-full py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {fpIsSending ? "Sending OTP..." : "Send Reset OTP"}
                  </button>
                </form>
              )}

              {fpStep === 2 && (
                <form onSubmit={handleVerifyFpOtp} className="space-y-4">
                  <div className="rounded-xl bg-[var(--bg-surface)] p-3 border border-[var(--border)] text-center">
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Verification code sent to{" "}
                      <span className="font-semibold text-[var(--text-main)]">{fpEmail}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={fpOtp}
                      onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-base text-[var(--text-main)] text-center font-mono font-bold tracking-widest outline-none focus:border-[var(--primary)] transition"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <button
                      type="button"
                      onClick={() => setFpStep(1)}
                      className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>

                    <div>
                      {fpTimer > 0 ? (
                        <span className="text-[11px] text-[var(--text-muted)]">
                          Resend in {fpTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendFpOtp}
                          disabled={fpIsSending}
                          className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={fpOtp.trim().length !== 6}
                    className="theme-button-primary w-full py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    Continue to Change Password
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {fpStep === 3 && (
                <form onSubmit={handleResetPasswordWithOtp} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={fpShowPassword ? "text" : "password"}
                        value={fpNewPassword}
                        onChange={(e) => setFpNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition pr-10"
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setFpShowPassword(!fpShowPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                      >
                        {fpShowPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={fpShowConfirmPassword ? "text" : "password"}
                        value={fpConfirmPassword}
                        onChange={(e) => setFpConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setFpShowConfirmPassword(!fpShowConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                      >
                        {fpShowConfirmPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <button
                      type="button"
                      onClick={() => setFpStep(2)}
                      className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to OTP
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={fpIsResetting}
                    className="theme-button-primary w-full py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
                  >
                    {fpIsResetting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        Reset & Save Password
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
