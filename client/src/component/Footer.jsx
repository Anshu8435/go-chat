import { Link } from "react-router-dom";
import { MessageSquare, ShieldCheck, ArrowUpRight, Palette } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Footer = () => {
  const { activeTheme } = useTheme();

  return (
    <footer
      className="border-t transition-colors duration-200"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border)",
        color: "var(--text-muted)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${activeTheme.colors.primary}, ${activeTheme.colors.secondary})`,
                }}
              >
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold font-heading text-[var(--text-main)]">GoChat</p>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: activeTheme.colors.primary }}
                >
                  Enterprise Messaging
                </p>
              </div>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-[var(--text-muted)]">
              Enterprise-grade real-time messaging platform with 7 unique design themes,
              military-grade encryption, voice calling, and zero latency delivery.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
              Platform
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link to="/" className="hover:text-[var(--primary)] transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/chatPage" className="hover:text-[var(--primary)] transition">
                  Workspace Chat
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className="hover:text-[var(--primary)] transition flex items-center gap-1.5"
                >
                  <Palette className="h-3 w-3 text-[var(--primary)]" />
                  Theme Studio (7 Themes)
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[var(--primary)] transition">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
              Security
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>256-Bit SSL Transit</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowUpRight className="h-3.5 w-3.5 text-[var(--primary)]" />
                <span>WebSocket Clusters</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Zero Data Retention</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-4">
          <p>© {new Date().getFullYear()} GoChat Enterprise. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="font-semibold" style={{ color: activeTheme.colors.primary }}>
              Active Theme: {activeTheme.name}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
