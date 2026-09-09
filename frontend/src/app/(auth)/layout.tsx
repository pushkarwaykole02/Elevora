import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | Elevora",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-primary)]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-secondary)]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Auth Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 bg-[var(--color-surface-container-low)] ghost-border rounded-3xl overflow-hidden shadow-2xl relative z-10 min-h-[600px]">
        {children}
      </div>
    </div>
  );
}
