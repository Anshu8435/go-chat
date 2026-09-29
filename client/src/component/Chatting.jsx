import React, { useEffect, useState, useRef } from "react";
import { api } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
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
import toast from "react-hot-toast";

const Chatting = ({ selectedFriend, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);

  const { socket, onlineUsers } = useSocket();
  const currentUserId = currentUser?._id || currentUser?.id;
  const isSelectedOnline = selectedFriend?._id
    ? onlineUsers.includes(selectedFriend._id)
    : false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ===============================
  // FETCH CONVERSATION FROM MONGODB
  // ===============================
  useEffect(() => {
    if (!selectedFriend?._id) return;

    const fetchConversation = async () => {
      try {
        setLoadingMessages(true);
        const res = await api.get(`/messages/${selectedFriend._id}`);
        if (res.data?.messages) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
        toast.error("Could not load chat history.");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchConversation();
  }, [selectedFriend?._id]);

  // ===============================
  // LISTEN FOR REAL-TIME MESSAGES
  // ===============================
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      // Check if message belongs to active conversation between currentUser & selectedFriend
      const isFromFriend =
        newMsg.senderId === selectedFriend?._id &&
        newMsg.receiverId === currentUserId;

      const isToFriend =
        newMsg.senderId === currentUserId &&
        newMsg.receiverId === selectedFriend?._id;

      if (isFromFriend || isToFriend) {
        setMessages((prev) => {
          // Avoid duplicate messages if already present
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("receive_message", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("receive_message", handleNewMessage);
    };
  }, [socket, selectedFriend?._id, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ===============================
  // SEND MESSAGE
  // ===============================
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedFriend?._id) return;

    const textToSend = messageText.trim();
    setMessageText("");

    try {
      const res = await api.post(`/messages/send/${selectedFriend._id}`, {
        message: textToSend,
      });

      if (res.data?.message) {
        const savedMsg = res.data.message;
        setMessages((prev) => {
          if (prev.some((m) => m._id === savedMsg._id)) return prev;
          return [...prev, savedMsg];
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error(err.response?.data?.message || "Failed to send message.");
    }
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
            Select a user to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#f7faf8]">
      {/* ================= HEADER ================= */}
      <div className="flex h-[62px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
              {selectedFriend.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* ONLINE DOT */}
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                isSelectedOnline ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              {selectedFriend.fullName || "User"}
            </h2>

            <p
              className={`text-[11px] font-medium ${
                isSelectedOnline ? "text-emerald-500" : "text-slate-400"
              }`}
            >
              {isSelectedOnline ? "online" : "offline"}
            </p>
          </div>
        </div>

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

      {/* ================= CHAT BODY ================= */}
      <div
        className="flex-1 overflow-y-auto px-5 py-6"
        style={{
          backgroundColor: "#f8f6f1",
          backgroundImage: `radial-gradient(#e9dfd1 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      >
        <div className="mb-6 flex justify-center">
          <span className="rounded-md bg-white px-4 py-1.5 text-[11px] font-medium text-slate-500 shadow-sm">
            Chat History
          </span>
        </div>

        <div className="mx-auto mb-5 max-w-md rounded-lg bg-[#fff3cd] px-4 py-2.5 text-center text-[11px] leading-5 text-slate-500 shadow-sm">
          <div className="flex items-center justify-center gap-1">
            <Lock size={11} />
            <span>Messages are secured and stored in MongoDB.</span>
          </div>
        </div>

        {loadingMessages ? (
          <div className="text-center text-xs text-slate-400 py-4">
            Loading conversation history...
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-6">
                No previous messages. Say hello to start chatting!
              </div>
            ) : (
              messages.map((chat) => {
                const isMe =
                  chat.senderId === currentUserId ||
                  chat.senderId?._id === currentUserId;

                return (
                  <div
                    key={chat._id || chat.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`relative max-w-[70%] px-3 py-2 shadow-sm ${
                        isMe
                          ? "rounded-l-lg rounded-br-lg bg-[#d9ffc9]"
                          : "rounded-r-lg rounded-bl-lg bg-white"
                      }`}
                    >
                      <p className="pr-14 text-sm leading-5 text-slate-700">
                        {chat.message}
                      </p>

                      <div
                        className={`absolute bottom-1 right-2 flex items-center gap-1 text-[9px] ${
                          isMe ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        <span>
                          {chat.createdAt
                            ? new Date(chat.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Just now"}
                        </span>
                        {isMe && (
                          <CheckCheck size={13} className="text-sky-500" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ================= INPUT BAR ================= */}
      <div className="shrink-0 bg-[#f0f2f5] px-3 py-2">
        <div className="flex items-center gap-2">
          <button className="rounded-full p-2 text-slate-500 transition hover:bg-white">
            <Paperclip size={21} />
          </button>
          <button className="rounded-full p-2 text-slate-500 transition hover:bg-white">
            <Smile size={21} />
          </button>

          <div className="flex flex-1 items-center rounded-xl bg-white px-4 py-1 shadow-sm">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          {messageText.trim() ? (
            <button
              onClick={handleSendMessage}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md transition hover:bg-emerald-600 cursor-pointer"
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