import React, { useState } from "react";
import { userData } from "../../public/dummy.js";
import Chatting from "../component/Chatting.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { LogOut, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";

const ChatPage = () => {
  const [chatPage, setChatPage] = useState(userData);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isOpenChat, setIsOpenChat] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* ================= LEFT SIDEBAR ================= */}
      <div className=" min-w-[410px] h-full border-r border-gray-200 bg-white flex flex-col">
        {/* ===== HEADER ===== */}
        <div className="px-[18px] pt-[14px] pb-[10px] border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-[22px] font-bold text-green-600">
                GoChat
              </span>
              <div className="text-[11px] font-medium text-slate-400 ms-1 mt-2.5">
                Connect • Chat • Go
              </div>
            </div>

            {/* Current User Info & Logout */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-xs">
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">
                  {user?.fullName?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
                </div>
                <span className="text-xs font-semibold text-gray-700 max-w-[90px] truncate">
                  {user?.fullName || "User"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>


        {/* ================= FRIEND LIST ================= */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {chatPage.map((user, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedFriend(user);
                setIsOpenChat(true);
              }}
              className={`
                mx-2
                px-3
                py-3
                flex
                items-center
                gap-3
                rounded-xl
                cursor-pointer
                transition
                ${selectedFriend === user ? "bg-gray-100" : "hover:bg-gray-100"}
              `}
            >
              {/* ===== PROFILE IMAGE ===== */}
              <div className="relative flex-shrink-0">
                {user.image || user.photo || user.avatar ? (
                  <img
                    src={user.image || user.photo || user.avatar}
                    alt={user.name}
                    className="
                      w-[48px]
                      h-[48px]
                      rounded-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      w-[48px]
                      h-[48px]
                      rounded-full
                      bg-green-100
                      text-green-700
                      flex
                      items-center
                      justify-center
                      font-semibold
                      text-lg
                    "
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Online dot */}
                <span
                  className="
                    absolute
                    bottom-0
                    right-0
                    w-3
                    h-3
                    bg-green-500
                    border-2
                    border-white
                    rounded-full
                  "
                />
              </div>

              {/* ===== USER DETAILS ===== */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[15px] font-medium text-gray-900 truncate">
                    {user.name}
                  </h2>

                  <span className="text-[11px] text-gray-500 whitespace-nowrap">
                    Yesterday
                  </span>
                </div>

                {/* Message preview */}
                <p className="text-[13px] text-gray-500 truncate mt-1">
                  {user.message || user.lastMessage || ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= RIGHT CHAT AREA ================= */}
      <div className="flex-1 h-full">
        {selectedFriend ? (
          <Chatting selectedFriend={selectedFriend} currentUser={user?.id || 1} />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>

              <h2 className="text-2xl font-semibold text-gray-700">
                Welcome to GoChat
              </h2>

              <p className="text-gray-400 mt-2">
                Select a friend to start a chat
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
