"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const topLinks = [
  { href: "/dashboard",       label: "Dashboard" },
  { href: "/interview/setup", label: "Practice" },
  { href: "/analytics",       label: "Analytics" },
  { href: "/catalog",         label: "Resources" },
];

export default function TopNav() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <nav
      id="top-nav"
      className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-white/5"
    >
      {/* Left: brand + links */}
      <div className="flex items-center gap-10">
        <Link href="/" id="topnav-brand">
          <span className="text-2xl font-black italic tracking-tighter text-[var(--color-primary)] font-headline">
            Elevora
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 font-headline tracking-tight text-sm">
          {topLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                id={`topnav-${link.label.toLowerCase()}`}
                className={
                  isActive
                    ? "text-[var(--color-primary)] font-bold border-b-2 border-[var(--color-primary)] pb-1"
                    : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-4">
        {status === "authenticated" ? (
          <>
            {/* Notifications */}
            <div className="relative">
              <button
                id="topnav-notifications"
                onClick={() => toggleDropdown('notif')}
                className="material-symbols-outlined text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors text-xl pt-1"
                aria-label="Notifications"
              >
                notifications
              </button>
              {openDropdown === 'notif' && (
                <div className="absolute top-12 right-0 w-80 bg-[var(--color-surface-container-high)] border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-4 flex flex-col gap-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="text-sm font-bold border-b border-white/10 pb-2 mb-1">Notifications</h3>
                  <div className="text-xs p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors border-l-2 border-[var(--color-primary)]">
                    <span className="text-[var(--color-primary)] font-bold mb-1 block">Analysis Ready</span>
                    Your recent &apos;Product Manager&apos; mock interview results have been processed and are ready for review.
                  </div>
                  <div className="text-xs p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors border-t border-white/5">
                    <span className="text-[var(--color-secondary)] font-bold mb-1 block">New Interrogator</span>
                    Meet &apos;The Architect&apos; - a new rigorously technical AI available to Pro members.
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="relative">
              <button
                id="topnav-settings"
                onClick={() => toggleDropdown('settings')}
                className="material-symbols-outlined text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors text-xl pt-1"
                aria-label="Settings"
              >
                settings
              </button>
              {openDropdown === 'settings' && (
                <div className="absolute top-12 right-0 w-56 bg-[var(--color-surface-container-high)] border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-2 flex flex-col z-50 animate-in fade-in zoom-in-95 duration-200">
                   <Link href="/profile" onClick={() => setOpenDropdown(null)} className="text-left text-sm px-4 py-2.5 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3"><span className="material-symbols-outlined text-[18px]">person</span> Profile Account</Link>
                   <button className="text-left text-sm px-4 py-2.5 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3"><span className="material-symbols-outlined text-[18px]">mic</span> Audio & Video</button>
                   <button
                     onClick={() => { setOpenDropdown(null); signOut(); }}
                     className="text-left text-sm px-4 py-2.5 hover:bg-[var(--color-error-container)] text-[var(--color-error)] rounded-lg transition-colors mt-1 border-t border-white/10 flex items-center gap-3 w-full"
                   >
                     <span className="material-symbols-outlined text-[18px]">logout</span> Sign out
                   </button>
                </div>
              )}
            </div>

            {/* Pro Badge */}
            <div className="relative">
              <button
                id="topnav-pro-badge"
                onClick={() => toggleDropdown('pro')}
                className="px-4 py-1.5 rounded-full border border-[var(--color-secondary)] text-[var(--color-secondary)] text-sm font-bold hover:bg-[var(--color-secondary-container)] hover:text-white transition-all flex items-center gap-1"
              >
                Pro <span className="material-symbols-outlined text-[16px] -mr-1">expand_more</span>
              </button>
              {openDropdown === 'pro' && (
                <div className="absolute top-12 right-0 w-72 bg-gradient-to-b from-[#201f1f] to-[#131313] border border-[#d575ff]/30 rounded-xl shadow-[0_0_40px_rgba(213,117,255,0.15)] p-5 flex flex-col gap-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                   <div className="flex justify-center mb-1">
                     <span className="material-symbols-outlined text-4xl text-[var(--color-secondary)]">workspace_premium</span>
                   </div>
                   <h3 className="text-sm font-black text-center text-[var(--color-secondary)] tracking-widest uppercase">Elevate to Pro</h3>
                   <p className="text-xs text-center text-[var(--color-on-surface-variant)] mb-2 mt-1 leading-relaxed">Unlock unlimited biometrics, advanced AI interrogators, and exportable reports.</p>
                   <Link href="/upgrade" onClick={() => setOpenDropdown(null)} className="flex items-center justify-center w-full bg-[var(--color-secondary)] text-[#390050] font-black py-2.5 rounded-lg text-sm hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(213,117,255,0.4)] transition-all">Upgrade Now</Link>
                </div>
              )}
            </div>

            <Link
              href="/interview/setup"
              id="topnav-start-interview"
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-fixed)] text-[var(--color-on-primary)] px-6 py-2 rounded-xl font-bold text-sm hover:shadow-[0_0_15px_rgba(0,242,255,0.3)] transition-all active:scale-95 inline-block ml-2"
            >
              Start Interview
            </Link>
          </>
        ) : status === "unauthenticated" ? (
          <>
            <Link
              href="/sign-in"
              id="topnav-signin"
              className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors text-sm font-bold"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              id="topnav-signup"
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-fixed)] text-[var(--color-on-primary)] px-6 py-2 rounded-xl font-bold text-sm hover:shadow-[0_0_15px_rgba(0,242,255,0.3)] transition-all active:scale-95 inline-block ml-2"
            >
              Get Started
            </Link>
          </>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-[var(--color-primary)] animate-spin" />
        )}
      </div>
    </nav>
  );
}
