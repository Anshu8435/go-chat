import { useEffect, useState } from "react";
import { ChevronDown, MessageSquare, Shield, Sparkles, Globe, LogOut, User as UserIcon, Palette, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const themeNames = {
  dark: "Dark Obsidian",
  light: "Clean Light",
  emerald: "Emerald Cyber",
  luxury: "Gold Luxury",
  violet: "Violet Pulse",
  sunset: "Sunset Glow",
  forest: "Forest Mist",
  ocean: "Ocean Drift",
};

const Navbar = () => {
  const [selectedTheme, setSelectedTheme] = useState(
    () => localStorage.getItem("gochat-theme") || "dark"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Apply saved theme to <html> once on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", selectedTheme);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleThemeChange = (e) => {
    const theme = e.target.value;
    setSelectedTheme(theme);
    localStorage.setItem("gochat-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  const activeThemeLabel = themeNames[selectedTheme] || "Dark Obsidian";

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b transition-all backdrop-blur-xl"
      style={{
        background: "var(--bg-page)",
        borderColor: "var(--line)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* BRAND LOGO */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-400 border-2 border-[#0B0F19] rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent font-heading leading-none">
                GoChat
              </span>
              <span className="text-[8px] sm:text-[10px] font-medium tracking-widest uppercase text-emerald-400/80 -mt-0.5 sm:-mt-1">
                Luxury Messaging
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav
            className="hidden md:flex items-center gap-1 p-1.5 rounded-full border backdrop-blur-md"
            style={{
              background: "var(--surface-soft)",
              borderColor: "var(--line)",
            }}
          >
            
            {/* Features Dropdown */}
            <div className="relative group px-1">
              <button
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all"
                style={{ color: "var(--text-soft)" }}
              >
                <span>Features</span>
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" style={{ color: "var(--text-soft)" }} />
              </button>

              {/* Glass Dropdown Menu */}
              <div
                className="absolute left-0 mt-3 w-64 p-2 rounded-2xl backdrop-blur-2xl border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-50"
                style={{
                  background: "var(--bg-panel-strong)",
                  borderColor: "var(--line)",
                  boxShadow: "0 20px 50px var(--shadow-glow)",
                }}
              >
                <a
                  href="#privacy"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: "var(--text-soft)" }}
                >
                  <Shield className="w-4 h-4" style={{ color: "var(--accent-a)" }} />
                  <div>
                    <p className="font-semibold" style={{ color: "var(--text-strong)" }}>End-to-End Privacy</p>
                    <p className="text-xs" style={{ color: "var(--text-soft)" }}>Zero data retention policy</p>
                  </div>
                </a>
                <a
                  href="#calling"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: "var(--text-soft)" }}
                >
                  <Globe className="w-4 h-4" style={{ color: "var(--accent-b)" }} />
                  <div>
                    <p className="font-semibold" style={{ color: "var(--text-strong)" }}>HD Voice & Video</p>
                    <p className="text-xs" style={{ color: "var(--text-soft)" }}>Low latency worldwide</p>
                  </div>
                </a>
                <a
                  href="#ai"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: "var(--text-soft)" }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: "var(--accent-c)" }} />
                  <div>
                    <p className="font-semibold" style={{ color: "var(--text-strong)" }}>AI Assistant</p>
                    <p className="text-xs" style={{ color: "var(--text-soft)" }}>Smart chat automation</p>
                  </div>
                </a>
              </div>
            </div>

            <Link
              to="/contact"
              className="px-4 py-2 text-sm font-medium rounded-full transition-all"
              style={{ color: "var(--text-soft)" }}
            >
              Contact
            </Link>
            <a
              href="#privacy"
              className="px-4 py-2 text-sm font-medium rounded-full transition-all"
              style={{ color: "var(--text-soft)" }}
            >
              Privacy
            </a>
            <a
              href="#security"
              className="px-4 py-2 text-sm font-medium rounded-full transition-all"
              style={{ color: "var(--text-soft)" }}
            >
              Security
            </a>
            <a
              href="#apps"
              className="px-4 py-2 text-sm font-medium rounded-full transition-all"
              style={{ color: "var(--text-soft)" }}
            >
              Apps
            </a>

            {/* Theme Selector */}
            <div
              className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
              style={{
                background: "var(--surface-soft)",
                borderColor: "var(--line)",
                color: "var(--text)",
              }}
            >
              <Palette className="w-3.5 h-3.5" style={{ color: "var(--accent-a)" }} />
              <select
                value={selectedTheme}
                onChange={handleThemeChange}
                className="cursor-pointer border-none bg-transparent text-xs focus:outline-none pr-1"
                style={{ color: "var(--text)" }}
                aria-label="Theme selector"
              >
                <option value="dark" className="bg-slate-900 text-slate-200">Dark Obsidian</option>
                <option value="light" className="bg-slate-900 text-slate-200">Clean Light</option>
                <option value="emerald" className="bg-slate-900 text-slate-200">Emerald Cyber</option>
                <option value="luxury" className="bg-slate-900 text-slate-200">Gold Luxury</option>
                <option value="violet" className="bg-slate-900 text-slate-200">Violet Pulse</option>
                <option value="sunset" className="bg-slate-900 text-slate-200">Sunset Glow</option>
                <option value="forest" className="bg-slate-900 text-slate-200">Forest Mist</option>
                <option value="ocean" className="bg-slate-900 text-slate-200">Ocean Drift</option>
              </select>
              <span
                className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{
                  background: "var(--surface)",
                  color: "var(--text-strong)",
                }}
              >
                {activeThemeLabel}
              </span>
            </div>
          </nav>

          {/* USER ACTIONS */}
          <div className="hidden sm:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/chatPage"
                  className="relative group overflow-hidden rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-a), var(--accent-b))",
                    boxShadow: "0 15px 30px var(--shadow-glow)",
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Open Chat
                  </span>
                </Link>

                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium rounded-full transition-all"
                  style={{ color: "var(--text-soft)" }}
                >
                  Dashboard
                </Link>

                <div
                  className="flex items-center gap-2 pl-3 border-l"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div
                    className="w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shadow-inner overflow-hidden"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--line)",
                      color: "var(--accent-a)",
                    }}
                  >
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt={user.fullName || "User"} className="w-full h-full object-cover" />
                    ) : (
                      user?.fullName?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 rounded-full transition-colors"
                    style={{ color: "var(--text-soft)" }}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-semibold rounded-full transition-all"
                  style={{ color: "var(--text-soft)" }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="relative group overflow-hidden rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-a), var(--accent-b))",
                    boxShadow: "0 15px 30px var(--shadow-glow)",
                  }}
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
              className="p-2.5 rounded-xl border transition-colors"
              style={{
                background: "var(--surface)",
                borderColor: "var(--line)",
                color: "var(--text-soft)",
              }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div
            className="sm:hidden p-4 mb-4 rounded-2xl border space-y-3"
            style={{
              background: "var(--bg-panel)",
              borderColor: "var(--line)",
            }}
          >
            <a href="#privacy" className="block px-4 py-2 text-sm font-medium" style={{ color: "var(--text-soft)" }}>Privacy</a>
            <a href="#security" className="block px-4 py-2 text-sm font-medium" style={{ color: "var(--text-soft)" }}>Security</a>
            <a href="#apps" className="block px-4 py-2 text-sm font-medium" style={{ color: "var(--text-soft)" }}>Apps</a>
            <div className="pt-3 border-t flex flex-col gap-2" style={{ borderColor: "var(--line)" }}>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/chatPage"
                    className="w-full text-center py-2.5 rounded-xl font-semibold text-sm text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--accent-a), var(--accent-b))",
                    }}
                  >
                    Open Chat
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2.5 rounded-xl border font-semibold text-sm"
                    style={{
                      background: "rgba(239, 68, 68, 0.08)",
                      borderColor: "rgba(239,68,68,0.25)",
                      color: "#f87171",
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full text-center py-2.5 rounded-xl font-semibold text-sm"
                    style={{
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center py-2.5 rounded-xl font-semibold text-sm text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--accent-a), var(--accent-b))",
                    }}
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
