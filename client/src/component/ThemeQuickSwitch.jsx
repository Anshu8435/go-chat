import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../context/ThemeContext";
import { Palette, Check, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export const ThemeQuickSwitch = ({ compact = false }) => {
  const { theme, activeTheme, themes, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 288 });

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const margin = 12;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const dropdownWidth = Math.min(288, screenWidth - margin * 2);

    let left;
    if (screenWidth < 420) {
      left = Math.max(margin, Math.round((screenWidth - dropdownWidth) / 2));
    } else {
      left = rect.right - dropdownWidth;

      if (left < margin) {
        left = rect.left;
      }

      if (left + dropdownWidth > screenWidth - margin) {
        left = screenWidth - dropdownWidth - margin;
      }
      if (left < margin) {
        left = margin;
      }
    }

    let top = rect.bottom + 8;
    const estimatedHeight = 360;
    if (top + estimatedHeight > screenHeight - margin && rect.top > estimatedHeight + margin) {
      top = Math.max(margin, rect.top - 8 - estimatedHeight);
    }

    setCoords({
      top: Math.round(top),
      left: Math.round(left),
      width: Math.round(dropdownWidth),
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleUpdate = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [isOpen, updatePosition]);

  const ActiveIcon = activeTheme.icon;

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={`Theme: ${activeTheme.name} (Click to switch)`}
        className={`inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-main)] transition-all hover:border-[var(--primary)] hover:bg-[var(--bg-card)] focus:outline-none ${
          compact ? "h-8 w-8" : "h-9 w-9"
        }`}
        aria-label="Switch Theme"
        aria-expanded={isOpen}
      >
        <span
          className="flex h-5 w-5 items-center justify-center rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${activeTheme.colors.primary}, ${activeTheme.colors.secondary})`,
            color: "#ffffff",
          }}
        >
          <ActiveIcon className="h-3.5 w-3.5" />
        </span>
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            role="dialog"
            aria-label="Enterprise Themes"
            className="fixed z-[9999] rounded-2xl border border-[var(--border)] p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxHeight: "calc(100vh - 24px)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-main)",
              boxShadow: "0 10px 40px -10px var(--shadow-glow)",
            }}
          >
            <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Enterprise Themes
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--primary)] border border-[var(--border)]">
                7 Unique
              </span>
            </div>

            <div className="py-1 max-h-[55vh] sm:max-h-72 overflow-y-auto space-y-0.5">
              {themes.map((t) => {
                const IconComponent = t.icon;
                const isSelected = t.id === theme;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                      isSelected
                        ? "bg-[var(--bg-surface)] font-semibold border border-[var(--border)]"
                        : "hover:bg-[var(--bg-surface)]/60 text-[var(--text-main)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})`,
                          color: "#ffffff",
                        }}
                      >
                        <IconComponent className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-[var(--text-main)]">
                          {t.name}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">
                          {t.personality}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="flex items-center -space-x-1">
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-[var(--border)]"
                          style={{ backgroundColor: t.colors.primary }}
                        />
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-[var(--border)]"
                          style={{ backgroundColor: t.colors.secondary }}
                        />
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-[var(--border)]"
                          style={{ backgroundColor: t.colors.highlight }}
                        />
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-[var(--primary)] ml-1" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 mt-1 border-t border-[var(--border)] px-1">
              <Link
                to="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-semibold text-[var(--primary)] bg-[var(--bg-surface)] hover:bg-[var(--primary)] hover:text-white transition-all border border-[var(--border)]"
              >
                <Palette className="h-3.5 w-3.5" />
                Open Theme Studio
                <ExternalLink className="h-3 w-3 ml-auto opacity-70" />
              </Link>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ThemeQuickSwitch;
