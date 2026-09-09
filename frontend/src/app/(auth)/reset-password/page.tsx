"use client";

import Link from "next/link";
import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Reset token is missing in the URL.");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to reset password");
      }
    } catch {
      setError("Connection to server failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      {isSuccess ? (
        <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.2)]">
            <span className="material-symbols-outlined text-5xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-headline font-bold text-white">Password Updated!</h2>
          <p className="text-[var(--color-on-surface-variant)] text-sm">
            Your credentials have been securely reset. Redirecting you to sign in...
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-headline font-bold mb-2">Create New Password</h1>
          <p className="text-[var(--color-on-surface-variant)] mb-10 text-sm">
            Please enter your new password below.
          </p>

          {!token && (
            <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] p-3 rounded-xl text-xs mb-4">
              Error: Reset token is missing. Please check your recovery link.
            </div>
          )}

          {error && (
            <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] p-3 rounded-xl text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full bg-[var(--color-surface-container)] border ${
                  error && !password ? "border-[var(--color-error)]" : "border-[var(--color-outline-variant)]/30"
                } rounded-xl px-4 py-3.5 text-white outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-body tracking-widest`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full bg-[var(--color-surface-container)] border ${
                  error && password !== confirmPassword ? "border-[var(--color-error)]" : "border-[var(--color-outline-variant)]/30"
                } rounded-xl px-4 py-3.5 text-white outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-body tracking-widest`}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full bg-[var(--color-primary)] text-[#390050] font-headline font-black text-sm py-4 rounded-xl hover:shadow-[0_0_20px_rgba(0,241,254,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#390050]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      {/* Left Form Panel */}
      <div className="flex flex-col justify-center p-10 md:p-16 relative">
        <Link
          href="/sign-in"
          className="absolute top-8 left-8 text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] hover:text-white transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Sign In
        </Link>

        <Suspense fallback={
          <div className="text-center text-[var(--color-on-surface-variant)]">Loading recovery state...</div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>

      {/* Right Design Panel */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-[var(--color-surface-container)] to-[var(--color-surface-container-high)] p-12 border-l border-[var(--color-outline-variant)]/20 relative overflow-hidden">
        {/* Subtle decorative orb */}
        <div className="absolute w-96 h-96 bg-[var(--color-primary)]/10 blur-[80px] rounded-full top-[10%] left-[-10%]" />

        <div className="relative z-10 text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,241,254,0.3)] mb-8">
            <span className="material-symbols-outlined text-5xl text-[var(--color-on-primary)]">lock</span>
          </div>
          <h2 className="text-4xl font-headline font-black tracking-tight text-white">Reset Credentials.</h2>
          <p className="text-[var(--color-on-surface-variant)] text-sm max-w-sm mx-auto leading-relaxed">
            Choose a strong password containing letters, numbers, and symbols to ensure optimal account safety.
          </p>
        </div>
      </div>
    </>
  );
}
