"use client";

import Link from "next/link";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function SignUpPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/interview/setup");
    }
  }, [status, router]);

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

    // Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    // Mobile validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!mobileRegex.test(formData.mobileNumber.replace(/\s+/g, ""))) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }

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
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.fullName,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({ form: data.error || "Registration failed. Please try again." });
        return;
      }

      // Automatically sign in the user
      const loginResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (loginResult?.error) {
        setErrors({ form: "Registration succeeded but automatic login failed. Please sign in." });
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch {
      setErrors({ form: "Connection to registration server failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Left Form Panel */}
      <div className="flex flex-col justify-center p-10 md:p-16 relative md:order-1 order-2">
        <Link href="/" className="absolute top-8 left-8 text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] hover:text-white transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Home
        </Link>
        
        <div className="max-w-md w-full mx-auto mt-8">
          {isSuccess ? (
            <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                <span className="material-symbols-outlined text-5xl">check_circle</span>
              </div>
              <h2 className="text-2xl font-headline font-bold text-white">Profile Initialized!</h2>
              <p className="text-[var(--color-on-surface-variant)] text-sm">
                Redirecting you to the Elevora dashboard...
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-headline font-bold mb-2">Create Account</h1>
              <p className="text-[var(--color-on-surface-variant)] mb-6 text-sm">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-[var(--color-secondary)] font-bold hover:underline">
                  Sign In here
                </Link>
              </p>

              {errors.form && (
                <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] p-3 rounded-xl text-xs mb-4">
                  {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Ada Lovelace"
                    className={`w-full bg-[var(--color-surface-container)] border ${errors.fullName ? "border-[var(--color-error)]" : "border-[var(--color-outline-variant)]/30"} rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-body text-sm`}
                  />
                  {errors.fullName && <p className="text-[var(--color-error)] text-[10px] mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5">Mobile Number</label>
                  <input 
                    type="tel" 
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className={`w-full bg-[var(--color-surface-container)] border ${errors.mobileNumber ? "border-[var(--color-error)]" : "border-[var(--color-outline-variant)]/30"} rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-body text-sm`}
                  />
                  {errors.mobileNumber && <p className="text-[var(--color-error)] text-[10px] mt-1">{errors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ada@elevora.ai"
                    className={`w-full bg-[var(--color-surface-container)] border ${errors.email ? "border-[var(--color-error)]" : "border-[var(--color-outline-variant)]/30"} rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-body text-sm`}
                  />
                  {errors.email && <p className="text-[var(--color-error)] text-[10px] mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5">Create Password</label>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full bg-[var(--color-surface-container)] border ${errors.password ? "border-[var(--color-error)]" : "border-[var(--color-outline-variant)]/30"} rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-body text-sm tracking-widest`}
                  />
                  {errors.password && <p className="text-[var(--color-error)] text-[10px] mt-1">{errors.password}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[var(--color-secondary)] text-[#1a0033] font-headline font-black text-sm py-4 rounded-xl mt-4 hover:shadow-[0_0_20px_rgba(213,117,255,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-[#1a0033]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Initializing Profile...
                    </>
                  ) : (
                    "Initialize Profile"
                  )}
                </button>
                
                <p className="text-[10px] text-center text-[var(--color-on-surface-variant)] leading-relaxed mt-4 px-4">
                  By creating an account, you agree to Elevora&apos;s <Link href="/terms" className="underline hover:text-white">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
                </p>

                <div className="relative my-6">
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
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Design Panel */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-bl from-[var(--color-surface-container)] to-[var(--color-surface-container-high)] p-12 border-l border-[var(--color-outline-variant)]/20 relative overflow-hidden md:order-2 order-1">
        {/* Subtle decorative orb */}
        <div className="absolute w-96 h-96 bg-[var(--color-secondary)]/10 blur-[80px] rounded-full bottom-[10%] right-[-10%]" />
        
        <div className="relative z-10 text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-[var(--color-surface-container)] border border-white/10 rounded-2xl flex items-center justify-center ghost-border mb-8">
            <span className="material-symbols-outlined text-5xl text-[var(--color-secondary)]">radar</span>
          </div>
          <h2 className="text-4xl font-headline font-black tracking-tight text-white">Dominate the Room.</h2>
          <div className="text-[var(--color-on-surface-variant)] text-sm max-w-sm mx-auto leading-relaxed space-y-3 pt-2">
            <div className="flex items-center gap-3 bg-[var(--color-surface-container)] p-3 rounded-xl border border-white/5 animate-pulse">
               <span className="material-symbols-outlined text-green-400">check_circle</span>
               <span>Real-time biometric pacing tracking</span>
            </div>
            <div className="flex items-center gap-3 bg-[var(--color-surface-container)] p-3 rounded-xl border border-white/5">
               <span className="material-symbols-outlined text-[var(--color-primary)]">check_circle</span>
               <span>Industry-specific AI interrogators</span>
            </div>
            <div className="flex items-center gap-3 bg-[var(--color-surface-container)] p-3 rounded-xl border border-white/5">
               <span className="material-symbols-outlined text-[var(--color-secondary)]">check_circle</span>
               <span>Unlimited infinite replay analysis</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
