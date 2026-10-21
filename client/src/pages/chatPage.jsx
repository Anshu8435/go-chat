import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Chatting from "../component/Chatting.jsx";
import AddContactModal from "../component/AddContactModal.jsx";
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
  Palette,
  Pin,
  Settings,
  X,
  Image as ImageIcon,
  Paperclip,
  UserPlus,
  Mail,
  Clock,
  Radio,
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

const formatLastSeen = (dateStr) => {
  if (!dateStr) return "Offline";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const ChatPage = () => {
  // Navigation Sections: "chats" | "online" | "requests"
  const [activeSection, setActiveSection] = useState("chats");

  // Chats list
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);

  // Online contacts list
  const [onlineContacts, setOnlineContacts] = useState([]);
  const [loadingOnline, setLoadingOnline] = useState(false);
  const [contactsSubTab, setContactsSubTab] = useState("online"); // "online" | "all"

  // All personal contacts
  const [personalContacts, setPersonalContacts] = useState([]);

  // Message Requests
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedUserIds, setPinnedUserIds] = useState(() => {
    try {
      const saved = localStorage.getItem("gochat-pinned");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected Chat Partner
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Add Contact Modal State
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);

  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { activeTheme } = useTheme();
  const navigate = useNavigate();

  // 1. Fetch Chats (accepted & active conversations)
  const fetchChats = useCallback(async () => {
    try {
      setLoadingChats(true);
      const res = await api.get("/conversations/chats");
      if (res.data?.chats) {
        setChats(res.data.chats);
      }
    } catch (err) {
      console.warn("Falling back to users API:", err.message);
      // Fallback to legacy /users endpoint if /conversations/chats has an issue
      try {
        const fallbackRes = await api.get("/users");
        if (fallbackRes.data?.users) {
          setChats(fallbackRes.data.users);
        }
      } catch (fbErr) {
        console.error("Failed to load chats:", fbErr);
      }
    } finally {
      setLoadingChats(false);
    }
  }, []);

  // 2. Fetch Incoming Message Requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get("/conversations/requests");
      if (res.data?.requests) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error("Failed to load message requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  // 3. Fetch Online Contacts & All Personal Contacts
  const fetchContactsAndOnline = useCallback(async () => {
    try {
      setLoadingOnline(true);
      const [onlineRes, contactsRes] = await Promise.allSettled([
        api.get("/contacts/online"),
        api.get("/contacts"),
      ]);

      if (onlineRes.status === "fulfilled" && onlineRes.value.data?.onlineContacts) {
        setOnlineContacts(onlineRes.value.data.onlineContacts);
      }
      if (contactsRes.status === "fulfilled" && contactsRes.value.data?.contacts) {
        setPersonalContacts(contactsRes.value.data.contacts);
      }
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setLoadingOnline(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchChats();
    fetchRequests();
    fetchContactsAndOnline();
  }, [fetchChats, fetchRequests, fetchContactsAndOnline]);

  // When switching sections, refresh relevant section data
  useEffect(() => {
    if (activeSection === "chats") {
      fetchChats();
    } else if (activeSection === "online") {
      fetchContactsAndOnline();
    } else if (activeSection === "requests") {
      fetchRequests();
    }
  }, [activeSection, fetchChats, fetchRequests, fetchContactsAndOnline]);

  // WhatsApp-style: Reorder conversation list on new message & handle incoming requests
  useEffect(() => {
    if (!socket) return;

    const currentUserId = String(user?._id || user?.id || "");

    const handleNewMessage = (newMsg) => {
      const partnerId =
        String(newMsg.senderId) === currentUserId
          ? String(newMsg.receiverId)
          : String(newMsg.senderId);

      setChats((prevChats) => {
        const partnerIndex = prevChats.findIndex((u) => String(u._id) === partnerId);
        if (partnerIndex === -1) {
          // If not in current chats, refresh chats and requests to capture incoming messages
          fetchChats();
          fetchRequests();
          return prevChats;
        }

        const targetChat = {
          ...prevChats[partnerIndex],
          lastMessage: newMsg.message || "",
          lastFileType: newMsg.fileType || "",
          lastFileName: newMsg.fileName || "",
          lastMessageAt: newMsg.createdAt || new Date().toISOString(),
          lastSenderId: newMsg.senderId,
          unreadCount:
            String(newMsg.senderId) !== currentUserId &&
            selectedFriend?._id !== partnerId
              ? (prevChats[partnerIndex].unreadCount || 0) + 1
              : 0,
        };

        const remainingChats = prevChats.filter((u) => String(u._id) !== partnerId);
        return [targetChat, ...remainingChats];
      });
    };

    const handleNewMessageRequest = (reqPayload) => {
      toast.success(
        `New message request from ${reqPayload.sender?.fullName || "a GoChat user"}!`,
        { icon: "📩", duration: 5000 }
      );
      fetchRequests();
    };

    const handleRequestAccepted = (payload) => {
      fetchChats();
      fetchRequests();
      fetchContactsAndOnline();
      if (selectedFriend && String(selectedFriend._id) === String(payload.partnerId)) {
        setSelectedFriend((prev) => (prev ? { ...prev, isRequest: false, status: "accepted" } : null));
      }
    };

    const handleRequestDeleted = () => {
      fetchRequests();
      setSelectedFriend(null);
    };

    const handlePresenceChanged = (payload) => {
      const targetId = String(payload.userId);
      const isOnline = Boolean(payload.isOnline);

      // Update chats presence
      setChats((prev) =>
        prev.map((c) => (String(c._id) === targetId ? { ...c, isOnline } : c))
      );

      // Update online contacts presence
      setOnlineContacts((prev) => {
        const exists = prev.some((c) => String(c._id) === targetId);
        if (exists) {
          return prev.map((c) => (String(c._id) === targetId ? { ...c, isOnline } : c));
        }
        return prev;
      });

      // Update personal contacts presence
      setPersonalContacts((prev) =>
        prev.map((c) => (String(c._id) === targetId ? { ...c, isOnline } : c))
      );

      // Update currently active friend presence
      if (selectedFriend && String(selectedFriend._id) === targetId) {
        setSelectedFriend((prev) => (prev ? { ...prev, isOnline } : null));
      }
    };

    const handleContactAdded = () => {
      fetchChats();
      fetchContactsAndOnline();
    };

    const handleContactRemoved = () => {
      fetchChats();
      fetchContactsAndOnline();
    };

    const handleMessagesRead = (payload) => {
      const readerId = String(payload.readerId);
      setChats((prev) =>
        prev.map((c) => (String(c._id) === readerId ? { ...c, unreadCount: 0 } : c))
      );
    };

    const handlePrivacySettingsUpdated = () => {
      fetchChats();
      fetchContactsAndOnline();
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("receive_message", handleNewMessage);
    socket.on("newMessageRequest", handleNewMessageRequest);
    socket.on("requestAccepted", handleRequestAccepted);
    socket.on("requestDeleted", handleRequestDeleted);
    socket.on("contactPresenceChanged", handlePresenceChanged);
    socket.on("userPresenceChanged", handlePresenceChanged);
    socket.on("contactAdded", handleContactAdded);
    socket.on("contactRemoved", handleContactRemoved);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("privacySettingsUpdated", handlePrivacySettingsUpdated);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("receive_message", handleNewMessage);
      socket.off("newMessageRequest", handleNewMessageRequest);
      socket.off("requestAccepted", handleRequestAccepted);
      socket.off("requestDeleted", handleRequestDeleted);
      socket.off("contactPresenceChanged", handlePresenceChanged);
      socket.off("userPresenceChanged", handlePresenceChanged);
      socket.off("contactAdded", handleContactAdded);
      socket.off("contactRemoved", handleContactRemoved);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("privacySettingsUpdated", handlePrivacySettingsUpdated);
    };
  }, [socket, user, selectedFriend, fetchChats, fetchRequests, fetchContactsAndOnline]);

  // Synchronize authorized online users from socket
  useEffect(() => {
    if (!onlineUsers || onlineUsers.length === 0) return;
    const onlineSet = new Set(onlineUsers.map(String));

    setChats((prev) =>
      prev.map((c) => ({
        ...c,
        isOnline: onlineSet.has(String(c._id)),
      }))
    );

    setOnlineContacts((prev) =>
      prev.map((c) => ({
        ...c,
        isOnline: onlineSet.has(String(c._id)),
      }))
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

  // Filtered Chats
  const filteredChats = chats
    .filter((u) => {
      const name = u.fullName || u.email || "";
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const aPinned = pinnedUserIds.includes(a._id);
      const bPinned = pinnedUserIds.includes(b._id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      if (timeA && timeB) return timeB - timeA;
      if (timeA) return -1;
      if (timeB) return 1;
      return (a.fullName || "").localeCompare(b.fullName || "");
    });

  // Filtered Online / Contacts
  const currentContactsList = contactsSubTab === "online"
    ? onlineContacts.filter((c) => isUserOnline(c))
    : personalContacts;

  const filteredContacts = currentContactsList.filter((u) => {
    const name = u.fullName || u.email || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filtered Requests
  const filteredRequests = requests.filter((r) => {
    const name = r.sender?.fullName || r.sender?.email || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalUnreadChats = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const totalPendingRequests = requests.length;

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
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            <Link to="/" className="flex items-center gap-2 group min-w-0 flex-shrink">
              <div className="nexus-brand-mark flex-shrink-0">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight truncate text-[var(--text-sidebar,var(--text-main))] font-heading leading-tight">
                  GoChat
                </h1>
                <span className="nexus-live-status">
                  <span className="nexus-status-dot" />
                  <span className="truncate">Live</span>
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              <ThemeQuickSwitch compact />

              <Link to="/dashboard" className="profile-chip" title="Profile & Settings">
                <div className="profile-avatar overflow-hidden flex-shrink-0">
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
                <span className="truncate max-w-[60px] hidden sm:inline">
                  {user?.fullName?.split(" ")[0] || "User"}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="icon-button danger h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex-shrink-0"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-shell">
            <Search className="h-4 w-4 text-zinc-500 flex-shrink-0" />
            <input
              type="text"
              placeholder={
                activeSection === "chats"
                  ? "Search conversations..."
                  : activeSection === "online"
                  ? "Search personal contacts..."
                  : "Search message requests..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search contacts"
              className="text-black placeholder:text-zinc-500 font-medium text-xs sm:text-sm"
              style={{ color: "#000000" }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-zinc-400 hover:text-black p-0.5 flex-shrink-0"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* THREE MAIN NAVIGATION TABS: Chats | Online Contacts | Message Requests */}
          <div className="grid grid-cols-3 gap-1 mt-2.5 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setActiveSection("chats")}
              className={`relative py-1.5 px-2 text-[11px] sm:text-xs rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                activeSection === "chats"
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">Chats</span>
              {totalUnreadChats > 0 && (
                <span className="h-4 min-w-[1rem] px-1 rounded-full text-[10px] font-extrabold bg-emerald-400 text-black flex items-center justify-center">
                  {totalUnreadChats}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("online")}
              className={`relative py-1.5 px-2 text-[11px] sm:text-xs rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                activeSection === "online"
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              <Radio className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400 animate-pulse" />
              <span className="truncate">Online</span>
              <span className="h-4 min-w-[1rem] px-1 rounded-full text-[10px] font-extrabold bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center">
                {onlineContacts.filter(isUserOnline).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("requests")}
              className={`relative py-1.5 px-2 text-[11px] sm:text-xs rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                activeSection === "requests"
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">Requests</span>
              {totalPendingRequests > 0 && (
                <span className="h-4 min-w-[1rem] px-1 rounded-full text-[10px] font-black bg-amber-400 text-black flex items-center justify-center animate-bounce">
                  {totalPendingRequests}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 1: CHATS VIEW */}
        {activeSection === "chats" && (
          <>
            <div className="sidebar-section-header flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-[var(--primary)]" />
                Active Chats
              </span>
              <div className="flex items-center gap-2">
                <span className="count-pill">{filteredChats.length} conversations</span>
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(true)}
                  className="p-1 rounded-lg text-[var(--primary)] hover:bg-[var(--bg-surface)] transition"
                  title="Add New Contact"
                  aria-label="Add New Contact"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="sidebar-list">
              {loadingChats ? (
                <div className="p-8 text-center">
                  <div
                    className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                    style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
                  />
                  <p className="text-xs text-[var(--text-muted)]">Loading conversations...</p>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <p className="font-semibold text-[var(--text-main)]">No active chats yet</p>
                  <p className="text-[11px] max-w-xs mx-auto">
                    Add a contact or start a new conversation to begin messaging!
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddContactModalOpen(true)}
                    className="theme-button-primary px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add First Contact
                  </button>
                </div>
              ) : (
                filteredChats.map((u) => {
                  const online = isUserOnline(u);
                  const isSelected = selectedFriend?._id === u._id;
                  const isPinned = pinnedUserIds.includes(u._id);
                  const isMe = String(u.lastSenderId) === String(user?._id || user?.id);

                  return (
                    <motion.div
                      key={u._id}
                      layout
                      whileHover={{ x: 3 }}
                      onClick={() => {
                        setSelectedFriend({
                          ...u,
                          isRequest: false,
                          isContact: true,
                        });
                        // Clear unread count locally
                        setChats((prev) =>
                          prev.map((c) => (c._id === u._id ? { ...c, unreadCount: 0 } : c))
                        );
                      }}
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
                          <h2 className="truncate text-xs sm:text-sm font-bold text-[var(--text-sidebar,var(--text-main))]">
                            {u.fullName || "User"}
                          </h2>
                          <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px] text-[var(--text-sidebar-muted,var(--text-muted))]">
                            {u.lastMessageAt && (
                              <span className="font-medium whitespace-nowrap">
                                {formatLastMessageTime(u.lastMessageAt)}
                              </span>
                            )}
                            {isPinned && (
                              <Pin className="h-3 w-3 text-[var(--primary)] fill-[var(--primary)] flex-shrink-0" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <div className="truncate text-[11px] text-[var(--text-sidebar-muted,var(--text-muted))] flex items-center gap-1 min-w-0 pr-1">
                            {u.lastFileType === "image" ? (
                              <span className="inline-flex items-center gap-1 text-[var(--primary)] font-medium">
                                <ImageIcon className="w-3 h-3 flex-shrink-0" /> Photo
                              </span>
                            ) : u.lastFileType === "file" ? (
                              <span className="inline-flex items-center gap-1 text-[var(--secondary)] font-medium">
                                <Paperclip className="w-3 h-3 flex-shrink-0" /> {u.lastFileName || "File"}
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

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {u.unreadCount > 0 && (
                              <span className="h-4 min-w-[1rem] px-1 rounded-full text-[10px] font-black bg-emerald-500 text-black flex items-center justify-center">
                                {u.unreadCount}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => togglePin(u._id, e)}
                              title={isPinned ? "Unpin chat" : "Pin chat to top"}
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
          </>
        )}

        {/* SECTION 2: ONLINE CONTACTS VIEW */}
        {activeSection === "online" && (
          <>
            <div className="sidebar-section-header">
              <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-0.5 rounded-lg border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setContactsSubTab("online")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                    contactsSubTab === "online"
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  Online Now ({onlineContacts.filter(isUserOnline).length})
                </button>
                <button
                  type="button"
                  onClick={() => setContactsSubTab("all")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                    contactsSubTab === "all"
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  My Contacts ({personalContacts.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsAddContactModalOpen(true)}
                className="p-1 rounded-lg text-[var(--primary)] hover:bg-[var(--bg-surface)] transition"
                title="Add New Contact"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            </div>

            <div className="sidebar-list">
              {loadingOnline ? (
                <div className="p-8 text-center">
                  <div
                    className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                    style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
                  />
                  <p className="text-xs text-[var(--text-muted)]">Loading contacts...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-emerald-400">
                    <Radio className="h-6 w-6" />
                  </div>
                  <p className="font-semibold text-[var(--text-main)]">
                    {contactsSubTab === "online"
                      ? "No contacts online right now"
                      : "No personal contacts added"}
                  </p>
                  <p className="text-[11px] max-w-xs mx-auto">
                    {contactsSubTab === "online"
                      ? "Only your added contacts and accepted chats appear here when online."
                      : "Add friends to your personal contacts to track their live status and chat."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddContactModalOpen(true)}
                    className="theme-button-primary px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Find Contacts
                  </button>
                </div>
              ) : (
                filteredContacts.map((u) => {
                  const online = isUserOnline(u);
                  const isSelected = selectedFriend?._id === u._id;

                  return (
                    <motion.div
                      key={u._id}
                      layout
                      whileHover={{ x: 3 }}
                      onClick={() => {
                        setSelectedFriend({
                          ...u,
                          isRequest: false,
                          isContact: true,
                        });
                      }}
                      className={`contact-card ${isSelected ? "selected" : ""}`}
                    >
                      {isSelected && <div className="contact-accent" />}

                      <div className="relative flex-shrink-0">
                        <div className="contact-avatar overflow-hidden">
                          {u.profilePic ? (
                            <img
                              src={u.profilePic}
                              alt={u.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            u.fullName?.charAt(0).toUpperCase() || "U"
                          )}
                        </div>
                        <span className={`presence-badge ${online ? "online" : "offline"}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h2 className="truncate text-xs sm:text-sm font-bold text-[var(--text-sidebar,var(--text-main))]">
                            {u.fullName}
                          </h2>
                          <span
                            className={`status-chip ${
                              online ? "is-online" : ""
                            }`}
                          >
                            {online ? "Online" : formatLastSeen(u.lastActive)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-1 text-[11px] text-[var(--text-muted)]">
                          <span className="truncate max-w-[180px]">
                            {u.bio || u.email}
                          </span>
                          <span className="text-[10px] text-[var(--primary)] font-semibold hover:underline">
                            Chat Now →
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* SECTION 3: MESSAGE REQUESTS VIEW */}
        {activeSection === "requests" && (
          <>
            <div className="sidebar-section-header">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-amber-400" />
                Incoming Requests
              </span>
              <span className="count-pill">{filteredRequests.length} pending</span>
            </div>

            <div className="sidebar-list">
              {loadingRequests ? (
                <div className="p-8 text-center">
                  <div
                    className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                    style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
                  />
                  <p className="text-xs text-[var(--text-muted)]">Checking requests...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-amber-400">
                    <Mail className="h-6 w-6" />
                  </div>
                  <p className="font-semibold text-[var(--text-main)]">No pending requests</p>
                  <p className="text-[11px] max-w-xs mx-auto">
                    When someone new sends you a message for the first time, their request will appear here for you to Accept, Delete, or Block.
                  </p>
                </div>
              ) : (
                filteredRequests.map((reqItem) => {
                  const s = reqItem.sender;
                  const isSelected = selectedFriend?._id === s._id;

                  return (
                    <motion.div
                      key={reqItem.conversationId}
                      layout
                      whileHover={{ x: 3 }}
                      onClick={() => {
                        setSelectedFriend({
                          ...s,
                          conversationId: reqItem.conversationId,
                          isRequest: true,
                          status: "pending",
                          isContact: false,
                        });
                      }}
                      className={`contact-card border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 ${
                        isSelected ? "selected" : ""
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="contact-avatar overflow-hidden">
                          {s.profilePic ? (
                            <img
                              src={s.profilePic}
                              alt={s.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            s.fullName?.charAt(0).toUpperCase() || "U"
                          )}
                        </div>
                        <span className="presence-badge bg-amber-500" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h2 className="truncate text-xs sm:text-sm font-bold text-[var(--text-main)]">
                            {s.fullName}
                          </h2>
                          <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatLastMessageTime(reqItem.lastMessageAt)}
                          </span>
                        </div>

                        <p className="truncate text-[11px] text-[var(--text-main)] font-medium mt-0.5">
                          {reqItem.latestMessage || "Sent an attachment"}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[var(--border)]">
                          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                            Message Request
                          </span>
                          <span className="text-[10px] text-[var(--primary)] font-bold hover:underline">
                            Review Request →
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Floating Action Button (WhatsApp Style) for adding new contact */}
        <button
          type="button"
          onClick={() => setIsAddContactModalOpen(true)}
          className="absolute bottom-16 right-4 sm:right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full theme-button-primary shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none"
          title="Add New Contact"
          aria-label="Add New Contact"
        >
          <UserPlus className="h-5 w-5 text-white transition-transform group-hover:scale-110" />
        </button>

        {/* Sidebar Footer */}
        <div className="p-2.5 sm:p-3 border-t border-[var(--border)] bg-[var(--bg-sidebar)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <button
            type="button"
            onClick={() => setIsAddContactModalOpen(true)}
            className="flex items-center gap-1.5 hover:text-[var(--primary)] text-[var(--primary)] transition font-bold px-2 py-1 rounded-lg hover:bg-[var(--bg-surface)]"
            title="Add New Contact"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Contact</span>
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              to="/settings?tab=privacy"
              className="flex items-center gap-1.5 hover:text-[var(--primary)] transition font-medium"
              title="Privacy & Online Visibility"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Privacy</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-1.5 hover:text-[var(--primary)] transition font-medium"
            >
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Theme</span>
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 hover:text-[var(--primary)] transition font-medium"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <main className={`main-chat-panel ${!selectedFriend ? "hidden md:flex" : "flex"}`}>
        {selectedFriend ? (
          <div className="relative flex h-full w-full flex-col overflow-hidden">
            <Chatting
              key={selectedFriend._id}
              selectedFriend={selectedFriend}
              currentUser={user}
              onBack={() => setSelectedFriend(null)}
              onAcceptRequest={() => {
                fetchChats();
                fetchRequests();
                fetchContactsAndOnline();
                setSelectedFriend((prev) =>
                  prev ? { ...prev, isRequest: false, status: "accepted", isContact: true } : null
                );
              }}
              onDeleteRequest={() => {
                fetchRequests();
                setSelectedFriend(null);
              }}
              onBlockUser={() => {
                fetchChats();
                fetchRequests();
                fetchContactsAndOnline();
                setSelectedFriend((prev) => (prev ? { ...prev, isBlocked: true } : null));
              }}
              onUnblockUser={() => {
                fetchChats();
                fetchContactsAndOnline();
                setSelectedFriend((prev) => (prev ? { ...prev, isBlocked: false } : null));
              }}
              onRemoveContact={() => {
                fetchChats();
                fetchContactsAndOnline();
                setSelectedFriend((prev) => (prev ? { ...prev, isContact: false } : null));
              }}
              onAddContact={() => {
                fetchChats();
                fetchContactsAndOnline();
                setSelectedFriend((prev) => (prev ? { ...prev, isContact: true } : null));
              }}
            />
          </div>
        ) : (
          /* Empty State Welcome Screen */
          <div className="empty-state-shell overflow-y-auto">
            <div className="relative z-10 max-w-lg space-y-4 sm:space-y-6 text-center px-4 py-6 my-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="mx-auto flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-2xl sm:rounded-3xl border border-[var(--border)] shadow-2xl backdrop-blur-xl"
                style={{
                  background: `linear-gradient(135deg, ${activeTheme.colors.primary}22, ${activeTheme.colors.secondary}22)`,
                  boxShadow: "0 10px 40px -10px var(--shadow-glow)",
                }}
              >
                <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-[var(--primary)]" />
              </motion.div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-0.5 sm:px-3.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                  <Sparkles className="h-3 w-3" />
                  Enterprise Messaging
                </span>
                <h2 className="text-xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading">
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
                <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-muted)] max-w-md mx-auto">
                  Select a chat on the left, check your online contacts, or add new friends using the Add Contact button above.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2 text-left">
                <div className="nexus-info-card">
                  <ShieldCheck className="mb-1.5 sm:mb-2 h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                  <p className="text-xs font-bold text-[var(--text-main)]">Personal Contacts</p>
                  <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)]">
                    Only added and accepted users visible
                  </p>
                </div>
                <div className="nexus-info-card">
                  <Mail className="mb-1.5 sm:mb-2 h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                  <p className="text-xs font-bold text-[var(--text-main)]">
                    Message Requests
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)]">
                    Accept, Delete, or Block new senders
                  </p>
                </div>
              </div>

              <div className="pt-1 sm:pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl theme-button-primary px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold shadow-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  Add New Contact
                </button>
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-[var(--primary)] hover:border-[var(--primary)] transition shadow-sm"
                >
                  <Palette className="h-4 w-4" />
                  Theme Studio
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        onContactAdded={(newContact) => {
          fetchChats();
          fetchContactsAndOnline();
          setSelectedFriend({
            ...newContact,
            isContact: true,
            isRequest: false,
            status: "accepted",
          });
        }}
        onOpenChat={(targetUser) => {
          setSelectedFriend({
            ...targetUser,
            isContact: true,
            isRequest: false,
            status: "accepted",
          });
        }}
      />
    </div>
  );
};

export default ChatPage;
