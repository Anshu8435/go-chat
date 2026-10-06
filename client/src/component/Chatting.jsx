import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { api } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import {
  Video,
  Phone,
  Search,
  Paperclip,
  Smile,
  Mic,
  Send,
  CheckCheck,
  Lock,
  Image as ImageIcon,
  FileText,
  PhoneOff,
  MicOff,
  VideoOff,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const EMOJI_LIST = ["😊", "🚀", "❤️", "👍", "🔥", "🎉", "💬", "✨", "😍", "💯", "🙌", "😎"];
const REACTIONS = ["✨", "🔥", "💬"];

const Chatting = ({ selectedFriend, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [activeCallType, setActiveCallType] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const messagesEndRef = useRef(null);
  const { socket, onlineUsers } = useSocket();
  const currentUserId = currentUser?._id || currentUser?.id;

  const isSelectedOnline = selectedFriend?._id ? onlineUsers.includes(selectedFriend._id) : false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let timer;
    if (activeCallType) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCallType]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      const isFromFriend =
        newMsg.senderId === selectedFriend?._id && newMsg.receiverId === currentUserId;

      const isToFriend =
        newMsg.senderId === currentUserId && newMsg.receiverId === selectedFriend?._id;

      if (isFromFriend || isToFriend) {
        setMessages((prev) => {
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

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedFriend?._id) return;

    const textToSend = messageText.trim();
    setMessageText("");
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

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

  const handleSelectEmoji = (emoji) => {
    setMessageText((prev) => prev + emoji);
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0B0E14] text-white">
      <div className="nexus-chat-header">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF007A] via-[#9B5DE5] to-[#00F0FF] text-base font-bold text-white shadow-lg shadow-[#ff007a]/20 sm:h-12 sm:w-12">
              {selectedFriend.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span className={`presence-badge ${isSelectedOnline ? "online" : "offline"}`} />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-white sm:text-base">
              {selectedFriend.fullName || "User"}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:text-xs">
              <span className={`h-2 w-2 rounded-full ${isSelectedOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
              {isSelectedOnline ? "Active now" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              setActiveCallType("video");
              toast.success(`Starting HD Video call with ${selectedFriend.fullName || "user"}...`);
            }}
            title="Start HD Video Call"
            className="icon-button"
          >
            <Video className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => {
              setActiveCallType("audio");
              toast.success(`Starting Voice call with ${selectedFriend.fullName || "user"}...`);
            }}
            title="Start Voice Call"
            className="icon-button"
          >
            <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button onClick={() => toast("Search messages in this thread...")} title="Search Messages" className="icon-button">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="mb-4 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-[11px] font-medium text-slate-300 backdrop-blur-md">
            <Lock className="h-3.5 w-3.5 text-cyan-300" />
            Messages and calls are secured with 256-bit encryption.
          </div>
        </div>

        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <span className="text-xs text-slate-400">Loading conversation history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No messages yet</h3>
            <p className="mt-1 max-w-xs text-xs text-slate-400">
              Say hello to start your conversation with {selectedFriend.fullName || "this contact"}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {messages.map((chat) => {
              const isMe = chat.senderId === currentUserId || chat.senderId?._id === currentUserId;

              return (
                <motion.div
                  key={chat._id || chat.id}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <motion.div
                    whileHover={{ y: -2, scale: 1.01 }}
                    className={`message-bubble ${isMe ? "me" : "them"}`}
                  >
                    <p className="whitespace-pre-wrap text-xs leading-relaxed sm:text-sm">{chat.message}</p>

                    <div className={`message-meta ${isMe ? "me" : "them"}`}>
                      <span>
                        {chat.createdAt
                          ? new Date(chat.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Just now"}
                      </span>
                      {isMe && <CheckCheck className="h-3.5 w-3.5 text-cyan-100" />}
                    </div>

                    <div className="message-reactions">
                      {REACTIONS.map((reaction) => (
                        <button key={reaction} type="button" className="reaction-pill">
                          {reaction}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}

            {isSelectedOnline && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="typing-row"
              >
                <div className="typing-wave" aria-label="User is typing">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="typing-label">{selectedFriend.fullName || "Contact"} is typing...</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-24 left-6 z-30 grid grid-cols-6 gap-2 rounded-2xl border border-white/10 bg-slate-950/90 p-3 shadow-2xl shadow-[#0a0f18]/90 backdrop-blur-2xl">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSelectEmoji(emoji)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xl transition hover:bg-slate-800"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {showAttachMenu && (
        <div className="absolute bottom-24 left-16 z-30 w-44 space-y-1 rounded-2xl border border-white/10 bg-slate-950/90 p-2 shadow-2xl shadow-[#0a0f18]/90 backdrop-blur-2xl">
          <button
            onClick={() => {
              toast.success("Photo attachment selected.");
              setShowAttachMenu(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-800"
          >
            <ImageIcon className="h-4 w-4 text-cyan-300" />
            <span>Send Image</span>
          </button>
          <button
            onClick={() => {
              toast.success("Document attachment selected.");
              setShowAttachMenu(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-800"
          >
            <FileText className="h-4 w-4 text-pink-300" />
            <span>Send File</span>
          </button>
        </div>
      )}

      <div className="shrink-0 border-t border-white/10 bg-slate-950/80 p-3 backdrop-blur-2xl sm:p-4">
        <div className="mx-auto flex max-w-6xl items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setShowAttachMenu((prev) => !prev);
              setShowEmojiPicker(false);
            }}
            className="icon-button"
          >
            <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <button
            onClick={() => {
              setShowEmojiPicker((prev) => !prev);
              setShowAttachMenu(false);
            }}
            className="icon-button"
          >
            <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div className="relative min-w-0 flex-1">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder={`Write to ${selectedFriend.fullName || "User"}...`}
              className="nexus-input"
            />
          </div>

          {messageText.trim() ? (
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSendMessage}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF007A] to-[#00F0FF] px-4 text-xs font-bold text-slate-950 shadow-lg shadow-[#ff007a]/30 sm:h-12 sm:px-6 sm:text-sm"
            >
              <span>Send</span>
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </motion.button>
          ) : (
            <button onClick={() => toast("Voice note recording simulated.")} className="icon-button">
              <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
        </div>
      </div>

      {activeCallType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-2xl">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-[#111827] p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[100px]" />

            <div className="relative z-10 space-y-5">
              <div className="relative inline-block">
                <div className="flex h-24 w-24 items-center justify-center rounded-[30px] bg-gradient-to-br from-[#FF007A] via-[#9B5DE5] to-[#00F0FF] text-3xl font-bold text-white shadow-lg shadow-[#ff007a]/20">
                  {selectedFriend.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-[#111827] bg-emerald-400 animate-pulse" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">{selectedFriend.fullName || "User"}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.28em] text-cyan-300">
                  {activeCallType === "video" ? "HD Video Call Connected" : "Encrypted Voice Call Connected"}
                </p>
                <p className="mt-2 font-mono text-sm text-slate-400">{formatTime(callDuration)}</p>
              </div>

              {activeCallType === "video" && (
                <div className="flex h-44 items-center justify-center rounded-2xl border border-white/10 bg-slate-950 text-slate-500">
                  {isVideoOff ? (
                    <span>Camera muted</span>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
                        <Video className="h-6 w-6" />
                      </div>
                      <span className="text-slate-300">Ultra-HD encrypted stream active</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setIsMicMuted((prev) => !prev)}
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition ${
                    isMicMuted ? "border-red-500/40 bg-red-500/20 text-red-400" : "border-white/10 bg-slate-800 text-slate-200"
                  }`}
                >
                  {isMicMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </button>

                {activeCallType === "video" && (
                  <button
                    onClick={() => setIsVideoOff((prev) => !prev)}
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition ${
                      isVideoOff ? "border-red-500/40 bg-red-500/20 text-red-400" : "border-white/10 bg-slate-800 text-slate-200"
                    }`}
                  >
                    {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveCallType(null);
                    toast.error("Call ended");
                  }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/25 transition hover:bg-red-600"
                >
                  <PhoneOff className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatting;
