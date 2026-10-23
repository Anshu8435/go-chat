import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Mail,
  PencilLine,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  Palette,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ThemeQuickSwitch from "../component/ThemeQuickSwitch";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, changePassword, loading } = useAuth();
  const { activeTheme } = useTheme();

  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState(() => ({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    profilePic: user?.profilePic || "",
  }));

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        profilePic: user.profilePic || "",
      });
    }
  }, [user]);

  const initials = useMemo(() => {
    if (!profileData.fullName) return "U";
    return profileData.fullName
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [profileData.fullName]);

  // Handle Photo selection and client-side optimization
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP).");
      return;
    }

    setIsProcessingPhoto(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimize to max 400x400 to keep it lightweight (~30-50kb)
        const canvas = document.createElement("canvas");
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setProfileData((prev) => ({ ...prev, profilePic: compressedDataUrl }));
        setIsProcessingPhoto(false);
        toast.success("Profile photo loaded! Click 'Save Profile' to persist.");
      };

      img.onerror = () => {
        setIsProcessingPhoto(false);
        toast.error("Could not process this image.");
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    setProfileData((prev) => ({ ...prev, profilePic: "" }));
    toast("Photo removed. Click 'Save Profile' to confirm.");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileData.fullName.trim() || !profileData.email.trim()) {
      toast.error("Full name and email are required.");
      return;
    }

    setSavingProfile(true);

    try {
      await updateProfile({
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio,
        profilePic: profileData.profilePic,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Profile update failed.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setSavingPassword(true);

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password updated successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Password update failed.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (loading || !user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center theme-shell"
        style={{ color: "var(--text-main)", backgroundColor: "var(--bg-page)" }}
      >
        <div className="rounded-2xl px-6 py-4 border border-[var(--border)] bg-[var(--bg-card)]">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen theme-shell transition-colors duration-200"
      style={{ backgroundColor: "var(--bg-page)", color: "var(--text-main)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <header className="mb-8 flex flex-col gap-4 rounded-3xl p-6 shadow-xl border border-[var(--border)] bg-[var(--bg-card)] md:flex-row md:items-center md:justify-between backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg overflow-hidden relative border border-[var(--border)]"
              style={{
                background: `linear-gradient(135deg, ${activeTheme.colors.primary}, ${activeTheme.colors.secondary})`,
              }}
            >
              {profileData.profilePic ? (
                <img
                  src={profileData.profilePic}
                  alt={user.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                Enterprise Dashboard
              </p>
              <h1 className="mt-1 text-2xl font-black text-[var(--text-main)] font-heading">
                Welcome back, {user.fullName}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeQuickSwitch />

            <Link
              to="/chatPage"
              className="theme-button-primary rounded-xl px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Open Chat
            </Link>

            <Link
              to="/settings?tab=privacy"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] transition hover:border-[var(--primary)]"
            >
              <ShieldCheck className="h-3.5 w-3.5 inline mr-1 text-emerald-400" />
              Privacy & Status
            </Link>

            <Link
              to="/settings"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] transition hover:border-[var(--primary)]"
            >
              <Palette className="h-3.5 w-3.5 inline mr-1 text-[var(--primary)]" />
              Theme Studio
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/20 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </header>

        {/* Content Columns */}
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            {/* Profile Section */}
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--bg-surface)] p-2.5 text-[var(--primary)] border border-[var(--border)]">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Account Profile
                  </p>
                  <h2 className="text-xl font-bold text-[var(--text-main)]">Profile & Photo</h2>
                </div>
              </div>

              {/* Photo Box */}
              <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <div
                    className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[var(--primary)]/50 shadow-xl flex items-center justify-center text-2xl font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${activeTheme.colors.primary}, ${activeTheme.colors.secondary})`,
                    }}
                  >
                    {profileData.profilePic ? (
                      <img
                        src={profileData.profilePic}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change profile photo"
                    className="absolute -bottom-2 -right-2 p-2 rounded-xl text-white shadow-lg transition-all cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${activeTheme.colors.primary}, ${activeTheme.colors.secondary})`,
                    }}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h3 className="text-sm font-bold text-[var(--text-main)]">Your Profile Avatar</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Upload an avatar image (JPEG, PNG, WebP). Your picture is automatically
                    optimized and rendered for your contacts in live chat.
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isProcessingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--primary)] hover:border-[var(--primary)] text-xs font-bold transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {profileData.profilePic ? "Change Photo" : "Upload Photo"}
                    </button>

                    {profileData.profilePic && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      Full Name
                    </span>
                    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-3">
                      <UserRound className="h-4 w-4 text-[var(--text-muted)] flex-shrink-0" />
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, fullName: e.target.value })
                        }
                        className="w-full bg-transparent text-[var(--text-main)] outline-none text-sm font-medium"
                        placeholder="John Doe"
                      />
                    </div>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Phone</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-3">
                      <Phone className="h-4 w-4 text-[var(--text-muted)] flex-shrink-0" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full bg-transparent text-[var(--text-main)] outline-none text-sm font-medium"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </label>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">
                    Email address
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-3">
                    <Mail className="h-4 w-4 text-[var(--text-muted)] flex-shrink-0" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full bg-transparent text-[var(--text-main)] outline-none text-sm font-medium"
                      placeholder="name@example.com"
                    />
                  </div>
                </label>

                <label className="block space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      Bio / Status
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {profileData.bio.length}/200
                    </span>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-3">
                    <PencilLine className="h-4 w-4 text-[var(--text-muted)] mt-0.5 shrink-0" />
                    <textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value.slice(0, 200) })
                      }
                      rows={3}
                      className="w-full resize-none bg-transparent text-[var(--text-main)] outline-none text-sm leading-relaxed"
                      placeholder="Write a brief status message (e.g. 'Available for messaging 🚀')…"
                    />
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Visible to all contacts in the chat sidebar.
                  </p>
                </label>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--text-muted)]">
                    Persist your profile updates across sessions.
                  </p>
                  <button
                    type="submit"
                    disabled={savingProfile || isProcessingPhoto}
                    className="theme-button-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    {savingProfile ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </section>

            {/* Password Section */}
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--bg-surface)] p-2.5 text-[var(--secondary)] border border-[var(--border)]">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Credentials
                  </p>
                  <h2 className="text-xl font-bold text-[var(--text-main)]">Change Password</h2>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">
                    Current Password
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-3">
                    <Lock className="h-4 w-4 text-[var(--text-muted)] flex-shrink-0" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      className="w-full bg-transparent text-[var(--text-main)] outline-none text-sm font-medium"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      New Password
                    </span>
                    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-3">
                      <ShieldCheck className="h-4 w-4 text-[var(--text-muted)] flex-shrink-0" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        className="w-full bg-transparent text-[var(--text-main)] outline-none text-sm font-medium"
                        placeholder="At least 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      Confirm Password
                    </span>
                    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-3">
                      <ShieldCheck className="h-4 w-4 text-[var(--text-muted)] flex-shrink-0" />
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className="w-full bg-transparent text-[var(--text-main)] outline-none text-sm font-medium"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--text-muted)]">
                    Use letters, numbers, and symbols for high security.
                  </p>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] px-5 py-2.5 text-xs font-bold text-[var(--text-main)] transition cursor-pointer disabled:opacity-50"
                  >
                    {savingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right Column: Account Overview */}
          <aside className="space-y-6">
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                Account Summary
              </p>
              <h3 className="mt-1 text-xl font-bold text-[var(--text-main)]">Live Profile Card</h3>

              <div className="mt-6 space-y-3.5">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl text-white overflow-hidden flex items-center justify-center font-bold text-sm shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${activeTheme.colors.primary}, ${activeTheme.colors.secondary})`,
                    }}
                  >
                    {profileData.profilePic ? (
                      <img
                        src={profileData.profilePic}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Display Name
                    </p>
                    <p className="text-sm font-bold text-[var(--text-main)] truncate">
                      {user.fullName}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Registered Email
                  </p>
                  <p className="mt-1 text-xs font-medium text-[var(--text-main)] break-all">
                    {user.email}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Realtime Presence
                  </p>
                  <p className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Connected to WebSocket Cluster
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Active Theme Token
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--primary)] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    {activeTheme.name} ({activeTheme.category})
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Quick Navigation
              </p>

              <div className="mt-4 space-y-2.5">
                <Link
                  to="/chatPage"
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3 text-xs font-semibold text-[var(--text-main)] transition hover:border-[var(--primary)] hover:bg-[var(--bg-card)]"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[var(--primary)]" />
                    Workspace Chat
                  </span>
                  <span className="rounded-full bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 text-[10px] font-bold">
                    Open
                  </span>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3 text-xs font-semibold text-[var(--text-main)] transition hover:border-[var(--primary)] hover:bg-[var(--bg-card)]"
                >
                  <span className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-[var(--secondary)]" />
                    Theme Studio
                  </span>
                  <span className="rounded-full bg-[var(--secondary)]/10 text-[var(--secondary)] px-2 py-0.5 text-[10px] font-bold">
                    7 Themes
                  </span>
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
