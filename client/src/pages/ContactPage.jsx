import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MessageSquareText, ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../context/AuthContext.jsx";

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
    <div className="min-h-screen theme-shell" style={{ color: "var(--text)" }}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section
            className="rounded-3xl p-6 shadow-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(34,211,238,0.08))",
              border: "1px solid var(--line)",
              boxShadow: "0 25px 50px var(--shadow-glow)",
            }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.25em] text-emerald-300">
              <MessageSquareText className="h-3.5 w-3.5" />
              Contact us
            </div>

            <h1 className="text-4xl font-bold text-white">
              Let’s build your next chat experience.
            </h1>
            <p className="mt-4 text-slate-300">
              Need help with an enterprise chat system, custom messaging feature, or migration? Tell
              us what you need and our team will get back to you.
            </p>

            <div className="mt-8 space-y-4 text-sm text-slate-200">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/30 p-3">
                <Mail className="h-4 w-4 text-emerald-300" />
                hello@gochat.app
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/30 p-3">
                <Phone className="h-4 w-4 text-cyan-300" />
                +1 (800) 456-7890
              </div>
            </div>
          </section>

          <section
            className="rounded-3xl p-6 shadow-xl"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--line)",
              boxShadow: "0 20px 40px var(--shadow-glow)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Full Name</span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full rounded-2xl px-3 py-3 outline-none transition theme-input"
                    style={{ borderColor: "var(--line)" }}
                    placeholder="Your name"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Phone</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3 text-white outline-none transition focus:border-emerald-500"
                    placeholder="+1 234 567 890"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Email</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3 text-white outline-none transition focus:border-emerald-500"
                  placeholder="your@email.com"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Message</span>
                <textarea
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3 text-white outline-none transition focus:border-emerald-500"
                  placeholder="Tell us about your project, app idea, or support issue..."
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Sending..." : "Send message"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
