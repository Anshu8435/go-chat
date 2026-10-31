import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  MessageSquare,
  Video,
  PhoneCall,
  ArrowRight,
  Globe2,
  Palette,
} from "lucide-react";

const Herosection = () => {
  const navigate = useNavigate();
  const { activeTheme } = useTheme();

  return (
    <div
      className="relative min-h-[calc(100vh-80px)] overflow-hidden flex flex-col justify-center transition-colors duration-200"
      style={{ backgroundColor: "var(--bg-page)", color: "var(--text-main)" }}
    >
      {/* Theme ambient glows */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-30 transition-all duration-700"
        style={{ backgroundColor: activeTheme.colors.primary }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full blur-[130px] pointer-events-none opacity-25 transition-all duration-700"
        style={{ backgroundColor: activeTheme.colors.secondary }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--primary)] text-xs font-bold tracking-wider uppercase backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>✦ Enterprise Realtime Messaging</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] font-heading text-[var(--text-main)]"
            >
              Connect <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${activeTheme.colors.primary}, ${activeTheme.colors.secondary})`,
                }}
              >
                Privately & Freely
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-[var(--text-muted)] max-w-xl font-normal leading-relaxed"
            >
              Experience seamless, ultra-fast real-time messaging with military-grade privacy.
              Crafted with modern Apple-inspired minimalism, Slack-like organization, and seven
              distinctive enterprise themes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-2"
            >
              <button
                type="button"
                onClick={() => navigate("/chatPage")}
                className="theme-button-primary group relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Launch Chat App</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-main)] font-bold text-xs transition-all duration-300 cursor-pointer"
              >
                <Palette className="w-4 h-4 text-[var(--primary)]" />
                <span>Theme Studio (7 Themes)</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/contact")}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold text-xs transition-all duration-300 cursor-pointer"
              >
                <span>Contact Enterprise</span>
              </button>
            </motion.div>

            {/* Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--border)] max-w-lg"
            >
              <div>
                <p className="text-2xl font-black font-heading text-[var(--text-main)]">0ms</p>
                <p className="text-xs text-[var(--text-muted)] font-medium">Real-Time Sync</p>
              </div>
              <div>
                <p className="text-2xl font-black font-heading text-emerald-400">100%</p>
                <p className="text-xs text-[var(--text-muted)] font-medium">End-to-End Secure</p>
              </div>
              <div>
                <p className="text-2xl font-black font-heading text-[var(--primary)]">7 Themes</p>
                <p className="text-xs text-[var(--text-muted)] font-medium">Enterprise Styling</p>
              </div>
            </motion.div>
          </div>

          {/* Right Mockup Window */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-md lg:max-w-none"
            >
              <div
                className="relative rounded-3xl p-6 border shadow-2xl backdrop-blur-2xl overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border)",
                  boxShadow: "0 25px 60px -15px var(--shadow-glow)",
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-sm"
                        style={{
                          background: `linear-gradient(135deg, ${activeTheme.colors.primary}, ${activeTheme.colors.secondary})`,
                        }}
                      >
                        SJ
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[var(--bg-card)] rounded-full" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-main)]">Sarah Jenkins</h4>
                      <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Active now • Encrypted
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border)]">
                      <Video className="w-3.5 h-3.5" />
                    </span>
                    <span className="p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border)]">
                      <PhoneCall className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Messages preview */}
                <div className="space-y-3 py-2 text-xs">
                  <div className="flex justify-start">
                    <div
                      className="max-w-[85%] p-3 rounded-2xl rounded-tl-sm border shadow-sm leading-relaxed"
                      style={{
                        backgroundColor: "var(--bubble-recv-bg)",
                        color: "var(--bubble-recv-text)",
                        borderColor: "var(--bubble-recv-border)",
                      }}
                    >
                      Hey! Did you see how every page instantly inherits our enterprise design
                      tokens?
                      <span className="block text-[9px] text-[var(--text-muted)] mt-1 text-right">
                        10:42 AM
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div
                      className="max-w-[85%] p-3 rounded-2xl rounded-tr-sm text-white font-medium shadow-md leading-relaxed"
                      style={{
                        background:
                          activeTheme.id === "obsidian-dark" ? "#27272A" : "var(--bubble-sent-bg)",
                      }}
                    >
                      Yes! The design feels completely premium—Apple minimalism with Slack
                      hierarchy. 🚀
                      <span className="block text-[9px] text-white/80 mt-1 text-right">
                        10:43 AM ✓✓
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div
                      className="max-w-[85%] p-3 rounded-2xl rounded-tl-sm border shadow-sm leading-relaxed"
                      style={{
                        backgroundColor: "var(--bubble-recv-bg)",
                        color: "var(--bubble-recv-text)",
                        borderColor: "var(--bubble-recv-border)",
                      }}
                    >
                      End-to-end security is also active with zero latency.
                      <span className="block text-[9px] text-[var(--text-muted)] mt-1 text-right">
                        10:44 AM
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer security badge */}
                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    End-to-End Encrypted
                  </span>
                  <span className="bg-[var(--bg-surface)] text-[var(--primary)] px-2.5 py-0.5 rounded-full border border-[var(--border)] font-mono font-bold">
                    256-BIT SSL
                  </span>
                </div>
              </div>

              {/* Floating socket pill */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 left-2 sm:-left-4 border border-[var(--border)] bg-[var(--bg-card)] p-3 rounded-2xl shadow-xl backdrop-blur-xl flex items-center gap-2.5"
              >
                <div className="p-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-main)]">WebSocket Cluster</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Real-time instant delivery</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* 4 Feature Cards */}
        <div className="mt-20 pt-10 border-t border-[var(--border)] grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-300 hover:border-[var(--primary)] shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-surface)] text-[var(--primary)] border border-[var(--border)] flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-main)] mb-1 font-heading">
              Total Privacy
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              No tracking, no data monetization. Your conversations remain encrypted and yours
              alone.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-300 hover:border-[var(--primary)] shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-surface)] text-emerald-400 border border-[var(--border)] flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-main)] mb-1 font-heading">
              Instant Sockets
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Powered by high-throughput WebSocket socket.io clustering for zero-delay chatting.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-300 hover:border-[var(--primary)] shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-surface)] text-[var(--secondary)] border border-[var(--border)] flex items-center justify-center mb-4">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-main)] mb-1 font-heading">
              Cross-Platform
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Seamlessly responsive on mobile, tablet, and widescreen desktop monitors.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-300 hover:border-[var(--primary)] shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-surface)] text-[var(--highlight)] border border-[var(--border)] flex items-center justify-center mb-4">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-main)] mb-1 font-heading">
              Seven Enterprise Themes
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Switch between five creative themes, dedicated dark, and porcelain light with 1-click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Herosection;
