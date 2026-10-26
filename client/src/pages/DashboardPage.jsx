import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, LogOut, Mail, PencilLine, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, changePassword, loading } = useAuth();

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
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

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const initials = useMemo(() => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user]);

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
      });
      toast.success("Profile updated successfully.");
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
        <header
          className="mb-8 flex flex-col gap-4 rounded-3xl p-5 shadow-2xl md:flex-row md:items-center md:justify-between"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--line)",
            boxShadow: "0 25px 50px var(--shadow-glow)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-lg font-bold text-white shadow-lg shadow-emerald-500/30">
              {initials}
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
              className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/20">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-300">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Account</p>
                  <h2 className="text-xl font-semibold text-white">Profile information</h2>
                </div>
              </div>

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
                        placeholder="+92 300 1234567"
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

                <div className="flex items-center justify-between gap-3 pt-2">
                  <p className="text-sm text-slate-400">Profile data is saved to your account.</p>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Save className="h-4 w-4" />
                    {savingProfile ? "Saving..." : "Save profile"}
                  </button>
                </div>
              </form>
            </section>

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
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
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
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Name</p>
                  <p className="mt-2 text-lg font-semibold text-white">{user.fullName}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Email</p>
                  <p className="mt-2 text-lg font-semibold text-white break-all">{user.email}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Status</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-emerald-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    Active account
                  </p>
                </div>
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
