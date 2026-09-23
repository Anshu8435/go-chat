import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Chatting from "../component/Chatting.jsx";
import { api, useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeQuickSwitch from "../component/ThemeQuickSwitch.jsx";
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
  Pin,
  Settings,
  X,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";
import toast from "react-hot-toast";

const formatLastMessageTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString([], { month: "numeric", day: "numeric", year: "2-digit" });
};

const ChatPage = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "online" | "pinned"
  const [pinnedUserIds, setPinnedUserIds] = useState(() => {
    try {
      const saved = localStorage.getItem("gochat-pinned");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedFriend, setSelectedFriend] = useState(null);

  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { activeTheme } = useTheme();
  const navigate = useNavigate();

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

  // WhatsApp-style: Reorder conversation list to top on new message
  useEffect(() => {
    if (!socket) return;

    const handleMessageReorder = (newMsg) => {
      const currentUserId = String(user?._id || user?.id || "");
      const partnerId =
        String(newMsg.senderId) === currentUserId
          ? String(newMsg.receiverId)
          : String(newMsg.senderId);

      setUsers((prevUsers) => {
        const partnerIndex = prevUsers.findIndex((u) => String(u._id) === partnerId);
        if (partnerIndex === -1) return prevUsers;

        const targetUser = {
          ...prevUsers[partnerIndex],
          lastMessage: newMsg.message || "",
          lastFileType: newMsg.fileType || "",
          lastFileName: newMsg.fileName || "",
          lastMessageAt: newMsg.createdAt || new Date().toISOString(),
          lastSenderId: newMsg.senderId,
        };

        const remainingUsers = prevUsers.filter((u) => String(u._id) !== partnerId);
        // Place conversation at the very top of the list!
        return [targetUser, ...remainingUsers];
      });
    };

    socket.on("newMessage", handleMessageReorder);
    socket.on("receive_message", handleMessageReorder);

    return () => {
      socket.off("newMessage", handleMessageReorder);
      socket.off("receive_message", handleMessageReorder);
    };
  }, [socket, user]);

  // Synchronize real-time online status into users array
  useEffect(() => {
    if (!onlineUsers || onlineUsers.length === 0) return;
    setUsers((prev) =>
      prev.map((u) => {
        const isNowOnline = onlineUsers.some((id) => String(id) === String(u._id));
        if (u.isOnline !== isNowOnline) {
          return { ...u, isOnline: isNowOnline };
        }
        return u;
      })
    );
  }, [onlineUsers]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const togglePin = (userId, e) => {
    e.stopPropagation();
    setPinnedUserIds((prev) => {
      const updated = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
      try {
        localStorage.setItem("gochat-pinned", JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
      return updated;
    });
  };

  const isUserOnline = (userObjOrId) => {
    const targetId = String(userObjOrId?._id || userObjOrId?.id || userObjOrId);
    return (
      onlineUsers.some((id) => String(id) === targetId) ||
      Boolean(userObjOrId?.isOnline)
    );
  };

  const filteredUsersList = users
    .filter((u) => {
      const name = u.fullName || u.email || "";
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const online = isUserOnline(u);
      const isPinned = pinnedUserIds.includes(u._id);

      if (activeTab === "online") return online;
      if (activeTab === "pinned") return isPinned;
      return true;
    })
    .sort((a, b) => {
      // Pinned contacts always stay on top
      const aPinned = pinnedUserIds.includes(a._id);
      const bPinned = pinnedUserIds.includes(b._id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      // Within pinned / unpinned, sort by latest message time
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      if (timeA && timeB) return timeB - timeA;
      if (timeA) return -1;
      if (timeB) return 1;
      return (a.fullName || "").localeCompare(b.fullName || "");
    });

  const onlineCount = users.filter((u) => isUserOnline(u._id)).length;

  return (
    <div
      className="nexus-chat-shell"
      style={{
        backgroundColor: "var(--bg-page)",
        color: "var(--text-main)",
      }}
    >
      {/* Sidebar */}
      <aside className={`nexus-sidebar ${selectedFriend ? "hidden md:flex" : "flex"}`}>
        {/* Header */}
        <div className="nexus-sidebar-header">
          <div className="flex items-center justify-between gap-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="nexus-brand-mark">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-[var(--text-sidebar,var(--text-main))] font-heading leading-tight">
                  GoChat
                </h1>
                <span className="nexus-live-status">
                  <span className="nexus-status-dot" />
                  Live Workspace
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1.5">
              <ThemeQuickSwitch compact />

              <Link to="/dashboard" className="profile-chip" title="Profile & Settings">
                <div className="profile-avatar overflow-hidden">
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.fullName || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.fullName?.charAt(0).toUpperCase() || <UserIcon className="h-3.5 w-3.5" />
                  )}
                </div>
                <span className="truncate max-w-[70px]">
                  {user?.fullName?.split(" ")[0] || "User"}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="icon-button danger"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-shell">
            <Search className="h-4 w-4 text-zinc-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search contacts or direct messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search contacts"
              className="text-black placeholder:text-zinc-500 font-medium"
              style={{ color: "#000000" }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-zinc-400 hover:text-black p-0.5"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition ${
                activeTab === "all"
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("online")}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeTab === "online"
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Online ({onlineCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pinned")}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition flex items-center gap-1 ${
                activeTab === "pinned"
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              <Pin className="h-3 w-3" />
              Pinned ({pinnedUserIds.length})
            </button>
          </div>
        </div>

        {/* Contact List Header */}
        <div className="sidebar-section-header">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[var(--primary)]" />
            Direct Messages
          </span>
          <span className="count-pill">{filteredUsersList.length} shown</span>
        </div>

        {/* Contacts Container */}
        <div className="sidebar-list">
          {loadingUsers ? (
            <div className="p-8 text-center">
              <div
                className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
              />
              <p className="text-xs text-[var(--text-muted)]">Loading contacts...</p>
            </div>
          ) : filteredUsersList.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
              <p>No contacts found.</p>
            </div>
          ) : (
            filteredUsersList.map((u) => {
              const online = isUserOnline(u._id);
              const isSelected = selectedFriend?._id === u._id;
              const isPinned = pinnedUserIds.includes(u._id);
              const isMe = String(u.lastSenderId) === String(user?._id || user?.id);

              return (
                <motion.div
                  key={u._id}
                  layout
                  whileHover={{ x: 3 }}
                  onClick={() => setSelectedFriend(u)}
                  className={`contact-card ${isSelected ? "selected" : ""}`}
                >
                  {isSelected && <div className="contact-accent" />}

                  <div className="relative flex-shrink-0">
                    <div className="contact-avatar overflow-hidden">
                      {u.profilePic ? (
                        <img
                          src={u.profilePic}
                          alt={u.fullName || "User"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        u.fullName?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <span className={`presence-badge ${online ? "online" : "offline"}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <h2 className="truncate text-xs font-bold text-[var(--text-sidebar,var(--text-main))]">
                        {u.fullName || "User"}
                      </h2>
                      <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px] text-[var(--text-sidebar-muted,var(--text-muted))]">
                        {u.lastMessageAt && (
                          <span className="font-medium">{formatLastMessageTime(u.lastMessageAt)}</span>
                        )}
                        {isPinned && (
                          <Pin className="h-3 w-3 text-[var(--primary)] fill-[var(--primary)]" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="truncate text-[11px] text-[var(--text-sidebar-muted,var(--text-muted))] flex items-center gap-1 min-w-0 pr-1">
                        {u.lastFileType === "image" ? (
                          <span className="inline-flex items-center gap-1 text-[var(--primary)] font-medium">
                            <ImageIcon className="w-3 h-3" /> Photo
                          </span>
                        ) : u.lastFileType === "file" ? (
                          <span className="inline-flex items-center gap-1 text-[var(--secondary)] font-medium">
                            <Paperclip className="w-3 h-3" /> {u.lastFileName || "File"}
                          </span>
                        ) : u.lastMessage ? (
                          <span className="truncate">
                            {isMe ? <span className="font-semibold text-[var(--text-main)]">You: </span> : null}
                            {u.lastMessage}
                          </span>
                        ) : (
                          <span className="truncate opacity-75">{u.bio || u.email}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`status-chip ${online ? "is-online" : ""}`}>
                          {online ? "Online" : "Offline"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => togglePin(u._id, e)}
                          title={isPinned ? "Unpin contact" : "Pin contact to top"}
                          className="opacity-0 group-hover:opacity-100 hover:text-[var(--primary)] text-[var(--text-sidebar-muted,var(--text-muted))] transition p-1"
                        >
                          <Pin className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-sidebar)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <Link
            to="/settings"
            className="flex items-center gap-1.5 hover:text-[var(--primary)] transition font-medium"
          >
            <Palette className="h-3.5 w-3.5" />
            Theme Studio
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 hover:text-[var(--primary)] transition font-medium"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <main className={`main-chat-panel ${!selectedFriend ? "hidden md:flex" : "flex"}`}>
        {selectedFriend ? (
          <div className="relative flex h-full flex-col">
            {/* Mobile Back Header */}
            <div className="md:hidden flex items-center justify-between border-b border-[var(--border)] bg-[var(--header-bg)] p-3">
              <button
                type="button"
                onClick={() => setSelectedFriend(null)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Contacts
              </button>

              <ThemeQuickSwitch compact />
            </div>

            {/* Chat Content */}
            <div className="h-full overflow-hidden">
              <Chatting
                selectedFriend={selectedFriend}
                currentUser={user}
                onBack={() => setSelectedFriend(null)}
              />
            </div>
          </div>
        ) : (
          /* Empty State Welcome Screen */
          <div className="empty-state-shell">
            <div className="relative z-10 max-w-lg space-y-6 text-center px-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-[var(--border)] shadow-2xl backdrop-blur-xl"
                style={{
                  background: `linear-gradient(135deg, ${activeTheme.colors.primary}22, ${activeTheme.colors.secondary}22)`,
                  boxShadow: "0 10px 40px -10px var(--shadow-glow)",
                }}
              >
                <MessageSquare className="h-12 w-12 text-[var(--primary)]" />
              </motion.div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                  <Sparkles className="h-3 w-3" />
                  Enterprise Messaging
                </span>
                <h2 className="text-3xl font-extrabold text-[var(--text-main)] font-heading">
                  Welcome to GoChat,{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${activeTheme.colors.primary}, ${activeTheme.colors.secondary})`,
                    }}
                  >
                    {user?.fullName || "User"}
                  </span>
                </h2>
                <p className="text-sm leading-relaxed text-[var(--text-muted)] max-w-md mx-auto">
                  Select a contact on the left to initiate a secure, encrypted real-time
                  conversation with zero latency.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                <div className="nexus-info-card">
                  <ShieldCheck className="mb-2 h-5 w-5 text-emerald-400" />
                  <p className="text-xs font-bold text-[var(--text-main)]">256-bit Encrypted</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Secure in-transit delivery</p>
                </div>
                <div className="nexus-info-card">
                  <Sparkles className="mb-2 h-5 w-5 text-[var(--primary)]" />
                  <p className="text-xs font-bold text-[var(--text-main)]">
                    Seven Enterprise Themes
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">Fully synced UI styling</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-2.5 text-xs font-bold text-[var(--primary)] hover:border-[var(--primary)] transition shadow-sm"
                >
                  <Palette className="h-4 w-4" />
                  Explore Theme Studio
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
