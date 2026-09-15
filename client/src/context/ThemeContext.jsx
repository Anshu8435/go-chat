import { createContext, useContext, useEffect, useState } from "react";
import { MoonStar, Sparkles, Leaf, Flame, Gem, Moon, Sun } from "lucide-react";

export const THEMES = [
  {
    id: "porcelain-light",
    name: "Porcelain Light",
    icon: Sun,
    iconName: "Sun",
    personality: "Apple iMessage & macOS Clean Light",
    category: "Apple Minimalist Light",
    colorScheme: "light",
    colors: {
      bg: "#F5F6FA",
      sidebar: "#FFFFFF",
      surface: "#FFFFFF",
      card: "#FFFFFF",
      primary: "#007AFF",
      secondary: "#38BDF8",
      highlight: "#10B981",
      text: "#111827",
      muted: "#6B7280",
      border: "#E5E7EB",
    },
    visual:
      "Pristine white Apple surfaces, system blue accents, and crystal clear light typography.",
  },
  {
    id: "royal-sapphire",
    name: "Slack Enterprise",
    icon: Gem,
    iconName: "Gem",
    personality: "Famous Slack Aubergine & Crisp White Duo",
    category: "Enterprise Duo-Tone",
    colorScheme: "light",
    colors: {
      bg: "#F8F9FA",
      sidebar: "#3F0E40",
      surface: "#FFFFFF",
      card: "#FFFFFF",
      primary: "#007A5A",
      secondary: "#4A154B",
      highlight: "#ECB22E",
      text: "#180418ff",
      muted: "#616061",
      border: "#E2E8F0",
    },
    visual:
      "Iconic Slack deep aubergine sidebar contrasted with a bright, crisp white messaging workspace.",
  },
  {
    id: "sunset-ember",
    name: "Sunset Ember",
    icon: Flame,
    iconName: "Flame",
    personality: "Stripe & Notion Warm Peach Light",
    category: "Warm Modern Light",
    colorScheme: "light",
    colors: {
      bg: "#FFF7ED",
      sidebar: "#FFEDD5",
      surface: "#FFFFFF",
      card: "#FFFFFF",
      primary: "#EA580C",
      secondary: "#F97316",
      highlight: "#F59E0B",
      text: "#431407",
      muted: "#9A3412",
      border: "#FDBA74",
    },
    visual: "Inviting cream-peach canvas, terracotta coral accents, and warm espresso typography.",
  },
  {
    id: "emerald-executive",
    name: "Telegram Mint",
    icon: Leaf,
    iconName: "Leaf",
    personality: "Telegram Cloud Sky & Mint Fresh",
    category: "Fresh Sky Light",
    colorScheme: "light",
    colors: {
      bg: "#EBF4F6",
      sidebar: "#FFFFFF",
      surface: "#F5FAFB",
      card: "#FFFFFF",
      primary: "#059669",
      secondary: "#10B981",
      highlight: "#0284C7",
      text: "#0F2C23",
      muted: "#4E7A6B",
      border: "#CBE4DD",
    },
    visual:
      "Fresh sky-mint background, pure white conversation clouds, and energetic emerald highlights.",
  },
  {
    id: "midnight-obsidian",
    name: "Midnight Obsidian",
    icon: MoonStar,
    iconName: "MoonStar",
    personality: "Linear.app & Vercel Cosmic Dark",
    category: "Developer Stealth Dark",
    colorScheme: "dark",
    colors: {
      bg: "#08090E",
      sidebar: "#0F121C",
      surface: "#151928",
      card: "#1C2237",
      primary: "#6366F1",
      secondary: "#8B5CF6",
      highlight: "#06B6D4",
      text: "#F8FAFC",
      muted: "#94A3B8",
      border: "#2A324B",
    },
    visual:
      "Linear-style cosmic dark depth, electric indigo gradients, and glassmorphic card layers.",
  },
  {
    id: "aurora-pulse",
    name: "Aurora Pulse",
    icon: Sparkles,
    iconName: "Sparkles",
    personality: "Discord Nitro & Synthwave Cyberpunk",
    category: "Vibrant Neon Dark",
    colorScheme: "dark",
    colors: {
      bg: "#0E091E",
      sidebar: "#160F30",
      surface: "#1F1545",
      card: "#2B1D5E",
      primary: "#A855F7",
      secondary: "#EC4899",
      highlight: "#00F0FF",
      text: "#FAF5FF",
      muted: "#C084FC",
      border: "#4C2889",
    },
    visual: "Deep synthwave night, glowing neon purple & hot pink accents, and cyberpunk badges.",
  },
  {
    id: "obsidian-dark",
    name: "Obsidian Stealth",
    icon: Moon,
    iconName: "Moon",
    personality: "Raycast & Superhuman AMOLED Black",
    category: "True AMOLED Dark",
    colorScheme: "dark",
    colors: {
      bg: "#000000",
      sidebar: "#0A0A0A",
      surface: "#121212",
      card: "#181818",
      primary: "#E4E4E7",
      secondary: "#71717A",
      highlight: "#FFFFFF",
      text: "#FFFFFF",
      muted: "#A1A1AA",
      border: "#27272A",
    },
    visual:
      "Pure pitch-black AMOLED minimalist monochrome with razor-sharp contrast and zero distraction.",
  },
];

const DEFAULT_THEME_ID = "midnight-obsidian";

const normalizeThemeId = (id) => {
  if (!id) return DEFAULT_THEME_ID;
  const legacyMap = {
    dark: "midnight-obsidian",
    light: "porcelain-light",
    emerald: "emerald-executive",
    luxury: "sunset-ember",
    violet: "aurora-pulse",
    sunset: "sunset-ember",
    forest: "emerald-executive",
    ocean: "royal-sapphire",
  };
  const resolved = legacyMap[id] || id;
  const found = THEMES.find((t) => t.id === resolved);
  return found ? found.id : DEFAULT_THEME_ID;
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    try {
      const saved = localStorage.getItem("gochat-theme");
      return normalizeThemeId(saved);
    } catch {
      return DEFAULT_THEME_ID;
    }
  });

  const activeTheme = THEMES.find((t) => t.id === currentThemeId) || THEMES[0];

  const applyThemeToDOM = (themeId) => {
    const validId = normalizeThemeId(themeId);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", validId);
      const targetTheme = THEMES.find((t) => t.id === validId) || THEMES[0];
      document.documentElement.style.colorScheme = targetTheme.colorScheme;
    }
  };

  useEffect(() => {
    applyThemeToDOM(currentThemeId);
  }, [currentThemeId]);

  const setTheme = (themeId) => {
    const validId = normalizeThemeId(themeId);
    setCurrentThemeId(validId);
    try {
      localStorage.setItem("gochat-theme", validId);
    } catch {
      // storage unavailable
    }
    applyThemeToDOM(validId);
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME_ID);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: currentThemeId,
        activeTheme,
        themes: THEMES,
        setTheme,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
};

export default ThemeContext;
