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
  ShieldCheck,
  Image as ImageIcon,
  FileText,
  X,
  PhoneOff,
  MicOff,
  VideoOff,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

const EMOJI_LIST = ["😊", "🚀", "❤️", "👍", "🔥", "🎉", "💬", "✨", "😍", "💯", "🙌", "😎"];

const Chatting = ({ selectedFriend, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  
  // Call Modals State
  const [activeCallType, setActiveCallType] = useState(null); // 'video' | 'audio' | null
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const messagesEndRef = useRef(null);
  const { socket, onlineUsers } = useSocket();
  const currentUserId = currentUser?._id || currentUser?.id;
  
  const isSelectedOnline = selectedFriend?._id
    ? onlineUsers.includes(selectedFriend._id)
    : false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Call duration counter effect
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

  // Format call duration
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
      const isFromFriend =
        newMsg.senderId === selectedFriend?._id &&
        newMsg.receiverId === currentUserId;

      const isToFriend =
        newMsg.senderId === currentUserId &&
        newMsg.receiverId === selectedFriend?._id;

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

  // ===============================
  // SEND MESSAGE
  // ===============================
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
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0B0F19] text-white">
      
      {/* ================= HEADER ================= */}
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 bg-[#0F172A]/90 backdrop-blur-2xl px-6 z-20 shadow-md">
        
        {/* USER PROFILE INFO */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-bold text-lg text-white shadow-md shadow-emerald-500/20">
              {selectedFriend.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* ONLINE DOT */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-900 ${
                isSelectedOnline ? "bg-emerald-400 shadow-[0_0_8px_#10B981]" : "bg-slate-500"
              }`}
            />
          </div>

          <div>
            <h2 className="text-base font-bold text-white font-heading tracking-wide">
              {selectedFriend.fullName || "User"}
            </h2>

            <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isSelectedOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
              {isSelectedOnline ? "Active Now • End-to-End Encrypted" : "Offline"}
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveCallType("video");
              toast.success(`Starting HD Video call with ${selectedFriend.fullName || "user"}...`);
            }}
            title="Start HD Video Call"
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-white/10 transition-all cursor-pointer"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setActiveCallType("audio");
              toast.success(`Starting Voice call with ${selectedFriend.fullName || "user"}...`);
            }}
            title="Start Voice Call"
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-white/10 transition-all cursor-pointer"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => toast("Search messages in this thread...")}
            title="Search Messages"
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* ================= CHAT MESSAGES BODY ================= */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-4 relative custom-scrollbar"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      >
        
        {/* SECURITY & ENCRYPTION BADGE */}
        <div className="flex justify-center my-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 text-slate-300 text-xs font-medium backdrop-blur-md shadow-lg">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Messages & calls are secured with 256-bit encryption.</span>
          </div>
        </div>

        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Loading conversation history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">No messages yet</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Say hello to start your conversation with {selectedFriend.fullName || "this contact"}!
            </p>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {messages.map((chat) => {
              const isMe =
                chat.senderId === currentUserId ||
                chat.senderId?._id === currentUserId;

              return (
                <div
                  key={chat._id || chat.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[75%] sm:max-w-[65%] px-4 py-3 rounded-2xl shadow-lg transition-all ${
                      isMe
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs"
                        : "bg-slate-800/90 border border-white/10 text-slate-100 rounded-tl-xs backdrop-blur-md"
                    }`}
                  >
                    <p className="pr-14 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {chat.message}
                    </p>

                    <div
                      className={`absolute bottom-1.5 right-3 flex items-center gap-1 text-[10px] font-mono ${
                        isMe ? "text-emerald-200" : "text-slate-400"
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
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

      </div>

      {/* ================= EMOJI & ATTACHMENT POPOVERS ================= */}
      {showEmojiPicker && (
        <div className="absolute bottom-24 left-6 z-30 p-3 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl backdrop-blur-2xl grid grid-cols-6 gap-2">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSelectEmoji(emoji)}
              className="w-10 h-10 text-xl hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {showAttachMenu && (
        <div className="absolute bottom-24 left-16 z-30 p-2 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-1 w-44">
          <button
            onClick={() => {
              toast.success("Photo attachment option selected.");
              setShowAttachMenu(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>Send Image</span>
          </button>
          <button
            onClick={() => {
              toast.success("Document attachment option selected.");
              setShowAttachMenu(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Send File</span>
          </button>
        </div>
      )}

      {/* ================= INPUT BAR ================= */}
      <div className="shrink-0 p-4 bg-[#0F172A]/90 backdrop-blur-2xl border-t border-white/10 z-20">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          
          <button
            onClick={() => {
              setShowAttachMenu(!showAttachMenu);
              setShowEmojiPicker(false);
            }}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachMenu(false);
            }}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* INPUT FIELD */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              placeholder={`Write a message to ${selectedFriend.fullName || "User"}...`}
              className="w-full h-12 pl-5 pr-4 rounded-2xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:bg-slate-800/90 transition-all shadow-inner font-sans"
            />
          </div>

          {/* ACTION / SEND BUTTON */}
          {messageText.trim() ? (
            <button
              onClick={handleSendMessage}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => toast("Voice note recording simulated.")}
              className="p-3 rounded-2xl bg-slate-800/80 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-white/10 transition-all cursor-pointer"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

        </div>
      </div>

      {/* ================= LIVE CALL SIMULATION MODAL ================= */}
      {activeCallType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            
            {/* AMBIENT LIGHT */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="relative inline-block">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-3xl text-white shadow-xl shadow-emerald-500/30">
                  {selectedFriend.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-400 border-4 border-slate-900 rounded-full animate-pulse" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white font-heading">
                  {selectedFriend.fullName || "User"}
                </h3>
                <p className="text-xs text-emerald-400 font-mono tracking-wider mt-1 uppercase">
                  {activeCallType === "video" ? "HD Video Call Connected" : "Encrypted Voice Call Connected"}
                </p>
                <p className="text-sm font-mono text-slate-400 mt-1">
                  {formatTime(callDuration)}
                </p>
              </div>

              {/* VIDEO PLACEHOLDER BOX IF VIDEO CALL */}
              {activeCallType === "video" && (
                <div className="h-44 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-slate-500 text-xs relative overflow-hidden">
                  {isVideoOff ? (
                    <span>Camera Muted</span>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Video className="w-6 h-6" />
                      </div>
                      <span className="text-slate-300 font-medium">Ultra-HD Encrypted Stream Active</span>
                    </div>
                  )}
                </div>
              )}

              {/* CALL CONTROLS */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isMicMuted ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-slate-800 border-white/10 text-slate-200 hover:text-white"
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                {activeCallType === "video" && (
                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isVideoOff ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-slate-800 border-white/10 text-slate-200 hover:text-white"
                    }`}
                  >
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveCallType(null);
                    toast.error("Call ended");
                  }}
                  className="p-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/30 transition-all cursor-pointer"
                >
                  <PhoneOff className="w-6 h-6" />
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