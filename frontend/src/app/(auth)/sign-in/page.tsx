"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the current field as the user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ form: "Invalid credentials. Please try again." });
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch {
      setErrors({ form: "Connection to authentication server failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Left Design Panel */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-[var(--color-surface-container)] to-[var(--color-surface-container-high)] p-12 border-r border-[var(--color-outline-variant)]/20 relative overflow-hidden">
        {/* Subtle decorative orb */}
        <div className="absolute w-96 h-96 bg-[var(--color-primary)]/10 blur-[80px] rounded-full top-[10%] left-[-10%]" />
        
        <div className="relative z-10 text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,241,254,0.3)] mb-8 animate-pulse">
            <span className="material-symbols-outlined text-5xl text-[var(--color-on-primary)]">psychology</span>
          </div>
          <h2 className="text-4xl font-headline font-black tracking-tight text-white">Welcome back to the Vault.</h2>
          <p className="text-[var(--color-on-surface-variant)] text-lg max-w-sm mx-auto leading-relaxed">
            Continue forging your professional presence with luminescent intelligence.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-col justify-center p-10 md:p-16 relative">
        <Link href="/" className="absolute top-8 right-8 text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] hover:text-white transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">close</span>
          Exit
        </Link>
        
        <div className="max-w-md w-full mx-auto">
          {isSuccess ? (
            <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                <span className="material-symbols-outlined text-5xl">check_circle</span>
              </div>
              <h2 className="text-2xl font-headline font-bold text-white">Access Granted</h2>
              <p className="text-[var(--color-on-surface-variant)] text-sm">
                Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-headline font-bold mb-2">Sign In</h1>
              <p className="text-[var(--color-on-surface-variant)] mb-10 text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="text-[var(--color-primary)] font-bold hover:underline">
                  Create one now
                </Link>
              </p>

              {errors.form && (
                <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] p-3 rounded-xl text-xs mb-4">
                  {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-2">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="director@elevora.ai"
                    className={`w-full bg-[var(--color-surface-container)] border ${errors.email ? "border-[var(--color-error)]" : "border-[var(--color-outline-variant)]/30"} rounded-xl px-4 py-3.5 text-white outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-body`}
                  />
                  {errors.email && <p className="text-[var(--color-error)] text-xs mt-1.5">{errors.email}</p>}
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Password</label>
                    <Link href="/forgot-password" className="flex text-xs text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">Forgot Password?</Link>
                  </div>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••••••"
                    className={`w-full bg-[var(--color-surface-container)] border ${errors.password ? "border-[var(--color-error)]" : "border-[var(--color-outline-variant)]/30"} rounded-xl px-4 py-3.5 text-white outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-body tracking-widest`}
                  />
                  {errors.password && <p className="text-[var(--color-error)] text-xs mt-1.5">{errors.password}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[var(--color-primary)] text-[#390050] font-headline font-black text-sm py-4 rounded-xl mt-6 hover:shadow-[0_0_20px_rgba(0,241,254,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-[#390050]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    "Sign In to Dashboard"
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-outline-variant)]/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-[var(--color-surface-container-low)] px-4 text-[var(--color-on-surface-variant)]">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="flex items-center justify-center gap-3 py-3 px-4 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20 rounded-xl hover:bg-white/5 transition-colors text-sm font-bold cursor-pointer"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-4 h-4" />
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                  className="flex items-center justify-center gap-3 py-3 px-4 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20 rounded-xl hover:bg-white/5 transition-colors text-sm font-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">code</span>
                  GitHub
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
