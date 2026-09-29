import React, { useState, useEffect } from "react";
import Chatting from "../component/Chatting.jsx";
import { api, useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { LogOut, User as UserIcon, Search } from "lucide-react";
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
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* ================= LEFT SIDEBAR ================= */}
      <div className="w-[380px] min-w-[340px] h-full border-r border-gray-200 bg-white flex flex-col">
        {/* ===== HEADER ===== */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl font-bold text-green-600">GoChat</span>
              <span className="text-[11px] font-medium text-slate-400 ms-2">
                Connect • Chat • Go
              </span>
            </div>

            {/* Current User Info & Logout */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-xs">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">
                  {user?.fullName?.charAt(0).toUpperCase() || (
                    <UserIcon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-700 max-w-[80px] truncate">
                  {user?.fullName || "User"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="mt-3 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-green-500 transition-all"
            />
          </div>
        </div>

        {/* ================= USER LIST ================= */}
        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {loadingUsers ? (
            <div className="p-4 text-center text-xs text-gray-400">
              Loading registered users...
            </div>
          ) : filteredUsersList.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">
              No registered users found.
            </div>
          ) : (
            filteredUsersList.map((u) => {
              const isOnline = onlineUsers.includes(u._id);
              const isSelected = selectedFriend?._id === u._id;

              return (
                <div
                  key={u._id}
                  onClick={() => setSelectedFriend(u)}
                  className={`px-3 py-2.5 flex items-center gap-3 rounded-xl cursor-pointer transition ${
                    isSelected ? "bg-green-50 border border-green-200" : "hover:bg-gray-100"
                  }`}
                >
                  {/* ===== AVATAR ===== */}
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold text-base shadow-xs">
                      {u.fullName?.charAt(0).toUpperCase() || "U"}
                    </div>

                    {/* Online status dot */}
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        isOnline ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  </div>

                  {/* ===== DETAILS ===== */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-gray-800 truncate">
                        {u.fullName}
                      </h2>
                      <span className="text-[10px] text-gray-400">
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {u.email}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= RIGHT CHAT AREA ================= */}
      <div className="flex-1 h-full">
        {selectedFriend ? (
          <Chatting selectedFriend={selectedFriend} currentUser={user} />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-semibold text-gray-700">
                Welcome to GoChat, {user?.fullName || "User"}!
              </h2>
              <p className="text-gray-400 mt-2 text-sm max-w-sm">
                Select any registered user from the sidebar to start private real-time chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
