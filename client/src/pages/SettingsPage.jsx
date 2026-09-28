import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Palette, RotateCcw, Send, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { theme, activeTheme, themes, setTheme, resetTheme } = useTheme();
  const [previewThemeId, setPreviewThemeId] = useState(theme);

  const previewTheme = themes.find((t) => t.id === previewThemeId) || activeTheme;
  const ActiveIcon = activeTheme.icon;
  const PreviewIcon = previewTheme.icon;

  const handleApplyTheme = (themeId) => {
    setTheme(themeId);
    setPreviewThemeId(themeId);
    const selected = themes.find((t) => t.id === themeId);
    toast.success(`Theme updated to ${selected?.name || "Enterprise Theme"}`);
  };

  const handleReset = () => {
    resetTheme();
    setPreviewThemeId("midnight-obsidian");
    toast.success("Theme reset to Midnight Obsidian (Default)");
  };

  return (
    <div
      className="relative min-h-screen theme-shell overflow-x-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-page)", color: "var(--text-main)" }}
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40 blur-3xl transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 15% 20%, ${previewTheme.colors.primary}33 0%, transparent 45%), radial-gradient(circle at 85% 75%, ${previewTheme.colors.secondary}26 0%, transparent 45%)`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/chatPage"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--primary)] hover:bg-[var(--bg-card)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--text-main)] hover:border-[var(--border)] hover:bg-[var(--bg-card)]"
            >
              Profile Settings
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--text-muted)] transition hover:border-red-400/40 hover:text-red-400 hover:bg-red-500/10"
              title="Reset to default theme"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to Default
            </button>

            <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-semibold text-[var(--primary)] shadow-sm">
              <ActiveIcon className="h-4 w-4" />
              <span>Theme Studio</span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-3">
            <Palette className="h-3.5 w-3.5" />
            Enterprise Visual Experience
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[var(--text-main)]">
            GoChat Theme Studio
          </h1>
          <p className="mt-2 text-base text-[var(--text-muted)] leading-relaxed">
            Select from seven curated enterprise design personalities. Switching themes instantly
            transforms the entire application—every chat bubble, sidebar, card, input, and modal
            synchronizes with zero reload.
          </p>
        </div>

        {/* Live Workspace Preview Card */}
        <section className="mb-12 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${previewTheme.colors.primary}, ${previewTheme.colors.secondary})`,
                }}
              >
                <PreviewIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-main)]">
                  Live Preview: {previewTheme.name}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">{previewTheme.personality}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {theme !== previewTheme.id ? (
                <button
                  type="button"
                  onClick={() => handleApplyTheme(previewTheme.id)}
                  className="theme-button-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold"
                >
                  <Check className="h-4 w-4" />
                  Apply {previewTheme.name}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Currently Active Theme
                </span>
              )}
            </div>
          </div>

          {/* Simulated App Workspace Window */}
          <div
            className="overflow-hidden rounded-2xl border transition-all duration-300 shadow-xl"
            style={{
              backgroundColor: previewTheme.colors.bg,
              borderColor: previewTheme.colors.border,
            }}
          >
            {/* Window title bar */}
            <div
              className="flex items-center justify-between border-b px-4 py-2.5"
              style={{
                backgroundColor: previewTheme.colors.sidebar,
                borderColor: previewTheme.colors.border,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
                <span
                  className="ml-2 text-xs font-semibold"
                  style={{ color: previewTheme.colors.muted }}
                >
                  GoChat Workspace — {previewTheme.name}
                </span>
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: previewTheme.colors.surface,
                  color: previewTheme.colors.primary,
                  borderColor: previewTheme.colors.border,
                  borderWidth: "1px",
                }}
              >
                {previewTheme.category}
              </span>
            </div>

            {/* Simulated Workspace layout */}
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-[360px]">
              {/* Mini Sidebar */}
              <div
                className="border-r p-4 flex flex-col justify-between"
                style={{
                  backgroundColor: previewTheme.colors.sidebar,
                  borderColor: previewTheme.colors.border,
                }}
              >
                <div className="space-y-3">
                  <div
                    className="flex items-center gap-2.5 pb-3 border-b"
                    style={{ borderColor: previewTheme.colors.border }}
                  >
                    <div
                      className="h-8 w-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${previewTheme.colors.primary}, ${previewTheme.colors.secondary})`,
                      }}
                    >
                      GC
                    </div>
                    <div>
                      <p
                        className="text-xs font-bold leading-tight"
                        style={{
                          color:
                            previewTheme.id === "royal-sapphire"
                              ? "#FFFFFF"
                              : previewTheme.colors.text,
                        }}
                      >
                        GoChat Enterprise
                      </p>
                      <p
                        className="text-[10px]"
                        style={{
                          color:
                            previewTheme.id === "royal-sapphire"
                              ? "#CAB8CA"
                              : previewTheme.colors.muted,
                        }}
                      >
                        Real-time Platform
                      </p>
                    </div>
                  </div>

                  {/* Active Contact */}
                  <div
                    className="p-2.5 rounded-xl border flex items-center gap-2.5 shadow-sm"
                    style={{
                      backgroundColor: previewTheme.colors.card,
                      borderColor: previewTheme.colors.border,
                    }}
                  >
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${previewTheme.colors.primary}, ${previewTheme.colors.highlight})`,
                      }}
                    >
                      JD
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs font-bold truncate"
                        style={{
                          color:
                            previewTheme.id === "royal-sapphire"
                              ? "#1D1C1D"
                              : previewTheme.colors.text,
                        }}
                      >
                        Jane Doe (Product Lead)
                      </p>
                      <p
                        className="text-[10px] truncate"
                        style={{
                          color:
                            previewTheme.id === "royal-sapphire"
                              ? "#616061"
                              : previewTheme.colors.muted,
                        }}
                      >
                        Hey! The preview looks amazing...
                      </p>
                    </div>
                  </div>

                  {/* Other Contacts */}
                  <div
                    className="p-2.5 rounded-xl flex items-center gap-2.5 opacity-70"
                    style={{ color: previewTheme.colors.muted }}
                  >
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold border"
                      style={{
                        backgroundColor: previewTheme.colors.surface,
                        borderColor: previewTheme.colors.border,
                      }}
                    >
                      AC
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: previewTheme.colors.text }}
                      >
                        Alex Chen
                      </p>
                      <p className="text-[10px] truncate">Let&apos;s review the deployment</p>
                    </div>
                  </div>
                </div>

                <div
                  className="p-3 rounded-xl border text-xs"
                  style={{
                    backgroundColor: previewTheme.colors.surface,
                    borderColor: previewTheme.colors.border,
                    color: previewTheme.colors.muted,
                  }}
                >
                  <p
                    className="text-[11px] font-semibold"
                    style={{ color: previewTheme.colors.primary }}
                  >
                    Theme Personality
                  </p>
                  <p className="text-[10px] mt-0.5">{previewTheme.visual}</p>
                </div>
              </div>

              {/* Mini Chat Workspace */}
              <div
                className="p-5 flex flex-col justify-between"
                style={{ backgroundColor: previewTheme.colors.bg }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between pb-3 border-b"
                  style={{ borderColor: previewTheme.colors.border }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${previewTheme.colors.primary}, ${previewTheme.colors.secondary})`,
                      }}
                    >
                      JD
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: previewTheme.colors.text }}>
                        Jane Doe
                      </p>
                      <p className="text-[10px] text-emerald-400 font-medium">● Active now</p>
                    </div>
                  </div>

                  <span
                    className="text-[10px] px-2.5 py-1 rounded-full border font-semibold"
                    style={{
                      backgroundColor: previewTheme.colors.surface,
                      borderColor: previewTheme.colors.border,
                      color: previewTheme.colors.highlight,
                    }}
                  >
                    256-bit Encrypted
                  </span>
                </div>

                {/* Messages Container */}
                <div className="space-y-3 py-4">
                  {/* Received Bubble */}
                  <div className="flex justify-start">
                    <div
                      className="max-w-xs rounded-2xl rounded-tl-sm p-3 text-xs shadow-sm border"
                      style={{
                        backgroundColor: previewTheme.colors.surface,
                        color: previewTheme.colors.text,
                        borderColor: previewTheme.colors.border,
                      }}
                    >
                      <p className="leading-relaxed">
                        Welcome to GoChat Enterprise. Notice how every surface reflects our{" "}
                        <strong style={{ color: previewTheme.colors.primary }}>
                          {previewTheme.name}
                        </strong>{" "}
                        tokens!
                      </p>
                      <span
                        className="block mt-1 text-[9px] text-right"
                        style={{ color: previewTheme.colors.muted }}
                      >
                        10:24 AM
                      </span>
                    </div>
                  </div>

                  {/* Sent Bubble */}
                  <div className="flex justify-end">
                    <div
                      className="max-w-xs rounded-2xl rounded-tr-sm p-3 text-xs text-white shadow-md"
                      style={{
                        background:
                          previewTheme.id === "obsidian-dark"
                            ? "#27272A"
                            : `linear-gradient(135deg, ${previewTheme.colors.primary}, ${previewTheme.colors.secondary})`,
                      }}
                    >
                      <p className="leading-relaxed font-medium">
                        Absolutely stunning. Crisp contrast, refined typography, and instant visual
                        identity.
                      </p>
                      <span className="block mt-1 text-[9px] text-white/80 text-right">
                        10:25 AM ✓✓
                      </span>
                    </div>
                  </div>
                </div>

                {/* Composer */}
                <div
                  className="flex items-center gap-2 p-1.5 rounded-xl border"
                  style={{
                    backgroundColor: previewTheme.colors.surface,
                    borderColor: previewTheme.colors.border,
                  }}
                >
                  <input
                    type="text"
                    disabled
                    readOnly
                    placeholder="Type a message in this theme..."
                    className="w-full bg-transparent px-3 text-xs outline-none"
                    style={{ color: previewTheme.colors.text }}
                  />
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${previewTheme.colors.primary}, ${previewTheme.colors.secondary})`,
                    }}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seven Theme Cards Gallery */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-main)]">Complete Themes Gallery</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Click any theme to preview live or click &quot;Apply Theme&quot; to set as default.
            </p>
          </div>
          <span className="text-xs font-semibold text-[var(--primary)] px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border)]">
            7 of 7 Ready
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((t, idx) => {
            const Icon = t.icon;
            const isCurrentlyActive = t.id === theme;
            const isCurrentlyPreviewing = t.id === previewTheme.id;

            return (
              <motion.div
                key={t.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => setPreviewThemeId(t.id)}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 transition-all cursor-pointer ${
                  isCurrentlyActive
                    ? "border-[var(--primary)] bg-[var(--bg-card)] shadow-xl ring-2 ring-[var(--primary)]/30"
                    : isCurrentlyPreviewing
                      ? "border-[var(--primary)]/60 bg-[var(--bg-surface)] shadow-md"
                      : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border)]/80 hover:bg-[var(--bg-surface)]"
                }`}
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md transition-transform group-hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})`,
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-[var(--text-main)]">{t.name}</h3>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            0{idx + 1}
                          </span>
                        </div>
                        <span className="inline-block text-[10px] font-semibold text-[var(--primary)]">
                          {t.category}
                        </span>
                      </div>
                    </div>

                    {isCurrentlyActive && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        <Check className="h-3 w-3" />
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                    {t.personality}
                  </p>

                  {/* Color Palette Swatches */}
                  <div className="mb-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-medium">
                      <span>Color Identity</span>
                      <span>10 Design Tokens</span>
                    </div>
                    <div className="grid grid-cols-10 gap-1 rounded-xl p-1.5 border border-[var(--border)] bg-[var(--bg-surface)]">
                      <span
                        className="h-5 rounded-md border border-black/20"
                        title={`Main Background: ${t.colors.bg}`}
                        style={{ backgroundColor: t.colors.bg }}
                      />
                      <span
                        className="h-5 rounded-md border border-black/20"
                        title={`Sidebar: ${t.colors.sidebar}`}
                        style={{ backgroundColor: t.colors.sidebar }}
                      />
                      <span
                        className="h-5 rounded-md border border-black/20"
                        title={`Secondary Surface: ${t.colors.surface}`}
                        style={{ backgroundColor: t.colors.surface }}
                      />
                      <span
                        className="h-5 rounded-md border border-black/20"
                        title={`Elevated Card: ${t.colors.card}`}
                        style={{ backgroundColor: t.colors.card }}
                      />
                      <span
                        className="h-5 rounded-md border border-black/20"
                        title={`Primary Accent: ${t.colors.primary}`}
                        style={{ backgroundColor: t.colors.primary }}
                      />
                      <span
                        className="h-5 rounded-md border border-black/20"
                        title={`Secondary Accent: ${t.colors.secondary}`}
                        style={{ backgroundColor: t.colors.secondary }}
                      />
                      <span
                        className="h-5 rounded-md border border-black/20"
                        title={`Highlight: ${t.colors.highlight}`}
                        style={{ backgroundColor: t.colors.highlight }}
                      />
                      <span
                        className="h-5 rounded-md border border-black/20"
                        title={`Text: ${t.colors.text}`}
                        style={{ backgroundColor: t.colors.text }}
                      />
                      <span
                        className="h-5 rounded-md border border-black/20"
                        title={`Muted: ${t.colors.muted}`}
                        style={{ backgroundColor: t.colors.muted }}
                      />
                      <span
                        className="h-5 rounded-md border border-black/20"
                        title={`Border: ${t.colors.border}`}
                        style={{ backgroundColor: t.colors.border }}
                      />
                    </div>
                  </div>

                  {/* Mini bubble preview */}
                  <div
                    className="p-3 rounded-2xl border mb-4 space-y-2 text-[11px]"
                    style={{
                      backgroundColor: t.colors.bg,
                      borderColor: t.colors.border,
                    }}
                  >
                    <div className="flex justify-start">
                      <span
                        className="px-2.5 py-1.5 rounded-xl rounded-tl-sm border"
                        style={{
                          backgroundColor: t.colors.surface,
                          color: t.colors.text,
                          borderColor: t.colors.border,
                        }}
                      >
                        Received message
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <span
                        className="px-2.5 py-1.5 rounded-xl rounded-tr-sm text-white"
                        style={{
                          background:
                            t.id === "obsidian-dark"
                              ? "#27272A"
                              : `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})`,
                        }}
                      >
                        Sent bubble
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyTheme(t.id);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isCurrentlyActive
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "theme-button-primary"
                    }`}
                  >
                    {isCurrentlyActive ? (
                      <>
                        <Check className="h-4 w-4" />
                        Active Theme
                      </>
                    ) : (
                      <>
                        <Palette className="h-3.5 w-3.5" />
                        Apply Theme
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
