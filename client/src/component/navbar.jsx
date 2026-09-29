import React, { useState } from "react";
import { ChevronDown, MessageSquare, Shield, Sparkles, Globe, LogOut, User as UserIcon, Palette, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GochatIcon from "../assets/Gochat.png";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleThemeChange = (e) => {
    const theme = e.target.value;
    setSelectedTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0B0F19]/85 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* BRAND LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <MessageSquare className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0B0F19] rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent font-heading">
                GoChat
              </span>
              <span className="text-[10px] font-medium tracking-widest uppercase text-emerald-400/80 -mt-1">
                Luxury Messaging
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
            
            {/* Features Dropdown */}
            <div className="relative group px-1">
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/5 transition-all">
                <span>Features</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
              </button>

              {/* Glass Dropdown Menu */}
              <div className="absolute left-0 mt-3 w-64 p-2 rounded-2xl bg-[#0F172A]/95 backdrop-blur-2xl border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-50">
                <a
                  href="#privacy"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 text-sm font-medium transition-colors"
                >
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-white">End-to-End Privacy</p>
                    <p className="text-xs text-slate-400">Zero data retention policy</p>
                  </div>
                </a>
                <a
                  href="#calling"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 text-sm font-medium transition-colors"
                >
                  <Globe className="w-4 h-4 text-teal-400" />
                  <div>
                    <p className="font-semibold text-white">HD Voice & Video</p>
                    <p className="text-xs text-slate-400">Low latency worldwide</p>
                  </div>
                </a>
                <a
                  href="#ai"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 text-sm font-medium transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="font-semibold text-white">AI Assistant</p>
                    <p className="text-xs text-slate-400">Smart chat automation</p>
                  </div>
                </a>
              </div>
            </div>

            <a
              href="#privacy"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/5 transition-all"
            >
              Privacy
            </a>
            <a
              href="#security"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/5 transition-all"
            >
              Security
            </a>
            <a
              href="#apps"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/5 transition-all"
            >
              Apps
            </a>

            {/* Theme Selector */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-xs text-slate-300">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={selectedTheme}
                onChange={handleThemeChange}
                className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="dark" className="bg-slate-900 text-slate-200">Dark Obsidian</option>
                <option value="emerald" className="bg-slate-900 text-slate-200">Emerald Cyber</option>
                <option value="luxury" className="bg-slate-900 text-slate-200">Gold Luxury</option>
                <option value="light" className="bg-slate-900 text-slate-200">Clean Light</option>
              </select>
            </div>
          </nav>

          {/* USER ACTIONS */}
          <div className="hidden sm:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/chatPage"
                  className="relative group overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Open Chat
                  </span>
                </Link>

                <div className="flex items-center gap-2 pl-3 border-l border-white/10">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shadow-inner">
                    {user?.fullName?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-full transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="relative group overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Free
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="sm:hidden p-4 mb-4 rounded-2xl bg-[#0F172A] border border-white/10 space-y-3">
            <a href="#privacy" className="block px-4 py-2 text-slate-300 hover:text-emerald-400 text-sm font-medium">Privacy</a>
            <a href="#security" className="block px-4 py-2 text-slate-300 hover:text-emerald-400 text-sm font-medium">Security</a>
            <a href="#apps" className="block px-4 py-2 text-slate-300 hover:text-emerald-400 text-sm font-medium">Apps</a>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/chatPage"
                    className="w-full text-center py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm"
                  >
                    Open Chat
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-semibold text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full text-center py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;
