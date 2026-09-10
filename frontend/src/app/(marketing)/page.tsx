import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import HomeCtaButton from "@/components/HomeCtaButton";

export const metadata: Metadata = {
  title: "Elevora | AI Interview Mastery",
  description: "The world's first luminescent interview simulator. Elevate your professional presence with real-time biometric feedback and industry-specific AI interrogators.",
};

export default async function LandingPage() {
  const session = await auth();
  const initialHref = session?.user ? "/interview/setup" : "/sign-up";

  return (
    <main className="relative pt-24">
      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="ambient-blob top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-primary)]/5" />
        <div className="ambient-blob bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-secondary)]/5" />

        <div className="z-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[var(--color-surface-container)] ghost-border rounded-full px-4 py-1.5 text-xs text-[var(--color-on-surface-variant)] font-label mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            Now with Biometric Sentiment Analysis — v3.0
          </div>

          <h1 className="font-headline font-black text-6xl md:text-8xl tracking-tight leading-tight mb-6">
            Master Interviews with <br />
            <span className="hero-gradient">AI Intelligence</span>
          </h1>

          <p className="text-[var(--color-on-surface-variant)] text-lg md:text-xl max-w-2xl mx-auto mb-14 font-body leading-relaxed">
            The world&apos;s first luminescent interview simulator. Elevate your professional presence with real-time biometric feedback and industry-specific AI interrogators.
          </p>

          {/* Floating AI Orb */}
          <div className="relative w-52 h-52 mx-auto select-none">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full orb-glow animate-pulse opacity-40" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[var(--color-primary-dim)]/30 to-[var(--color-secondary-dim)]/20 backdrop-blur-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-7xl text-[var(--color-primary)] opacity-90">
                psychology
              </span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mt-10 mb-5">
            <HomeCtaButton
              id="hero-cta-start"
              initialHref={initialHref}
              className="px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-fixed)] text-[var(--color-on-primary)] font-bold rounded-xl text-lg hover:shadow-[0_0_30px_rgba(0,241,254,0.4)] transition-all duration-300 active:scale-95"
            >
              Start for Free
            </HomeCtaButton>
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid ────────────────────────────────── */}
      <section id="features" className="py-32 px-8 max-w-7xl mx-auto">
        <h2 className="text-4xl font-headline font-bold text-center mb-4">
          Everything you need to dominate
        </h2>
        <p className="text-center text-[var(--color-on-surface-variant)] mb-16 max-w-xl mx-auto">
          From hyper-realistic AI interrogators to biometric feedback — we cover every dimension of interview mastery.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Large card */}
          <div className="md:col-span-7 group relative bg-[var(--color-surface-container-low)] rounded-2xl p-10 overflow-hidden ghost-border hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/10 blur-3xl group-hover:bg-[var(--color-primary)]/20 transition-all rounded-full" />
            <span className="material-symbols-outlined text-[var(--color-primary)] mb-6 text-4xl block">psychology</span>
            <h3 className="text-3xl font-headline font-bold mb-4 text-[var(--color-on-surface)]">
              Hyper-Realistic AI Interrogators
            </h3>
            <p className="text-[var(--color-on-surface-variant)] text-lg leading-relaxed mb-8">
              Our AI personas are trained on millions of successful tech, finance, and management interviews to provide the most rigorous challenge possible.
            </p>
            <div className="w-full h-36 bg-[var(--color-surface-container)] rounded-xl flex items-center justify-center gap-4 overflow-hidden">
              {["analyst", "ceo", "vp_product", "cto", "director"].map((role, i) => (
                <div
                  key={role}
                  className="flex flex-col items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-secondary)]/30 flex items-center justify-center border border-[var(--color-outline-variant)]">
                    <span className="material-symbols-outlined text-sm text-[var(--color-primary)]">person</span>
                  </div>
                  <span className="text-[8px] text-[var(--color-on-surface-variant)] uppercase tracking-wider font-label">{role.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Biometric card */}
          <div className="md:col-span-5 group relative bg-[var(--color-surface-container-low)] rounded-2xl p-10 overflow-hidden ghost-border hover:-translate-y-2 transition-all duration-500">
            <span className="material-symbols-outlined text-[var(--color-secondary)] mb-6 text-4xl block">query_stats</span>
            <h3 className="text-2xl font-headline font-bold mb-4 text-[var(--color-on-surface)]">
              Biometric Sentiment Analysis
            </h3>
            <p className="text-[var(--color-on-surface-variant)] leading-relaxed mb-6">
              Advanced computer vision tracks your eye contact, micro-expressions, and speech patterns to ensure absolute poise under pressure.
            </p>
            {/* Mini chart */}
            <div className="flex items-end gap-1.5 h-16">
              {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full bar-secondary opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ height: `${h}%`, transitionDelay: `${i * 40}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Replay card */}
          <div className="md:col-span-4 group relative bg-[var(--color-surface-container-low)] rounded-2xl p-10 overflow-hidden ghost-border hover:-translate-y-2 transition-all duration-500">
            <span className="material-symbols-outlined text-[var(--color-tertiary)] mb-6 text-4xl block">history</span>
            <h3 className="text-2xl font-headline font-bold mb-4 text-[var(--color-on-surface)]">
              Infinite Replay
            </h3>
            <p className="text-[var(--color-on-surface-variant)] leading-relaxed">
              Review every session with AI-curated highlight reels and time-stamped improvement suggestions.
            </p>
          </div>

          {/* Skill Map card */}
          <div className="md:col-span-8 group relative bg-[var(--color-surface-container-low)] rounded-2xl p-10 overflow-hidden ghost-border flex flex-col md:flex-row gap-8 items-center hover:shadow-[0_20px_50px_rgba(152,0,208,0.1)] transition-all duration-500">
            <div className="flex-1">
              <span className="material-symbols-outlined text-[var(--color-primary-fixed)] mb-6 text-4xl block">auto_awesome</span>
              <h3 className="text-2xl font-headline font-bold mb-4 text-[var(--color-on-surface)]">
                Skill Map Evolution
              </h3>
              <p className="text-[var(--color-on-surface-variant)] leading-relaxed">
                Dynamic skill progression tracking that visualizes your growth from a candidate to a director-level presence.
              </p>
            </div>
            <div className="w-full md:w-1/2 h-40 bg-[var(--color-surface-container)] rounded-xl flex items-center justify-center">
              <div className="flex gap-1.5 items-end h-20">
                {[40, 60, 80, 55, 70, 90, 65].map((h, i) => (
                  <div
                    key={i}
                    className="w-3 rounded-full bar-primary group-hover:scale-y-110 transition-transform origin-bottom"
                    style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────── */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-[var(--color-surface-container)] to-[var(--color-surface-container-lowest)] p-16 text-center ghost-border relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[var(--color-secondary)]/20 blur-[100px] rounded-full" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6">
              Ready to dominate your next board meeting?
            </h2>
            <p className="text-[var(--color-on-surface-variant)] text-lg mb-10 max-w-xl mx-auto">
              Join executives and designers who use Elevora to refine their professional edge.
            </p>
            <HomeCtaButton
              id="cta-claim-session"
              initialHref={initialHref}
              className="inline-block bg-[var(--color-primary)] text-[var(--color-on-primary)] font-black px-12 py-5 rounded-xl text-xl hover:shadow-[0_0_40px_rgba(153,247,255,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              Claim Your Free Session
            </HomeCtaButton>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="mt-16 pt-16 pb-8 px-8 bg-[var(--color-surface-container-low)] border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
          <div className="flex flex-col gap-4">
            <span className="text-lg font-bold text-[var(--color-primary)] font-headline">
              Elevora
            </span>
            <p className="text-[var(--color-on-surface-variant)] text-sm max-w-xs">
              Forging the elite professionals of tomorrow through luminescent intelligence.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-sm font-label text-[var(--color-on-surface-variant)]">
            {[
              { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "/upgrade" }] },
              { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Ethics", href: "/ethics" }, { label: "Contact", href: "/help" }] },
              { title: "Legal", links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }] },
              { title: "Social", links: [{ label: "X (Twitter)", href: "https://twitter.com" }, { label: "LinkedIn", href: "https://linkedin.com" }] },
            ].map((col) => (
              <div key={col.title} className="flex flex-col gap-4">
                <h4 className="text-[var(--color-on-surface)]">{col.title}</h4>
                {col.links.map((l) => (
                  <Link key={l.label} href={l.href} className="hover:text-[var(--color-primary)] transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs text-[var(--color-outline)] font-label">
          <span>© 2025 Elevora. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-4 items-center">
            <span className="material-symbols-outlined text-lg">language</span>
            <span>SYSTEM STATUS: OPTIMAL</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
