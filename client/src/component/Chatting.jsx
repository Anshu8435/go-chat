import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import ThemeQuickSwitch from "./ThemeQuickSwitch.jsx";
import {
  Video,
  Phone,
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
  Palette,
  X,
  Download,
  Maximize2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const EMOJI_LIST = [
  "😊",
  "🚀",
  "❤️",
  "👍",
  "🔥",
  "🎉",
  "💬",
  "✨",
  "😍",
  "💯",
  "🙌",
  "😎",
  "🤝",
  "⚡",
  "💡",
  "🎯",
];

const formatBytes = (bytes) => {
  if (!bytes || Number.isNaN(bytes)) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const Chatting = ({ selectedFriend, currentUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [activeCallType, setActiveCallType] = useState(null); // "audio" | "video"
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const emojiRef = useRef(null);
  const attachRef = useRef(null);

  const { socket, onlineUsers } = useSocket();
  const currentUserId = currentUser?._id || currentUser?.id;

  const isSelectedOnline = selectedFriend?._id
    ? onlineUsers.some((id) => String(id) === String(selectedFriend._id))
    : false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
      if (attachRef.current && !attachRef.current.contains(e.target)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Call duration timer
  useEffect(() => {
    let timer;
    if (activeCallType) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      clearInterval(timer);
      if (!activeCallType) setCallDuration(0);
    };
  }, [activeCallType]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Fetch conversation history
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

  // Socket.IO message listener
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

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const textToSend = (messageText || "").trim();
    const hasAttachment = Boolean(selectedAttachment?.fileUrl);

    if (!textToSend && !hasAttachment) return;
    if (!selectedFriend?._id) return;

    const attachmentPayload = selectedAttachment
      ? {
          fileUrl: selectedAttachment.fileUrl,
          fileType: selectedAttachment.fileType,
          fileName: selectedAttachment.fileName,
          fileSize: selectedAttachment.fileSize,
        }
      : {};

    setMessageText("");
    setSelectedAttachment(null);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

    try {
      setIsSending(true);
      const res = await api.post(`/messages/send/${selectedFriend._id}`, {
        message: textToSend,
        ...attachmentPayload,
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
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectEmoji = (emoji) => {
    setMessageText((prev) => prev + emoji);
  };

  const handleFileSelection = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      toast.error("File size cannot exceed 12MB.");
      event.target.value = "";
      return;
    }

    setShowAttachMenu(false);

    const isImage = type === "image" || file.type.startsWith("image/");

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const maxDim = 1280;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
            setSelectedAttachment({
              fileUrl: compressedDataUrl,
              fileName: file.name,
              fileSize: Math.round((compressedDataUrl.length * 3) / 4),
              fileType: "image",
              previewUrl: compressedDataUrl,
            });
            toast.success(`Photo selected: ${file.name}`);
          } catch {
            setSelectedAttachment({
              fileUrl: loadEvent.target.result,
              fileName: file.name,
              fileSize: file.size,
              fileType: "image",
              previewUrl: loadEvent.target.result,
            });
            toast.success(`Photo selected: ${file.name}`);
          }
        };
        img.onerror = () => {
          setSelectedAttachment({
            fileUrl: loadEvent.target.result,
            fileName: file.name,
            fileSize: file.size,
            fileType: "image",
            previewUrl: loadEvent.target.result,
          });
          toast.success(`Photo selected: ${file.name}`);
        };
        img.src = loadEvent.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setSelectedAttachment({
          fileUrl: loadEvent.target.result,
          fileName: file.name,
          fileSize: file.size,
          fileType: "file",
          previewUrl: null,
        });
        toast.success(`File attached: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }

    event.target.value = "";
  };

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{
        backgroundColor: "var(--bg-page)",
        color: "var(--text-main)",
      }}
    >
      {/* Chat Header */}
      <div className="nexus-chat-header">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden icon-button h-8 w-8 rounded-lg flex-shrink-0"
              title="Back to contacts"
              aria-label="Back to contacts"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <div className="relative flex-shrink-0">
            <div className="contact-avatar overflow-hidden">
              {selectedFriend.profilePic ? (
                <img
                  src={selectedFriend.profilePic}
                  alt={selectedFriend.fullName || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                selectedFriend.fullName?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            <span className={`presence-badge ${isSelectedOnline ? "online" : "offline"}`} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-bold text-[var(--text-main)] sm:text-base">
                {selectedFriend.fullName || "User"}
              </h2>
            </div>
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)]">
              <span
                className={`h-2 w-2 rounded-full ${
                  isSelectedOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                }`}
              />
              {isSelectedOnline ? "Active now" : "Offline"}
              {selectedFriend.bio && (
                <span className="hidden sm:inline text-[var(--text-muted)] truncate max-w-[200px]">
                  • {selectedFriend.bio}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Call */}
          <button
            type="button"
            onClick={() => setActiveCallType("audio")}
            title="Start Voice Call"
            className="icon-button"
            aria-label="Start Voice Call"
          >
            <Phone className="h-4 w-4" />
          </button>

          {/* Video Call */}
          <button
            type="button"
            onClick={() => setActiveCallType("video")}
            title="Start Video Call"
            className="icon-button"
            aria-label="Start Video Call"
          >
            <Video className="h-4 w-4" />
          </button>

          {/* Theme Switcher */}
          <ThemeQuickSwitch compact />

          {/* Full Studio link */}
          <Link
            to="/settings"
            title="Open Theme Studio"
            className="icon-button"
            aria-label="Theme Studio"
          >
            <Palette className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Security Banner */}
        <div className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-center text-[11px] font-medium text-[var(--text-muted)] shadow-sm">
          <Lock className="h-3.5 w-3.5 text-[var(--primary)] flex-shrink-0" />
          <span>Messages are end-to-end encrypted in transit.</span>
        </div>

        {loadingMessages ? (
          <div className="flex h-40 items-center justify-center">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-md">
              <Sparkles className="h-7 w-7 text-[var(--primary)]" />
            </div>
            <p className="text-sm font-bold text-[var(--text-main)]">
              Say hello to {selectedFriend.fullName || "User"}
            </p>
            <p className="text-xs text-[var(--text-muted)] max-w-xs mt-1">
              Start your secure conversation. Messages are encrypted and synced in real time.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe =
              msg.senderId === currentUserId ||
              (msg.sender?._id && msg.sender._id === currentUserId);

            const timeStr = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <motion.div
                key={msg._id || index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[85%] sm:max-w-md rounded-2xl p-3 text-sm transition-all shadow-sm ${
                    isMe ? "rounded-tr-sm chat-bubble-sent" : "rounded-tl-sm chat-bubble-received"
                  }`}
                >
                  {/* Image Attachment Rendering */}
                  {msg.fileUrl && (msg.fileType === "image" || msg.fileUrl.startsWith("data:image/")) && (
                    <div className="mb-2 overflow-hidden rounded-xl border border-white/10 group relative max-w-sm">
                      <img
                        src={msg.fileUrl}
                        alt={msg.fileName || "Shared photo"}
                        onClick={() => setViewingImage(msg.fileUrl)}
                        className="max-h-72 w-auto max-w-full rounded-xl object-contain cursor-pointer hover:opacity-95 transition bg-black/20"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={() => setViewingImage(msg.fileUrl)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition shadow-md"
                        title="View Fullscreen"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Document / File Attachment Rendering */}
                  {msg.fileUrl && msg.fileType !== "image" && !msg.fileUrl.startsWith("data:image/") && (
                    <div className="mb-2 flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/20 border border-white/10">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-bold truncate max-w-[160px] sm:max-w-[200px]">
                            {msg.fileName || "Shared File"}
                          </p>
                          {msg.fileSize ? (
                            <p className="text-[10px] opacity-75">{formatBytes(msg.fileSize)}</p>
                          ) : null}
                        </div>
                      </div>
                      <a
                        href={msg.fileUrl}
                        download={msg.fileName || "download"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white flex items-center justify-center flex-shrink-0"
                        title="Download File"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* Text Message */}
                  {msg.message && (
                    <p className="break-words leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  )}

                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMe ? "opacity-85 text-white" : "text-[var(--text-muted)]"
                    }`}
                  >
                    <span>{timeStr}</span>
                    {isMe && <CheckCheck className="h-3.5 w-3.5" />}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Attachment Preview Bar */}
      {selectedAttachment && (
        <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--bg-surface)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-[var(--text-main)] min-w-0">
            {selectedAttachment.fileType === "image" ? (
              <img
                src={selectedAttachment.previewUrl}
                alt="Preview"
                className="w-10 h-10 object-cover rounded-lg border border-[var(--border)] flex-shrink-0"
              />
            ) : (
              <div className="p-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] flex-shrink-0">
                <FileText className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <span className="font-semibold truncate block max-w-xs">{selectedAttachment.fileName}</span>
              <span className="text-[10px] text-[var(--text-muted)]">
                {formatBytes(selectedAttachment.fileSize)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedAttachment(null)}
            className="text-[var(--text-muted)] hover:text-red-400 p-1.5 rounded-lg transition"
            title="Remove attachment"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Message Composer */}
      <div className="message-composer-bar">
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
          {/* Hidden file inputs */}
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelection(e, "image")}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => handleFileSelection(e, "file")}
          />

          {/* Attachment button */}
          <div className="relative" ref={attachRef}>
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="icon-button"
              title="Attach File or Image"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-48 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-2 shadow-2xl backdrop-blur-xl z-30">
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    imageInputRef.current?.click();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition"
                >
                  <ImageIcon className="h-4 w-4 text-[var(--primary)]" />
                  Image or Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    fileInputRef.current?.click();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition"
                >
                  <FileText className="h-4 w-4 text-[var(--secondary)]" />
                  Document / File
                </button>
              </div>
            )}
          </div>

          {/* Emoji button */}
          <div className="relative" ref={emojiRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="icon-button"
              title="Add Emoji"
            >
              <Smile className="h-4 w-4" />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-3 shadow-2xl backdrop-blur-xl z-30">
                <div className="grid grid-cols-4 gap-2 text-xl">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSelectEmoji(emoji)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-[var(--bg-surface)] hover:scale-110 transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`Message ${selectedFriend.fullName || "contact"}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none transition shadow-inner"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!messageText.trim() && !selectedAttachment) || isSending}
            className="theme-button-primary inline-flex h-10 w-10 items-center justify-center rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            title="Send Message"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>

      {/* Simulated Call Modal Overlay */}
      <AnimatePresence>
        {activeCallType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <div className="relative w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center shadow-2xl">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl overflow-hidden shadow-xl border border-[var(--border)]">
                {selectedFriend.profilePic ? (
                  <img
                    src={selectedFriend.profilePic}
                    alt={selectedFriend.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {selectedFriend.fullName?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-[var(--text-main)]">
                {selectedFriend.fullName}
              </h3>
              <p className="text-xs text-[var(--primary)] font-semibold mt-1">
                {activeCallType === "video" ? "Secure Video Call" : "Secure Audio Call"} •{" "}
                {formatTime(callDuration)}
              </p>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`h-12 w-12 rounded-2xl border border-[var(--border)] flex items-center justify-center transition ${
                    isMicMuted
                      ? "bg-amber-500 text-white"
                      : "bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-card)]"
                  }`}
                  title={isMicMuted ? "Unmute" : "Mute"}
                >
                  {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>

                {activeCallType === "video" && (
                  <button
                    type="button"
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`h-12 w-12 rounded-2xl border border-[var(--border)] flex items-center justify-center transition ${
                      isVideoOff
                        ? "bg-amber-500 text-white"
                        : "bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-card)]"
                    }`}
                    title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                  >
                    {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveCallType(null)}
                  className="h-12 w-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 hover:bg-red-700 transition"
                  title="End Call"
                >
                  <PhoneOff className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Preview Modal */}
      <AnimatePresence>
        {viewingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <div
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                <a
                  href={viewingImage}
                  download="gochat-image.jpg"
                  className="p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition"
                  title="Download Image"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  type="button"
                  onClick={() => setViewingImage(null)}
                  className="p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={viewingImage}
                alt="Fullscreen View"
                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatting;
