import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Chatting from "../component/Chatting.jsx";
import { api, useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import {
  LogOut,
  User as UserIcon,
  Search,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  ArrowLeft,
  Palette,
} from "lucide-react";
import toast from "react-hot-toast";

const ChatPage = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await api.get("/users");
        if (res.data?.users) {
          setUsers(res.data.users);
        }
      } catch (err) {
        console.error("Failed to fetch registered users:", err);
        toast.error("Could not load registered users.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };

  const filteredUsersList = users.filter((u) => {
    const name = u.fullName || u.email || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="nexus-chat-shell">
      <div className="nexus-orb orb-one" />
      <div className="nexus-orb orb-two" />

      <div
        className={`nexus-sidebar ${selectedFriend ? "hidden md:flex" : "flex"}`}
      >
        <div className="nexus-sidebar-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="nexus-brand-mark">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">NexusChat</h1>
                <span className="nexus-live-status">
                  <span className="nexus-status-dot" />
                  Aurora sync
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="profile-chip">
                <div className="profile-avatar">
                  {user?.fullName?.charAt(0).toUpperCase() || <UserIcon className="h-3.5 w-3.5" />}
                </div>
                <span className="truncate">{user?.fullName?.split(" ")[0] || "User"}</span>
              </div>

              <button onClick={handleLogout} title="Logout" className="icon-button danger" aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="search-shell">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="sidebar-section-header">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-cyan-300" />
            Direct Messages
          </span>
          <span className="count-pill">{filteredUsersList.length} online</span>
        </div>

        <div className="sidebar-list">
          {loadingUsers ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              <p className="text-xs text-slate-400">Loading workspace contacts...</p>
            </div>
          ) : filteredUsersList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <Users className="mx-auto mb-2 h-8 w-8 text-slate-600" />
              <p>No registered contacts found.</p>
            </div>
          ) : (
            filteredUsersList.map((u) => {
              const isOnline = onlineUsers.includes(u._id);
              const isSelected = selectedFriend?._id === u._id;

              return (
                <motion.div
                  key={u._id}
                  layout
                  whileHover={{ x: 4, scale: 1.01 }}
                  onClick={() => setSelectedFriend(u)}
                  className={`contact-card ${isSelected ? "selected" : ""}`}
                >
                  {isSelected && <div className="contact-accent" />}

                  <div className="relative flex-shrink-0">
                    <div className="contact-avatar gradient-sunset">
                      {u.fullName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className={`presence-badge ${isOnline ? "online" : "offline"}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="truncate text-sm font-semibold text-white">{u.fullName || "User"}</h2>
                      <span className={`status-chip ${isOnline ? "is-online" : ""}`}>
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-400">{u.email}</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <div className={`main-chat-panel ${!selectedFriend ? "hidden md:flex" : "flex"}`}>
        {selectedFriend ? (
          <div className="relative flex h-full flex-col">
            <div className="md:hidden flex items-center gap-2 border-b border-white/10 bg-slate-950/80 p-3">
              <button onClick={() => setSelectedFriend(null)} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/60 px-4 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF007A] via-[#9B5DE5] to-[#00F0FF] text-lg font-bold text-white shadow-lg shadow-[#ff007a]/20">
                  {selectedFriend.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{selectedFriend.fullName || "User"}</h2>
                  <p className="text-[11px] text-emerald-300">Active now</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                >
                  <Palette className="h-3.5 w-3.5" />
                  Theme Studio
                </Link>
              </div>
            </div>

            <div className="h-full overflow-hidden">
              <Chatting selectedFriend={selectedFriend} currentUser={user} />
            </div>
          </div>
        ) : (
          <div className="empty-state-shell">
            <div className="nexus-orb orb-three" />

            <div className="relative z-10 max-w-md space-y-6 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] border border-cyan-400/20 bg-gradient-to-br from-[#FF007A]/20 to-[#00F0FF]/20 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
                <MessageSquare className="h-12 w-12 text-cyan-300" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-white">
                  Welcome to NexusChat,
                  <span className="block bg-gradient-to-r from-[#FF007A] via-[#A855F7] to-[#00F0FF] bg-clip-text text-transparent">
                    {user?.fullName || "User"}
                  </span>
                </h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  Select a contact to begin a glow-rich, realtime conversation and experience the Aurora messaging flow.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 text-left">
                <div className="nexus-info-card">
                  <ShieldCheck className="mb-2 h-5 w-5 text-cyan-300" />
                  <p className="text-xs font-bold text-white">256-bit security</p>
                  <p className="text-[10px] text-slate-400">Encrypted in transit</p>
                </div>
                <div className="nexus-info-card">
                  <Sparkles className="mb-2 h-5 w-5 text-pink-300" />
                  <p className="text-xs font-bold text-white">Realtime sync</p>
                  <p className="text-[10px] text-slate-400">Zero-latency feel</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
