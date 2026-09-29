import React, { useState, useEffect } from "react";
import Chatting from "../component/Chatting.jsx";
import { api, useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { LogOut, User as UserIcon, Search, MessageSquare, ShieldCheck, Sparkles, Circle, Users, ArrowLeft } from "lucide-react";
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
    <div className="flex h-screen w-full bg-[#0B0F19] text-white overflow-hidden font-sans">
      
      {/* ================= LEFT SIDEBAR ================= */}
      <div 
        className={`w-full md:w-[380px] md:min-w-[340px] h-full border-r border-white/10 bg-[#0F172A]/90 backdrop-blur-2xl flex flex-col z-20 transition-all ${
          selectedFriend ? "hidden md:flex" : "flex"
        }`}
      >
        
        {/* SIDEBAR HEADER */}
        <div className="p-4 border-b border-white/10 bg-slate-900/50 space-y-4">
          
          {/* TOP BAR: BRAND + USER PROFILE */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white font-heading tracking-tight leading-none">GoChat</h1>
                <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Realtime Workspace
                </span>
              </div>
            </div>

            {/* LOGGED IN USER AVATAR & LOGOUT */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  {user?.fullName?.charAt(0).toUpperCase() || <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-semibold text-slate-200 max-w-[80px] truncate">
                  {user?.fullName?.split(" ")[0] || "User"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SEARCH BOX */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-800/60 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-slate-800/90 transition-all shadow-inner"
            />
          </div>

        </div>

        {/* USERS LIST HEADER */}
        <div className="px-4 py-2.5 bg-slate-900/30 border-b border-white/5 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            Direct Messages
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-semibold">
            {filteredUsersList.length} Registered
          </span>
        </div>

        {/* USERS LIST BODY */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {loadingUsers ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Loading workspace contacts...</p>
            </div>
          ) : filteredUsersList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-600 mb-1" />
              <p>No registered contacts found.</p>
            </div>
          ) : (
            filteredUsersList.map((u) => {
              const isOnline = onlineUsers.includes(u._id);
              const isSelected = selectedFriend?._id === u._id;

              return (
                <div
                  key={u._id}
                  onClick={() => setSelectedFriend(u)}
                  className={`group relative p-3 flex items-center gap-3.5 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? "bg-slate-800/90 border border-emerald-500/40 shadow-lg shadow-emerald-950/20"
                      : "bg-slate-900/40 border border-white/5 hover:bg-slate-800/60 hover:border-white/10"
                  }`}
                >
                  {/* SELECTED ACCENT BAR */}
                  {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-r-full shadow-[0_0_12px_#10B981]" />
                  )}

                  {/* AVATAR */}
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-md">
                      {u.fullName?.charAt(0).toUpperCase() || "U"}
                    </div>

                    {/* ONLINE BADGE */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                        isOnline ? "bg-emerald-400 shadow-[0_0_8px_#10B981]" : "bg-slate-500"
                      }`}
                    />
                  </div>

                  {/* USER DETAILS */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                        {u.fullName || "User"}
                      </h2>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        isOnline ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400"
                      }`}>
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 truncate mt-1 font-sans">
                      {u.email}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ================= RIGHT MAIN CHAT AREA ================= */}
      <div className={`flex-1 h-full ${!selectedFriend ? "hidden md:flex" : "flex"} flex-col`}>
        {selectedFriend ? (
          <div className="relative h-full flex flex-col">
            {/* Mobile Back Button Bar */}
            <div className="md:hidden flex items-center gap-2 p-3 bg-slate-900 border-b border-white/10">
              <button
                onClick={() => setSelectedFriend(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Contacts
              </button>
            </div>
            
            <div className="flex-1 h-full overflow-hidden">
              <Chatting selectedFriend={selectedFriend} currentUser={user} />
            </div>
          </div>
        ) : (
          /* EMPTY STATE SCREEN */
          <div className="h-full flex flex-col items-center justify-center p-8 bg-[#0B0F19] text-center relative overflow-hidden">
            
            {/* AMBIENT LIGHT */}
            <div className="absolute w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="relative z-10 max-w-md space-y-6">
              
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shadow-2xl backdrop-blur-xl">
                <MessageSquare className="w-12 h-12 text-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-white font-heading">
                  Welcome to GoChat, <br />
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    {user?.fullName || "User"}
                  </span>
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Select a registered contact from the sidebar to start high-definition, end-to-end encrypted real-time chat.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left pt-4">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-white">256-Bit Encryption</p>
                  <p className="text-[10px] text-slate-400">Zero logging policy</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
                  <Sparkles className="w-5 h-5 text-teal-400 mb-2" />
                  <p className="text-xs font-bold text-white">WebSocket Sync</p>
                  <p className="text-[10px] text-slate-400">Real-time instant delivery</p>
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
