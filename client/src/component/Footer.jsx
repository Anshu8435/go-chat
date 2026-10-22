import { Link } from "react-router-dom";
import { MessageSquare, ShieldCheck, ArrowUpRight } from "lucide-react";

const Footer = () => {
  return (
    <footer
      className="border-t"
      style={{
        background: "var(--bg-page)",
        borderColor: "var(--line)",
        color: "var(--text-soft)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-lg shadow-emerald-500/20">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: "var(--text-strong)" }}>GoChat</p>
                <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--accent-a)" }}>Luxury Messaging</p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed" style={{ color: "var(--text-soft)" }}>
              Enterprise-level messaging for teams and individuals who want secure, fast, and premium communication.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--text-soft)" }}>Company</h3>
            <ul className="space-y-3 text-sm" style={{ color: "var(--text-soft)" }}>
              <li><Link to="/" className="transition" style={{ color: "var(--text-soft)" }}>Home</Link></li>
              <li><Link to="/register" className="transition" style={{ color: "var(--text-soft)" }}>Register</Link></li>
              <li><Link to="/contact" className="transition" style={{ color: "var(--text-soft)" }}>Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--text-soft)" }}>Security</h3>
            <ul className="space-y-3 text-sm" style={{ color: "var(--text-soft)" }}>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" style={{ color: "var(--accent-a)" }} /> End-to-end protection</li>
              <li className="flex items-center gap-2"><ArrowUpRight className="h-4 w-4" style={{ color: "var(--accent-b)" }} /> Real-time sync</li>
              <li className="flex items-center gap-2"><ArrowUpRight className="h-4 w-4" style={{ color: "var(--accent-c)" }} /> Secure file transfer</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-5 text-center text-sm" style={{ borderColor: "var(--line)", color: "var(--text-soft)" }}>
          © 2026 GoChat. Built for modern conversations.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
