"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setAvatarUrl(session.user.image || "");
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-t-2 border-[var(--color-primary)] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-xs font-label text-[var(--color-on-surface-variant)]">Loading Profile...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setError("Current password is required to change password.");
        return;
      }
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          avatarUrl: avatarUrl || null,
          password: newPassword || undefined,
          currentPassword: currentPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Sync the updated info with the NextAuth session
      await update({
        name,
        email,
        image: avatarUrl || null,
      });

      setSuccess("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="mb-10">
        <p className="text-xs font-label text-[var(--color-on-surface-variant)] mb-1">Account & Settings</p>
        <h1 className="text-4xl font-headline font-black text-[var(--color-on-surface)]">Personal Profile</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Side: Avatar Preview & Stats */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border border-[var(--color-outline-variant)]/30 mb-4 bg-[var(--color-surface-container)] flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as any).src = `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
                  }}
                />
              ) : (
                <span className="material-symbols-outlined text-5xl text-[var(--color-on-surface-variant)]">person</span>
              )}
            </div>
            <h2 className="font-headline font-bold text-lg text-white">{name || "Your Name"}</h2>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 break-all">{email || "your-email@example.com"}</p>
          </div>
        </div>

        {/* Right Side: Profile Edit Form */}
        <div className="md:col-span-2 bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6">
          <h2 className="font-headline font-bold text-xl mb-6 text-white">Edit Profile Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-[var(--color-error-container)] border border-[var(--color-error)]/20 text-[var(--color-error)] text-sm rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">error</span>
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-[var(--color-primary-container)] border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                {success}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/30 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-body text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ada@elevora.ai"
                  className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/30 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-body text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/30 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-body text-sm"
                />
              </div>
            </div>

            <hr className="border-white/5 my-6" />

            {/* Password Change */}
            <div className="space-y-4">
              <h3 className="font-headline font-bold text-md text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">lock</span> Change Password
              </h3>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/30 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-body text-sm"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/30 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-body text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/30 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-body text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-fixed)] text-[var(--color-on-primary)] font-headline font-black text-lg rounded-xl hover:shadow-[0_0_30px_rgba(0,241,254,0.35)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Profile Changes"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
