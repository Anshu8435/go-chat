import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Palette,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Users,
  UserCheck,
  EyeOff,
  Search,
  X,
  CheckCheck,
  XCircle,
  Save,
  Loader2,
  Lock,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { api } from "../context/AuthContext";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { theme, activeTheme, themes, setTheme, resetTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "privacy" ? "privacy" : "theme";

  // Theme Studio State
  const [previewThemeId, setPreviewThemeId] = useState(theme);
  const previewTheme = themes.find((t) => t.id === previewThemeId) || activeTheme;
  const ActiveIcon = activeTheme.icon;
  const PreviewIcon = previewTheme.icon;

  // Privacy Settings State
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [onlineVisibility, setOnlineVisibility] = useState("everyone");
  const [contactsList, setContactsList] = useState([]);
  const [selectedContactIds, setSelectedContactIds] = useState(new Set());
  const [contactSearchQuery, setContactSearchQuery] = useState("");

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

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

  // Fetch Privacy Settings
  useEffect(() => {
    let isMounted = true;
    const fetchPrivacySettings = async () => {
      try {
        setPrivacyLoading(true);
        const res = await api.get("/api/user/privacy/online-visibility");
        if (res.data?.success && isMounted) {
          setOnlineVisibility(res.data.onlineVisibility || "everyone");
          const selected = new Set(res.data.selectedContactIds || []);
          setSelectedContactIds(selected);
          setContactsList(res.data.contacts || []);
        }
      } catch (err) {
        console.error("Failed to load privacy settings:", err);
        if (isMounted) {
          toast.error("Could not load privacy settings from server");
        }
      } finally {
        if (isMounted) setPrivacyLoading(false);
      }
    };

    fetchPrivacySettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save Privacy Settings
  const handleSavePrivacy = async () => {
    try {
      setSavingPrivacy(true);
      const res = await api.put("/api/user/privacy/online-visibility", {
        onlineVisibility,
        selectedContactIds: Array.from(selectedContactIds),
      });

      if (res.data?.success) {
        toast.success("Online visibility privacy updated!");
      } else {
        toast.error(res.data?.message || "Failed to update privacy settings");
      }
    } catch (err) {
      console.error("Error saving privacy settings:", err);
      toast.error(err.response?.data?.message || "Failed to save privacy settings");
    } finally {
      setSavingPrivacy(false);
    }
  };

  // Toggle single contact selection
  const toggleContactSelection = (contactId) => {
    const sId = String(contactId);
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(sId)) {
        next.delete(sId);
      } else {
        next.add(sId);
      }
      return next;
    });
  };

  // Select all filtered contacts
  const handleSelectAllContacts = () => {
    const next = new Set(selectedContactIds);
    filteredContacts.forEach((c) => next.add(String(c._id)));
    setSelectedContactIds(next);
    toast.success(`Selected all ${filteredContacts.length} contacts`);
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedContactIds(new Set());
    toast.success("Cleared contact selection");
  };

  // Filter contacts by search query
  const filteredContacts = contactsList.filter((c) => {
    const query = contactSearchQuery.toLowerCase();
    const name = (c.fullName || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const privacyOptions = [
    {
      id: "everyone",
      title: "Everyone",
      subtitle: "All users you chat with or have as contacts can see your online status.",
      icon: Globe,
      badge: "Default",
    },
    {
      id: "contacts",
      title: "My Contacts",
      subtitle: "Only users you have personally added to My Contacts can see you online.",
      icon: Users,
      badge: "WhatsApp Standard",
    },
    {
      id: "selected",
      title: "My Selected Contacts",
      subtitle: "Only contacts you explicitly handpick below will see you online. Everyone else sees you offline.",
      icon: UserCheck,
      badge: "Selective Privacy",
    },
    {
      id: "nobody",
      title: "Nobody",
      subtitle: "No one can see your online status. You appear completely offline to everyone.",
      icon: EyeOff,
      badge: "Incognito",
    },
  ];

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
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
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
            {activeTab === "theme" && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--text-muted)] transition hover:border-red-400/40 hover:text-red-400 hover:bg-red-500/10"
                title="Reset to default theme"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to Default
              </button>
            )}

            <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-semibold text-[var(--primary)] shadow-sm">
              <ActiveIcon className="h-4 w-4" />
              <span>{activeTab === "privacy" ? "Privacy Center" : "Theme Studio"}</span>
            </div>
          </div>
        </header>

        {/* Tab Switcher: Theme Studio | Privacy & Online Status */}
        <div className="mb-8 flex items-center justify-start border-b border-[var(--border)] gap-2">
          <button
            type="button"
            onClick={() => handleTabChange("theme")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition -mb-[1px] ${
              activeTab === "theme"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            <Palette className="h-4 w-4" />
            Theme Studio
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("privacy")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition -mb-[1px] ${
              activeTab === "privacy"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Privacy & Online Status
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold ml-1">
              WhatsApp Style
            </span>
          </button>
        </div>

        {/* TAB 1: PRIVACY & ONLINE STATUS */}
        {activeTab === "privacy" && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-3">
                <Lock className="h-3.5 w-3.5" />
                Backend-Enforced Presence Security
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[var(--text-main)]">
                Who Can See My Online Status?
              </h1>
              <p className="mt-2 text-base text-[var(--text-muted)] leading-relaxed">
                Control who can see when you are active on GoChat. Unauthorized users will receive no
                presence packets through Socket.IO or REST APIs and will see you as Offline.
              </p>
            </div>

            {privacyLoading ? (
              <div className="p-16 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--primary)] mb-3" />
                <p className="text-sm text-[var(--text-muted)]">Loading privacy settings...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 4 Privacy Modes Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {privacyOptions.map((opt) => {
                    const isSelected = onlineVisibility === opt.id;
                    const Icon = opt.icon;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => setOnlineVisibility(opt.id)}
                        className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 flex items-start gap-4 ${
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--bg-card)] shadow-lg ring-1 ring-[var(--primary)]"
                            : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg-card)]"
                        }`}
                      >
                        <div
                          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition ${
                            isSelected
                              ? "bg-[var(--primary)] text-white shadow-md"
                              : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)]"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base font-bold text-[var(--text-main)]">
                              {opt.title}
                            </h3>
                            <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-page)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                              {opt.badge}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
                            {opt.subtitle}
                          </p>
                        </div>

                        <div className="flex-shrink-0 pt-0.5">
                          <div
                            className={`h-5 w-5 rounded-full border flex items-center justify-center transition ${
                              isSelected
                                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                : "border-zinc-500 bg-transparent"
                            }`}
                          >
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* MY SELECTED CONTACTS SEARCHABLE INTERFACE */}
                <AnimatePresence>
                  {onlineVisibility === "selected" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-2xl overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-5 mb-5">
                        <div>
                          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-[var(--primary)]" />
                            Select Contacts Who Can See You Online
                          </h2>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            Check the contacts you want to authorize. All others will strictly see you as Offline.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--primary)]">
                            {selectedContactIds.size} of {contactsList.length} selected
                          </span>
                        </div>
                      </div>

                      {/* Search Bar & Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                        <div className="relative flex-1 min-w-[220px]">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="Search contacts by name or email..."
                            value={contactSearchQuery}
                            onChange={(e) => setContactSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-9 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-xs sm:text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
                          />
                          {contactSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setContactSearchQuery("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[var(--text-main)]"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSelectAllContacts}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-main)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={handleClearSelection}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-red-400/40 hover:text-red-400 transition"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Contacts List with Checkboxes */}
                      <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {filteredContacts.length === 0 ? (
                          <div className="py-12 text-center text-xs text-[var(--text-muted)] space-y-2">
                            <Users className="mx-auto h-8 w-8 opacity-40" />
                            <p className="font-semibold text-[var(--text-main)]">No contacts found</p>
                            <p className="text-[11px]">
                              {contactSearchQuery
                                ? "No contacts match your search query."
                                : "You haven't added any contacts yet. Add contacts in GoChat to selectively share your online presence."}
                            </p>
                          </div>
                        ) : (
                          filteredContacts.map((c) => {
                            const isChecked = selectedContactIds.has(String(c._id));

                            return (
                              <div
                                key={c._id}
                                onClick={() => toggleContactSelection(c._id)}
                                className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer select-none ${
                                  isChecked
                                    ? "border-[var(--primary)] bg-[var(--bg-surface)] shadow-xs"
                                    : "border-[var(--border)] bg-[var(--bg-surface)]/50 hover:bg-[var(--bg-surface)]"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="h-4 w-4 rounded accent-[var(--primary)] cursor-pointer"
                                  />
                                  <div className="h-9 w-9 rounded-xl overflow-hidden bg-[var(--primary)]/20 border border-[var(--border)] flex items-center justify-center font-bold text-xs text-[var(--primary)] flex-shrink-0">
                                    {c.profilePic ? (
                                      <img
                                        src={c.profilePic}
                                        alt={c.fullName}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      c.fullName?.charAt(0).toUpperCase() || "U"
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs sm:text-sm font-bold truncate text-[var(--text-main)]">
                                      {c.fullName}
                                    </h4>
                                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                                      {c.bio || c.email}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                  {isChecked ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                      <Check className="h-2.5 w-2.5" />
                                      Can See Online
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-[var(--text-muted)]">
                                      Hidden
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Save Changes Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      Changes apply instantly to Socket.IO presence without needing to log out.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSavePrivacy}
                    disabled={savingPrivacy}
                    className="theme-button-primary px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition disabled:opacity-50"
                  >
                    {savingPrivacy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Privacy Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: THEME STUDIO */}
        {activeTab === "theme" && (
          <div>
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
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: `${previewTheme.colors.primary}20`,
                      color: previewTheme.colors.primary,
                    }}
                  >
                    Enterprise Suite
                  </span>
                </div>

                {/* Workspace grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[340px]">
                  {/* Left Simulated Sidebar */}
                  <div
                    className="border-b p-4 md:col-span-4 md:border-b-0 md:border-r space-y-3"
                    style={{
                      backgroundColor: previewTheme.colors.sidebar,
                      borderColor: previewTheme.colors.border,
                    }}
                  >
                    <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: previewTheme.colors.border }}>
                      <span className="text-xs font-bold" style={{ color: previewTheme.colors.text }}>Direct Messages</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${previewTheme.colors.primary}20`, color: previewTheme.colors.primary }}>4 Active</span>
                    </div>

                    {[
                      { name: "Sarah Chen", msg: "Designs approved for sprint", unread: 2, online: true },
                      { name: "Alex Kumar", msg: "Uploaded production API keys", unread: 0, online: true },
                      { name: "Elena Rostova", msg: "Meeting scheduled for 3 PM", unread: 0, online: false },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl transition"
                        style={{
                          backgroundColor: idx === 0 ? previewTheme.colors.surface : "transparent",
                          borderColor: previewTheme.colors.border,
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div
                              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{
                                background: `linear-gradient(135deg, ${previewTheme.colors.primary}, ${previewTheme.colors.secondary})`,
                              }}
                            >
                              {item.name.charAt(0)}
                            </div>
                            {item.online && (
                              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: previewTheme.colors.text }}>{item.name}</p>
                            <p className="text-[11px] truncate opacity-70" style={{ color: previewTheme.colors.muted }}>{item.msg}</p>
                          </div>
                        </div>
                        {item.unread > 0 && (
                          <span
                            className="h-4 min-w-[1rem] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                            style={{ backgroundColor: previewTheme.colors.primary }}
                          >
                            {item.unread}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Right Simulated Active Chat Room */}
                  <div
                    className="p-5 md:col-span-8 flex flex-col justify-between"
                    style={{ backgroundColor: previewTheme.colors.bg }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: previewTheme.colors.border }}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${previewTheme.colors.primary}, ${previewTheme.colors.secondary})`,
                          }}
                        >
                          S
                        </div>
                        <div>
                          <p className="text-xs font-bold" style={{ color: previewTheme.colors.text }}>Sarah Chen</p>
                          <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">● Online & Authorized</p>
                        </div>
                      </div>
                      <span className="text-[11px]" style={{ color: previewTheme.colors.muted }}>Encrypted Channel</span>
                    </div>

                    {/* Messages */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-start">
                        <div
                          className="max-w-[75%] rounded-2xl rounded-tl-sm px-3.5 py-2 text-xs shadow-sm"
                          style={{
                            backgroundColor: previewTheme.colors.surface,
                            color: previewTheme.colors.text,
                            border: `1px solid ${previewTheme.colors.border}`,
                          }}
                        >
                          Have you tested the selective online visibility feature on GoChat?
                          <span className="block text-[9px] mt-1 opacity-60 text-right">10:42 AM</span>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <div
                          className="max-w-[75%] rounded-2xl rounded-tr-sm px-3.5 py-2 text-xs text-white shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${previewTheme.colors.primary}, ${previewTheme.colors.secondary})`,
                          }}
                        >
                          Yes! Tested with multiple tabs, instant presence switching, and zero unauthorized leakage!
                          <span className="block text-[9px] mt-1 text-white/80 text-right">10:43 AM ✓✓</span>
                        </div>
                      </div>
                    </div>

                    {/* Chat Input bar */}
                    <div
                      className="flex items-center gap-2 rounded-xl border p-1.5"
                      style={{
                        backgroundColor: previewTheme.colors.surface,
                        borderColor: previewTheme.colors.border,
                      }}
                    >
                      <input
                        type="text"
                        readOnly
                        placeholder={`Message in ${previewTheme.name}...`}
                        className="flex-1 bg-transparent px-3 text-xs focus:outline-none"
                        style={{ color: previewTheme.colors.text }}
                      />
                      <button
                        type="button"
                        className="rounded-lg p-2 text-white shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${previewTheme.colors.primary}, ${previewTheme.colors.secondary})`,
                        }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Seven Curated Theme Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {themes.map((t) => {
                const IconComponent = t.icon;
                const isCurrentlyActive = theme === t.id;
                const isCurrentlyPreviewed = previewThemeId === t.id;

                return (
                  <motion.div
                    key={t.id}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setPreviewThemeId(t.id)}
                    className={`relative cursor-pointer rounded-3xl border p-5 transition-all duration-300 flex flex-col justify-between ${
                      isCurrentlyPreviewed
                        ? "border-[var(--primary)] bg-[var(--bg-card)] shadow-2xl ring-2 ring-[var(--primary)]/50"
                        : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--primary)]/40 hover:bg-[var(--bg-card)] hover:shadow-lg"
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})`,
                          }}
                        >
                          <IconComponent className="h-4 w-4" />
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isCurrentlyActive && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                              <Check className="h-3 w-3" />
                              Active
                            </span>
                          )}
                          <span className="rounded-full border border-[var(--border)] bg-[var(--bg-page)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)]">
                            {t.category}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-[var(--text-main)] mb-1">{t.name}</h3>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-4">
                        {t.description}
                      </p>

                      {/* Swatches */}
                      <div className="flex items-center gap-2 mb-4 p-2 rounded-xl border border-[var(--border)] bg-[var(--bg-page)]">
                        <span
                          className="h-5 w-5 rounded-lg shadow-sm border border-black/10"
                          style={{ backgroundColor: t.colors.primary }}
                          title={`Primary: ${t.colors.primary}`}
                        />
                        <span
                          className="h-5 w-5 rounded-lg shadow-sm border border-black/10"
                          style={{ backgroundColor: t.colors.secondary }}
                          title={`Secondary: ${t.colors.secondary}`}
                        />
                        <span
                          className="h-5 w-5 rounded-lg shadow-sm border border-black/10"
                          style={{ backgroundColor: t.colors.accent }}
                          title={`Accent: ${t.colors.accent}`}
                        />
                        <span
                          className="h-5 w-5 rounded-lg shadow-sm border border-black/10"
                          style={{ backgroundColor: t.colors.bg }}
                          title={`Background: ${t.colors.bg}`}
                        />
                      </div>
                    </div>

                    {/* Action button */}
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
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
