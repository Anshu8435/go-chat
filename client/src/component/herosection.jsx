import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Lock, Sparkles, MessageSquare, Video, PhoneCall, ArrowRight, CheckCircle2, Globe2 } from "lucide-react";
import HeroImage from "../assets/heroimg.webp";

const Herosection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#0B0F19] text-white flex flex-col justify-center">
      
      {/* AMBIENT BACKGROUND GLOW LIGHTS */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* BACKGROUND MESH GRID */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT CONTENT COLUMN */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* FEATURE BADGE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>✦ Next-Gen Private Messaging Platform</span>
            </motion.div>

            {/* HEADLINE */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1] font-heading"
            >
              Connect <br />
              <span className="bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                Privately & Freely
              </span>
            </motion.h1>

            {/* SUBTITLE */}
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-400 max-w-xl font-normal leading-relaxed"
            >
              Experience seamless, ultra-fast real-time messaging with military-grade privacy. Built for smooth conversations across any device worldwide.
            </motion.p>

            {/* CTA BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                onClick={() => navigate("/chatPage")}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <span>Launch Chat App</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/10 font-semibold text-base backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Create Free Account</span>
              </button>
            </motion.div>

            {/* QUICK STATS / TRUST INDICATORS */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg"
            >
              <div>
                <p className="text-2xl font-bold text-white font-heading">0ms</p>
                <p className="text-xs text-slate-400 font-medium">Real-Time Sync</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400 font-heading">100%</p>
                <p className="text-xs text-slate-400 font-medium">End-to-End Secure</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-300 font-heading">24/7</p>
                <p className="text-xs text-slate-400 font-medium">Global Access</p>
              </div>
            </motion.div>

          </div>

          {/* RIGHT PREVIEW / MOCKUP COLUMN */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto max-w-md lg:max-w-none"
            >
              
              {/* GLASS PREVIEW CARD CONTAINER */}
              <div className="relative rounded-3xl p-6 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-emerald-950/40 overflow-hidden">
                
                {/* CARD HEADER */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-white shadow-md">
                        S
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Sarah Jenkins</h4>
                      <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Online • Active now
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-full bg-white/5 text-slate-300 hover:text-white">
                      <Video className="w-4 h-4" />
                    </span>
                    <span className="p-2 rounded-full bg-white/5 text-slate-300 hover:text-white">
                      <PhoneCall className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* MOCK CHAT MESSAGES */}
                <div className="space-y-3 py-2">
                  {/* Message 1 */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-2xl rounded-tl-xs bg-slate-800/80 border border-white/5 text-xs text-slate-200 shadow-sm">
                      Hey! Did you check out the new ultra-luxury GoChat design?
                      <span className="block text-[9px] text-slate-400 mt-1 text-right">10:42 AM</span>
                    </div>
                  </div>

                  {/* Message 2 */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] p-3 rounded-2xl rounded-tr-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-xs text-white font-medium shadow-md shadow-emerald-600/20">
                      Yes! The glassmorphism and real-time socket sync look unbelievable. 🚀
                      <span className="block text-[9px] text-emerald-200 mt-1 text-right">10:43 AM ✓✓</span>
                    </div>
                  </div>

                  {/* Message 3 */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-2xl rounded-tl-xs bg-slate-800/80 border border-white/5 text-xs text-slate-200 shadow-sm">
                      End-to-end security is also lightning fast!
                      <span className="block text-[9px] text-slate-400 mt-1 text-right">10:44 AM</span>
                    </div>
                  </div>
                </div>

                {/* MOCK SECURITY FOOTER */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    End-to-End Encrypted
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                    256-BIT SSL
                  </span>
                </div>

              </div>

              {/* FLOATING DECORATIVE BADGE */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-slate-900/90 border border-white/15 p-3.5 rounded-2xl shadow-xl backdrop-blur-xl flex items-center gap-3"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">WebSocket Instant</p>
                  <p className="text-[10px] text-slate-400">0ms Message Delivery</p>
                </div>
              </motion.div>

            </motion.div>
          </div>

        </div>

        {/* BOTTOM FEATURES GRID */}
        <div className="mt-20 pt-10 border-t border-white/10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 font-heading">Total Privacy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">No tracking, no data monetization. Your conversations remain yours alone.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 font-heading">Instant Sockets</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Powered by high-throughput real-time sockets for zero-delay chatting.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 font-heading">Cross-Platform</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Available seamless on web, tablet, desktop, and mobile devices anywhere.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 font-heading">Luxury Aesthetic</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Crafted with modern minimal dark glassmorphism and refined typography.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Herosection;
