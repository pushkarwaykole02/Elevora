"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ContactSupportSection() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isModalOpen && session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [isModalOpen, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !type || !message) {
      alert("All fields are required");
      return;
    }
    setIsSubmitting(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          type,
          message,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit support ticket");

      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form states except email (which might be session prefilled)
      setMessage("");
      setType("");
      
      // Auto close after showing success
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit support ticket. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-[var(--color-surface-container)] to-[var(--color-surface-container-lowest)] ghost-border rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h2 className="text-xl font-headline font-bold mb-2">Still need help?</h2>
          <p className="text-[var(--color-on-surface-variant)] text-sm">
            Can&apos;t find what you&apos;re looking for? Our support team is here to assist.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold rounded-xl whitespace-nowrap hover:shadow-[0_0_20px_rgba(0,241,254,0.3)] transition-all flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">support_agent</span>
          Contact Support
        </button>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity">
          
          {/* Modal Content */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-surface-variant)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="p-6 border-b border-[var(--color-surface-variant)] flex justify-between items-center bg-[var(--color-surface-container-lowest)]">
              <h3 className="font-headline font-bold text-xl flex items-center gap-2 text-[var(--color-on-surface)]">
                <span className="material-symbols-outlined text-[var(--color-primary)]">mail</span>
                Send us a message
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {isSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-16 h-16 bg-[var(--color-secondary-container)] rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl text-[var(--color-on-secondary-container)]">
                      check_circle
                    </span>
                  </div>
                  <h4 className="text-xl font-bold font-headline mb-2 text-[var(--color-on-surface)]">Message Sent!</h4>
                  <p className="text-[var(--color-on-surface-variant)] text-sm">
                    Our elite support team will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2">
                       Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly={!!session?.user?.email}
                      placeholder="your.email@example.com"
                      className="w-full bg-[var(--color-surface-container)] text-[var(--color-on-surface)] border border-[var(--color-surface-variant)] rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:border-transparent focus:ring-[var(--color-primary)] transition-all placeholder:text-[var(--color-on-surface-variant)]/50 read-only:opacity-75 read-only:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2">
                       Issue Type
                    </label>
                    <div className="relative">
                      <select 
                        required 
                        value={type} 
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-[var(--color-surface-container)] text-[var(--color-on-surface)] border border-[var(--color-surface-variant)] rounded-lg px-4 py-3 text-sm appearance-none outline-none focus:ring-2 focus:border-transparent focus:ring-[var(--color-primary)] transition-all"
                      >
                        <option value="" disabled>Select an option</option>
                        <option value="technical">Technical Issue / Bug</option>
                        <option value="billing">Billing Inquiry</option>
                        <option value="feedback">Product Feedback</option>
                        <option value="other">Other</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-on-surface-variant)]">
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2">
                      Describe your issue
                    </label>
                    <textarea 
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please provide as much detail as possible..."
                      rows={4}
                      className="w-full bg-[var(--color-surface-container)] text-[var(--color-on-surface)] border border-[var(--color-surface-variant)] rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:border-transparent focus:ring-[var(--color-primary)] transition-all resize-none placeholder:text-[var(--color-on-surface-variant)]/50"
                    ></textarea>
                  </div>

                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">send</span>
                      )}
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

