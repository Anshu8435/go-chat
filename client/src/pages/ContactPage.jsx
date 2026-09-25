import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MessageSquareText, ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../context/AuthContext.jsx";
import ThemeQuickSwitch from "../component/ThemeQuickSwitch.jsx";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/contactUs", formData);
      toast.success(res.data?.message || "Message sent successfully.");
      setFormData({ fullName: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen theme-shell transition-colors duration-200"
      style={{ backgroundColor: "var(--bg-page)", color: "var(--text-main)" }}
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] transition hover:border-[var(--primary)] hover:bg-[var(--bg-card)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <ThemeQuickSwitch />
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl p-8 border border-[var(--border)] bg-[var(--bg-card)] shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                <MessageSquareText className="h-3.5 w-3.5" />
                Contact Enterprise Team
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-main)] font-heading leading-tight">
                Let&apos;s build your next chat experience.
              </h1>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                Need help with an enterprise chat deployment, custom feature integration, or
                architecture migration? Tell us what you need and our team will get back to you.
              </p>
            </div>

            <div className="mt-8 space-y-3 text-xs text-[var(--text-main)]">
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-3.5">
                <Mail className="h-4 w-4 text-[var(--primary)] flex-shrink-0" />
                <span>hello@gochat.app</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-3.5">
                <Phone className="h-4 w-4 text-[var(--secondary)] flex-shrink-0" />
                <span>+1 (800) 456-7890</span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl p-8 border border-[var(--border)] bg-[var(--bg-card)] shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Full Name</span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition shadow-inner"
                    placeholder="Your name"
                    required
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Phone</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition shadow-inner"
                    placeholder="+1 234 567 890"
                  />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  Email Address
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition shadow-inner"
                  placeholder="your@email.com"
                  required
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Message</span>
                <textarea
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition shadow-inner resize-none leading-relaxed"
                  placeholder="Tell us about your project or support inquiry..."
                  required
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="theme-button-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
