import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera,
  Eye,
  EyeOff,
  Image as ImageIcon,
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
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, changePassword, loading } = useAuth();

  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    profilePic: "",
  });

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
        toast.success("Profile photo loaded! Click 'Save profile' to persist.");
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
    toast("Photo removed. Click 'Save profile' to confirm.");
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

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
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
      <div className="flex min-h-screen items-center justify-center theme-shell" style={{ color: "var(--text)" }}>
        <div className="rounded-2xl px-6 py-4 theme-soft">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-shell" style={{ color: "var(--text)" }}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER BAR */}
        <header
          className="mb-8 flex flex-col gap-4 rounded-3xl p-5 shadow-2xl md:flex-row md:items-center md:justify-between"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--line)",
            boxShadow: "0 25px 50px var(--shadow-glow)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-lg font-bold text-white shadow-lg shadow-emerald-500/30 overflow-hidden relative border border-white/20">
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
              <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Dashboard</p>
              <h1 className="mt-1 text-2xl font-bold text-white">Welcome back, {user.fullName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/chatPage"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Open Chat
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            {/* PROFILE & PHOTO EDIT SECTION */}
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-xl shadow-slate-950/20">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-300">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Account</p>
                  <h2 className="text-xl font-semibold text-white">Profile & Photo</h2>
                </div>
              </div>

              {/* PHOTO UPLOAD & PREVIEW WIDGET */}
              <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900/60 p-5 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-2xl font-bold text-white">
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
                    title="Change profile picture"
                    className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h3 className="text-sm font-semibold text-white">Your Profile Avatar</h3>
                  <p className="text-xs text-slate-400">
                    Upload a custom photo (JPEG, PNG, WebP). Your picture will be visible to your contacts in chat.
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-semibold transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {profileData.profilePic ? "Change Photo" : "Upload Photo"}
                    </button>

                    {profileData.profilePic && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* PROFILE FORM */}
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">Full Name</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3">
                      <UserRound className="h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                        placeholder="John Doe"
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">Phone</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">Email address</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                      placeholder="name@example.com"
                    />
                  </div>
                </label>

                {/* BIO / STATUS */}
                <label className="block space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Bio / Status</span>
                    <span className="text-xs text-slate-500">{profileData.bio.length}/200</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3">
                    <PencilLine className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value.slice(0, 200) })
                      }
                      rows={3}
                      className="w-full resize-none bg-transparent text-white outline-none placeholder:text-slate-500 text-sm leading-relaxed"
                      placeholder="Write a short bio or status message (e.g. 'Available', 'Building cool stuff 🚀')…"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Visible to your contacts in the chat sidebar.
                  </p>
                </label>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <p className="text-sm text-slate-400">Save your profile details and photo to your account.</p>
                  <button
                    type="submit"
                    disabled={savingProfile || isProcessingPhoto}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    {savingProfile ? "Saving..." : "Save profile"}
                  </button>
                </div>
              </form>
            </section>

            {/* PASSWORD UPDATE SECTION */}
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/20">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-sky-500/10 p-2 text-sky-300">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Security</p>
                  <h2 className="text-xl font-semibold text-white">Update password</h2>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">Current password</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-slate-400 transition hover:text-white"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">New password</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3">
                      <ShieldCheck className="h-4 w-4 text-slate-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                        placeholder="Minimum 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-slate-400 transition hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">Confirm password</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3">
                      <ShieldCheck className="h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <p className="text-sm text-slate-400">Use a strong password for better protection.</p>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                  >
                    <PencilLine className="h-4 w-4" />
                    {savingPassword ? "Updating..." : "Update password"}
                  </button>
                </div>
              </form>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Summary</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Account overview</h3>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center font-bold text-emerald-400 shrink-0">
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
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Name</p>
                    <p className="mt-0.5 text-base font-semibold text-white truncate">{user.fullName}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Email</p>
                  <p className="mt-2 text-sm font-semibold text-white break-all">{user.email}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Status</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-emerald-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active account
                  </p>
                </div>

                {(profileData.bio || user?.bio) && (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Bio</p>
                    <p className="mt-2 text-sm text-slate-300 leading-relaxed break-words">
                      {profileData.bio || user.bio}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Quick links</p>

              <div className="mt-4 space-y-3">
                <Link
                  to="/chatPage"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-slate-200 transition hover:bg-slate-800"
                >
                  <span>Messages</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300">Open</span>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-slate-200 transition hover:bg-slate-800"
                >
                  <span>Theme settings</span>
                  <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-xs text-cyan-300">Edit</span>
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
