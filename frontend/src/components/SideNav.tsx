"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard",       icon: "dashboard",      label: "Overview" },
  { href: "/interview/setup", icon: "smart_toy",       label: "New Interview" },
  { href: "/analytics",       icon: "query_stats",    label: "Skill Map" },
  { href: "/resume-manager",  icon: "description",    label: "Resume" },
  { href: "/catalog",         icon: "library_books",  label: "Catalog" },
  { href: "/coding-challenges", icon: "code",         label: "Coding Challenges" },
  { href: "/archive",         icon: "history",        label: "Session Archive" },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 flex flex-col py-8 ghost-border border-r bg-[#0a0a0aee] backdrop-blur-2xl">
      {/* Brand */}
      <div className="px-6 mb-10">
        <Link href="/" className="block">
          <span className="text-xl font-bold text-[var(--color-primary)] font-headline tracking-tight">
            Elevora
          </span>
          <p className="text-[10px] text-[var(--color-on-surface-variant)] uppercase tracking-widest mt-1">
            Level 4 Analyst
          </p>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col font-headline font-medium text-sm">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`sidenav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
                isActive
                  ? "sidenav-active"
                  : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-6 mt-auto space-y-4">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="flex items-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] text-xs py-2 transition-colors w-full text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
