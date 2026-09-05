import React, { useState } from "react";
import { userData } from "../../public/dummy.js";
import Chatting from "../component/Chatting.jsx";

const ChatPage = () => {
  const [chatPage, setChatPage] = useState(userData);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isOpenChat, setIsOpenChat] = useState(false);

  return (

  
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* ================= LEFT SIDEBAR ================= */}
      <div className=" min-w-[410px] h-full border-r border-gray-200 bg-white flex flex-col">
        {/* ===== HEADER ===== */}
        <div className="px-[18px] pt-[14px] pb-[10px]">
          <div className=" flex border-b items-center ">
            {/* WhatsApp / GoChat */}
            <span className="text-[22px] font-bold text-green-600   ">
              GoChat
            </span>
             <div className="text-[11px] font-medium text-slate-400 ms-1 mt-2.5 ">
                Connect • Chat • Go
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
          <Chatting selectedFriend={selectedFriend} />
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
