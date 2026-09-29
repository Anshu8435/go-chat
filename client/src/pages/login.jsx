import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, Mail, Lock, MessageSquare, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
      const errorMsg = err.response?.data?.message || "Failed to login. Please check your credentials.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0B0F19] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans">
      
      {/* AMBIENT BACKGROUND GLOW LIGHTS */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* MESH PATTERN */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
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
              Sign in to resume end-to-end encrypted conversations, voice calls, and real-time socket updates.
            </p>
          </div>

          {/* FEATURE POINTS */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-knowledge server encryption & privacy guarantee</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Instant socket delivery with active online status</span>
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
          <div className="rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/12 p-8 sm:p-10 shadow-2xl shadow-emerald-950/30">
            
            {/* CARD HEADER */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-white font-heading">Sign In</h1>
                <Link to="/" className="text-xs text-slate-400 hover:text-emerald-400 transition-colors">
                  ← Back to Home
                </Link>
              </div>
              <p className="text-sm text-slate-400">Enter your credentials to access your account</p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
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
                    placeholder="name@example.com"
                    value={loginData.email}
                    onChange={handleChange}
                    required
                    className="w-full h-13 rounded-2xl bg-slate-800/60 border border-white/10 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:bg-slate-800/90 transition-all shadow-inner"
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
                    onClick={() => toast.error("Password reset functionality is under maintenance.")}
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
                    placeholder="••••••••••••"
                    value={loginData.password}
                    onChange={handleChange}
                    required
                    className="w-full h-13 rounded-2xl bg-slate-800/60 border border-white/10 pl-12 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:bg-slate-800/90 transition-all shadow-inner"
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
    </div>
  );
};

export default Login;
