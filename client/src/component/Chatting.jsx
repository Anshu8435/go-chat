import React, { useEffect, useState, useRef } from "react";
import { chatData, userData } from "../../public/dummy";
import {
  Video,
  Phone,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  CheckCheck,
  Lock,
} from "lucide-react";

const Chatting = ({ selectedFriend, currentUser }) => {
  const [filteredChatData, setFilteredChatData] = useState([]);
  const [message, setMessage] = useState("");

  const [sender, setSender] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const messagesEndRef = useRef(null);

  const activeUserId = currentUser || 1;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ===============================
  // FIND CURRENT USER + FRIEND
  // ===============================

  useEffect(() => {
    if (!selectedFriend) return;

    const currentUserData = userData.find(
      (user) => user.id == activeUserId
    ) || { id: activeUserId, name: "Me" };

    const friendData = userData.find(
      (user) => user.id == selectedFriend.id
    ) || selectedFriend;

    setSender(currentUserData);
    setReceiver(friendData);

    // ===============================
    // FILTER CHAT BETWEEN 2 USERS
    // ===============================

    const chats = chatData.filter(
      (chat) =>
        (chat.senderId == activeUserId &&
          chat.receiverId == selectedFriend.id) ||
        (chat.receiverId == activeUserId &&
          chat.senderId == selectedFriend.id)
    );

    setFilteredChatData(chats);
  }, [selectedFriend, activeUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [filteredChatData]);

  // ===============================
  // SEND MESSAGE UI
  // ===============================

  const handleSendMessage = () => {
    if (!message.trim() || !selectedFriend) return;

    const newMsg = {
      id: Date.now(),
      senderId: activeUserId,
      receiverId: selectedFriend.id,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    setFilteredChatData((prev) => [...prev, newMsg]);
    setMessage("");
  };

  // ===============================
  // NO CHAT SELECTED
  // ===============================

  if (!selectedFriend) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f5faf7]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-4xl">💬</span>
          </div>

          <h2 className="text-xl font-semibold text-slate-700">
            Welcome to GoChat
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Select a friend to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#f7faf8]">

      {/* ==================================================
          CHAT HEADER
      ================================================== */}

      <div className="flex h-[62px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">

        {/* LEFT SIDE */}

        <div className="flex items-center gap-3">

          {/* PROFILE */}

          <div className="relative">

            {receiver?.image ? (
              <img
                src={receiver.image}
                alt={receiver.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                {receiver?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}

            {/* ONLINE DOT */}

            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>

          {/* NAME */}

          <div>

            <h2 className="text-sm font-semibold text-slate-800">
              {receiver?.name || "Unknown User"}
            </h2>

            <p className="text-[11px] text-emerald-500">
              online
            </p>

          </div>

        </div>

        {/* RIGHT ICONS */}

        <div className="flex items-center gap-1">

          <button className="rounded-full p-2.5 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600">
            <Video size={20} />
          </button>

          <button className="rounded-full p-2.5 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600">
            <Phone size={19} />
          </button>

          <button className="rounded-full p-2.5 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600">
            <Search size={20} />
          </button>

          <button className="rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100">
            <MoreVertical size={20} />
          </button>

        </div>

      </div>

      {/* ==================================================
          CHAT BODY
      ================================================== */}

      <div
        className="flex-1 overflow-y-auto px-5 py-6"
        style={{
          backgroundColor: "#f8f6f1",
          backgroundImage: `
            radial-gradient(
              #e9dfd1 1px,
              transparent 1px
            )
          `,
          backgroundSize: "20px 20px",
        }}
      >

        {/* TODAY */}

        <div className="mb-6 flex justify-center">

          <span className="rounded-md bg-white px-4 py-1.5 text-[11px] font-medium text-slate-500 shadow-sm">
            Today
          </span>

        </div>

        {/* ENCRYPTION MESSAGE */}

        <div className="mx-auto mb-5 max-w-md rounded-lg bg-[#fff3cd] px-4 py-2.5 text-center text-[11px] leading-5 text-slate-500 shadow-sm">

          <div className="flex items-center justify-center gap-1">
            <Lock size={11} />

            <span>
              Messages and calls are end-to-end encrypted.
            </span>
          </div>

          <p>
            Only people in this chat can read, listen to, or share them.
          </p>

        </div>

        {/* ==================================================
            MESSAGES
        ================================================== */}

        <div className="flex flex-col gap-2">

          {filteredChatData.map((chat) => {

            const isMe = chat.senderId == activeUserId;

            return (
              <div
                key={chat.id}
                className={`flex ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >

                <div
                  className={`
                    relative
                    max-w-[70%]
                    px-3
                    py-2
                    shadow-sm
                    ${
                      isMe
                        ? "rounded-l-lg rounded-br-lg bg-[#d9ffc9]"
                        : "rounded-r-lg rounded-bl-lg bg-white"
                    }
                  `}
                >

                  {/* MESSAGE */}

                  <p className="pr-14 text-sm leading-5 text-slate-700">
                    {chat.message}
                  </p>

                  {/* TIME */}

                  <div
                    className={`
                      absolute
                      bottom-1
                      right-2
                      flex
                      items-center
                      gap-1
                      text-[9px]
                      ${
                        isMe
                          ? "text-slate-500"
                          : "text-slate-400"
                      }
                    `}
                  >

                    <span>
                      {chat.timestamp
                        ? new Date(chat.timestamp).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : chat.time || "12:00"}
                    </span>

                    {/* DOUBLE TICK */}

                    {isMe && (
                      <CheckCheck
                        size={13}
                        className="text-sky-500"
                      />
                    )}

                  </div>

                </div>

              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

      </div>

      {/* ==================================================
          MESSAGE INPUT
      ================================================== */}

      <div className="shrink-0 bg-[#f0f2f5] px-3 py-2">

        <div className="flex items-center gap-2">

          {/* ATTACHMENT */}

          <button className="rounded-full p-2 text-slate-500 transition hover:bg-white">
            <Paperclip size={21} />
          </button>

          {/* EMOJI */}

          <button className="rounded-full p-2 text-slate-500 transition hover:bg-white">
            <Smile size={21} />
          </button>

          {/* INPUT */}

          <div className="flex flex-1 items-center rounded-xl bg-white px-4 py-1 shadow-sm">

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              placeholder="Type a message"
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"
            />

          </div>

          {/* SEND / MIC */}

          {message.trim() ? (

            <button
              onClick={handleSendMessage}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md transition hover:bg-emerald-600"
            >
              <Send size={18} />
            </button>

          ) : (

            <button className="rounded-full p-2 text-slate-500 transition hover:bg-white">
              <Mic size={21} />
            </button>

          )}

        </div>

      </div>

    </div>
  );
};

export default Chatting;