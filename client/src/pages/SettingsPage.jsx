import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Palette, Sparkles, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

const accentPresets = [
  { name: "Cyber Sunset", start: "#FF007A", end: "#00F0FF", glow: "rgba(255, 0, 122, 0.45)" },
  { name: "Neon Mint", start: "#3AF7B6", end: "#6C63FF", glow: "rgba(58, 247, 182, 0.35)" },
  { name: "Plasma Violet", start: "#A855F7", end: "#22D3EE", glow: "rgba(168, 85, 247, 0.4)" },
  { name: "Solar Pop", start: "#FF7A18", end: "#FFB019", glow: "rgba(255, 122, 24, 0.4)" },
];

const motionStyles = [
  { label: "Cubic Ease", value: "0.4, 0, 0.2, 1" },
  { label: "Spring", value: "0.22, 1, 0.36, 1" },
  { label: "Soft Bounce", value: "0.16, 1, 0.3, 1" },
];

const SettingsPage = () => {
  const [selectedPreset, setSelectedPreset] = useState(accentPresets[0]);
  const [energy, setEnergy] = useState(78);
  const [motionCurve, setMotionCurve] = useState(motionStyles[0]);

  const gradient = useMemo(
    () => `linear-gradient(135deg, ${selectedPreset.start} 0%, ${selectedPreset.end} 100%)`,
    [selectedPreset]
  );

  const themeStyle = {
    backgroundImage: gradient,
    boxShadow: `0 0 40px ${selectedPreset.glow}`,
  };

  const ambientGlow = {
    background: `radial-gradient(circle at 20% 20%, ${selectedPreset.start}55 0%, transparent 42%), radial-gradient(circle at 80% 30%, ${selectedPreset.end}55 0%, transparent 40%)`,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0E14] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70" style={ambientGlow} />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between gap-3">
          <Link
            to="/chatPage"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </Link>

          <div className="nexus-badge">
            <Sparkles className="h-4 w-4" />
            NexusChat Theme Lab
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="nexus-panel p-5 sm:p-6"
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Customization</p>
                <h1 className="mt-2 text-3xl font-bold text-white">Aurora Theme Studio</h1>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-200">
                <Palette className="h-3.5 w-3.5" />
                Live Preview
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Accent Palette</h2>
                  <span className="text-xs text-slate-500">{selectedPreset.name}</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {accentPresets.map((preset) => {
                    const isActive = selectedPreset.name === preset.name;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setSelectedPreset(preset)}
                        className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition ${
                          isActive ? "border-white/30 bg-white/10" : "border-white/10 bg-slate-900/50 hover:border-white/20"
                        }`}
                      >
                        <div className="mb-3 h-14 rounded-xl" style={{ backgroundImage: `linear-gradient(135deg, ${preset.start}, ${preset.end})` }} />
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-white">{preset.name}</span>
                          {isActive && <Check className="h-4 w-4 text-cyan-300" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Primary Accent</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                    <input
                      type="color"
                      value={selectedPreset.start}
                      onChange={(e) => setSelectedPreset((prev) => ({ ...prev, start: e.target.value }))}
                      className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                    />
                    <span className="font-mono text-sm text-slate-200">{selectedPreset.start}</span>
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Secondary Accent</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                    <input
                      type="color"
                      value={selectedPreset.end}
                      onChange={(e) => setSelectedPreset((prev) => ({ ...prev, end: e.target.value }))}
                      className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                    />
                    <span className="font-mono text-sm text-slate-200">{selectedPreset.end}</span>
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                  <span>Energy</span>
                  <span>{energy}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={energy}
                  onChange={(e) => setEnergy(Number(e.target.value))}
                  className="slider-range w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                  <span>Motion Curve</span>
                  <span>{motionCurve.label}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {motionStyles.map((curve) => (
                    <button
                      key={curve.label}
                      type="button"
                      onClick={() => setMotionCurve(curve)}
                      className={`rounded-full border px-3 py-2 text-xs transition ${
                        motionCurve.label === curve.label
                          ? "border-white/20 bg-white/10 text-white"
                          : "border-white/10 bg-slate-900/50 text-slate-300 hover:border-white/20"
                      }`}
                    >
                      {curve.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
            className="nexus-panel p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Preview</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Live Surface</h2>
              </div>

              <div className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/60 p-2">
                <SlidersHorizontal className="h-4 w-4 text-slate-300" />
              </div>
            </div>

            <div className="mb-5 rounded-[28px] border border-white/10 bg-[#0f141d] p-3 shadow-2xl shadow-black/30">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold text-white" style={themeStyle}>
                    N
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Nora Vale</p>
                    <p className="text-[11px] text-emerald-300">Typing…</p>
                  </div>
                </div>

                <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              </div>

              <div className="space-y-3">
                <div className="ml-auto max-w-[75%] rounded-[22px] rounded-br-md border border-white/10 bg-slate-800/80 p-3 text-sm text-slate-100">
                  The new palette is insanely clean.
                </div>

                <div className="max-w-[75%] rounded-[22px] rounded-tl-md p-3 text-sm text-white" style={themeStyle}>
                  I love the glow and the motion curves — ready to ship.
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  <span>Send</span>
                  <span>Ready</span>
                </div>

                <div className="flex gap-2">
                  <div className="h-10 flex-1 rounded-full border border-white/10 bg-white/5" />
                  <motion.button
                    whileHover={{ scale: 1.03, rotate: 1 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex h-10 items-center justify-center rounded-full px-4 font-semibold text-slate-950"
                    style={themeStyle}
                  >
                    Send
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Easing</span>
                <span className="font-mono text-xs text-slate-300">{motionCurve.value}</span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Micro Motion</span>
                  <span className="text-xs text-slate-400">{energy}%</span>
                </div>

                <motion.div
                  className="h-2 w-full rounded-full bg-slate-800"
                  animate={{ width: `${energy}%` }}
                  transition={{ duration: 0.75, ease: motionCurve.value.split(",").map(Number) }}
                  style={{ backgroundImage: gradient }}
                />
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
