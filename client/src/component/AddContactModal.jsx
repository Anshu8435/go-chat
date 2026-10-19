import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserPlus,
  Check,
  X,
  MessageSquare,
  Users,
  Loader2,
  Sparkles,
} from "lucide-react";
import { api } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const AddContactModal = ({ isOpen, onClose, onContactAdded, onOpenChat }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setResults([]);
      return;
    }
  }, [isOpen]);

  // Debounced search for registered users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/contacts/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.data?.users) {
          setResults(res.data.users);
        }
      } catch (err) {
        console.error("Search users error:", err);
        toast.error("Error searching users.");
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleAdd = async (targetUser) => {
    try {
      setAddingId(targetUser._id);
      const res = await api.post("/contacts/add", { contactId: targetUser._id });
      if (res.data?.success) {
        toast.success(res.data.message || `${targetUser.fullName} added to your contacts!`);
        // Update local search result state
        setResults((prev) =>
          prev.map((u) => (u._id === targetUser._id ? { ...u, isContact: true } : u))
        );
        if (onContactAdded) {
          onContactAdded(targetUser);
        }
      }
    } catch (err) {
      console.error("Failed to add contact:", err);
      toast.error(err.response?.data?.message || "Could not add contact.");
    } finally {
      setAddingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl overflow-hidden"
          style={{ color: "var(--text-main)" }}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--primary)] shadow-sm">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-main)] font-heading">
                  Add New Contact
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Search any registered GoChat user to connect
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search Input Box */}
          <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-surface)]/40">
            <div className="search-shell mt-0">
              <Search className="h-4 w-4 text-zinc-500 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search by full name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-black placeholder:text-zinc-500 font-medium text-xs sm:text-sm"
                style={{ color: "#000000" }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-zinc-400 hover:text-black p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[220px]">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)] mb-2" />
                <p className="text-xs text-[var(--text-muted)]">Searching registered users...</p>
              </div>
            ) : !searchQuery.trim() ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                <div className="h-12 w-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center mb-2.5 text-[var(--primary)]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-[var(--text-main)]">Find Your Friends</p>
                <p className="text-xs text-[var(--text-muted)] max-w-xs mt-1">
                  Type a name or email address above to find and add contacts to your personal GoChat list.
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                <Users className="h-10 w-10 text-[var(--text-muted)] opacity-40 mb-2" />
                <p className="text-sm font-semibold text-[var(--text-main)]">No users found</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  No registered GoChat account matches &ldquo;{searchQuery}&rdquo;.
                </p>
              </div>
            ) : (
              results.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--primary)] transition shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="contact-avatar h-10 w-10 text-sm flex-shrink-0 overflow-hidden">
                      {u.profilePic ? (
                        <img
                          src={u.profilePic}
                          alt={u.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        u.fullName?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate">
                        {u.fullName}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">
                        {u.email}
                      </p>
                      {u.bio && (
                        <p className="text-[10px] text-[var(--text-muted)] truncate max-w-[200px] opacity-80">
                          {u.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {u.isContact ? (
                      <div className="flex items-center gap-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Check className="h-3 w-3" />
                          Added
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onOpenChat) onOpenChat(u);
                          }}
                          className="p-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--primary)] hover:border-[var(--primary)] transition"
                          title="Open Chat"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={addingId === u._id}
                        onClick={() => handleAdd(u)}
                        className="theme-button-primary px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {addingId === u._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <UserPlus className="h-3.5 w-3.5" />
                        )}
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Only added contacts appear in your personal list.</span>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-surface)] font-medium text-[var(--text-main)]"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddContactModal;
