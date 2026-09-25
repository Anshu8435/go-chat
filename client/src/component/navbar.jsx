import { useState } from "react";
import {
  ChevronDown,
  MessageSquare,
  Shield,
  Sparkles,
  Globe,
  LogOut,
  User as UserIcon,
  Palette,
  Menu,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ThemeQuickSwitch from "./ThemeQuickSwitch";
import toast from "react-hot-toast";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { activeTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-colors duration-200"
      style={{
        backgroundColor: "var(--header-bg)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group min-w-0">
            <div
              className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${activeTheme.colors.primary}, ${activeTheme.colors.secondary})`,
                boxShadow: "0 8px 20px -3px var(--shadow-glow)",
              }}
            >
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[var(--bg-page)] rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xl sm:text-2xl font-black tracking-tight font-heading leading-none text-[var(--text-main)]">
                GoChat
              </span>
              <span
                className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase mt-0.5"
                style={{ color: activeTheme.colors.primary }}
              >
                Enterprise Messaging
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1 p-1.5 rounded-full border backdrop-blur-md"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="relative group px-1">
              <button
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <span>Features</span>
                <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div
                className="absolute left-0 mt-3 w-64 p-2 rounded-2xl border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-50"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border)",
                  boxShadow: "0 20px 50px var(--shadow-glow)",
                }}
              >
                <a
                  href="#privacy"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
                >
                  <Shield className="w-4 h-4 text-[var(--primary)]" />
                  <div>
                    <p className="font-semibold text-[var(--text-main)]">End-to-End Privacy</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Zero data retention policy
                    </p>
                  </div>
                </a>
                <a
                  href="#calling"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
                >
                  <Globe className="w-4 h-4 text-[var(--secondary)]" />
                  <div>
                    <p className="font-semibold text-[var(--text-main)]">HD Voice & Video</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Encrypted communication</p>
                  </div>
                </a>
                <a
                  href="#sync"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
                >
                  <Sparkles className="w-4 h-4 text-[var(--highlight)]" />
                  <div>
                    <p className="font-semibold text-[var(--text-main)]">Realtime Sync</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Zero latency socket flow</p>
                  </div>
                </a>
              </div>
            </div>

            <Link
              to="/contact"
              className="px-4 py-2 text-xs font-semibold rounded-full transition-all text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              Contact
            </Link>

            <Link
              to="/settings"
              className="px-4 py-2 text-xs font-semibold rounded-full transition-all text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1.5"
            >
              <Palette className="h-3.5 w-3.5 text-[var(--primary)]" />
              Themes
            </Link>

            {/* Quick Switch Dropdown */}
            <div className="pl-1 pr-1">
              <ThemeQuickSwitch />
            </div>
          </nav>

          {/* User actions */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/chatPage"
                  className="theme-button-primary rounded-xl px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open Workspace
                </Link>

                <Link
                  to="/dashboard"
                  className="px-3 py-2 text-xs font-semibold rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition"
                >
                  Dashboard
                </Link>

                <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
                  <div className="profile-avatar overflow-hidden">
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.fullName || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.fullName?.charAt(0).toUpperCase() || (
                        <UserIcon className="w-3.5 h-3.5" />
                      )
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 rounded-xl text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="theme-button-primary px-5 py-2.5 text-xs font-bold rounded-xl"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeQuickSwitch compact />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-main)]"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-b p-4 space-y-3"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
            >
              Home
            </Link>
            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
            >
              Theme Studio (7 Themes)
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
            >
              Contact
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/chatPage"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-[var(--primary)] hover:bg-[var(--bg-surface)]"
                >
                  Open Chat
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
                >
                  Dashboard & Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-main)]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl theme-button-primary text-xs font-bold"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
