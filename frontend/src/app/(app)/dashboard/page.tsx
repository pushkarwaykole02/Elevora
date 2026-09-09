import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Elevora performance overview — sessions, skill scores, and progress at a glance.",
};

async function getDashboardData(userId: string, email?: string, name?: string, avatarUrl?: string) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const url = `${backendUrl}/api/users/${userId}/dashboard`;
  console.log(`[getDashboardData] Fetching from URL: ${url}`);
  console.log(`[getDashboardData] Parameters - userId: "${userId}", email: "${email}", name: "${name}"`);
  try {
    let res = await fetch(url, {
      cache: "no-store",
    });

    // Self-healing: if user is not found in database (404), auto-sync/register them
    if (res.status === 404 && email && name) {
      console.log(`[getDashboardData] User not found (404). Auto-registering ${email} with ID ${userId}...`);
      const syncRes = await fetch(`${backendUrl}/api/auth/sync-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          email,
          name,
          avatarUrl: avatarUrl || null,
        }),
      });

      if (syncRes.ok) {
        console.log("[getDashboardData] Auto-registration succeeded. Retrying dashboard fetch...");
        res = await fetch(url, {
          cache: "no-store",
        });
      }
    }

    if (res.status === 404) {
      console.warn(`[getDashboardData] User ${userId} not found in database.`);
      return {
        stats: {
          sessions: 0,
          avgScore: "0%",
          skills: [
            { name: "Communication",      score: 0, color: "var(--color-primary)" },
            { name: "Technical Depth",    score: 0, color: "var(--color-secondary)" },
            { name: "Leadership Presence",score: 0, color: "var(--color-tertiary)" },
            { name: "Clarity Under Fire", score: 0, color: "var(--color-primary-fixed)" },
          ],
          hours: "0h",
        },
        recentSessions: [],
        userNotFound: true,
      };
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "No error body");
      console.warn(`[getDashboardData] Failed to fetch: Status ${res.status}, Body: ${text}`);
      throw new Error(`Failed to fetch dashboard data (Status ${res.status})`);
    }
    return await res.json();
  } catch (error) {
    console.warn("Error fetching dashboard data:", error);
    return {
      stats: {
        sessions: 0,
        avgScore: "0%",
        skills: [
          { name: "Communication",      score: 0, color: "var(--color-primary)" },
          { name: "Technical Depth",    score: 0, color: "var(--color-secondary)" },
          { name: "Leadership Presence",score: 0, color: "var(--color-tertiary)" },
          { name: "Clarity Under Fire", score: 0, color: "var(--color-primary-fixed)" },
        ],
        hours: "0h",
      },
      recentSessions: [],
      userNotFound: true,
    };
  }
}

export default async function DashboardPage() {
  const session = await auth();
  console.log("[DashboardPage] session:", JSON.stringify(session));
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { stats, recentSessions, userNotFound } = await getDashboardData(
    session.user.id,
    session.user.email || undefined,
    session.user.name || undefined,
    session.user.image || undefined
  );

  const statCards = [
    { label: "Sessions",     value: String(stats.sessions),    icon: "history",      color: "var(--color-primary)" },
    { label: "Avg Score",    value: stats.avgScore,            icon: "trending_up",  color: "var(--color-secondary)" },
    { label: "Skills",       value: String(stats.skills.filter((sk: any) => sk.score > 0).length), icon: "auto_awesome", color: "var(--color-tertiary)" },
    { label: "Hours",        value: stats.hours,               icon: "schedule",     color: "var(--color-primary-fixed)" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Session Out of Sync Warning */}
      {userNotFound && (
        <div className="mb-6 bg-[var(--color-surface-container)] border border-red-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-headline font-bold text-red-400 mb-1">Session Out of Sync</h2>
            <p className="text-[var(--color-on-surface-variant)] text-xs">
              Your session is active but your user record was not found in the new database. Please sign out and sign back in to register.
            </p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-xl whitespace-nowrap transition-all active:scale-95 border border-red-500/40 text-sm"
            >
              Sign Out & Sync
            </button>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-label text-[var(--color-on-surface-variant)] mb-1">
          Welcome back, {session.user.name}
        </p>
        <h1 className="text-4xl font-headline font-black text-[var(--color-on-surface)]">
          Your Command Center
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300"
          >
            <span
              className="material-symbols-outlined text-3xl"
              style={{ color: s.color }}
            >
              {s.icon}
            </span>
            <div>
              <div className="text-3xl font-headline font-black" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-xs font-label text-[var(--color-on-surface-variant)]">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <div className="md:col-span-2 bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-headline font-bold">Recent Sessions</h2>
            <Link
              href="/archive"
              className="text-xs font-label text-[var(--color-primary)] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentSessions.length === 0 ? (
              <div className="text-center py-12 text-sm text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container)] rounded-xl border border-dashed border-white/5 p-6">
                <span className="material-symbols-outlined text-3xl mb-2 text-[var(--color-on-surface-variant)] block">
                  history
                </span>
                No recent sessions found. Start a new interview to begin!
              </div>
            ) : (
              recentSessions.map((s: any) => (
                <Link
                  key={s.id}
                  href={`/interview/feedback?sessionId=${s.id}`}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-variant)] transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-headline font-semibold text-sm text-[var(--color-on-surface)]">
                      {s.role}
                    </p>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">
                      {s.company} · {s.date}
                    </p>
                  </div>
                  <div
                    className="text-xl font-headline font-black"
                    style={{
                      color:
                        s.status === "IN_PROGRESS"
                          ? "var(--color-on-surface-variant)"
                          : s.score >= 85
                          ? "var(--color-primary)"
                          : s.score >= 70
                          ? "var(--color-secondary)"
                          : "var(--color-error)",
                    }}
                  >
                    {s.status === "IN_PROGRESS" ? (
                      <span className="text-xs font-label bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-wider text-xs">
                        In Progress
                      </span>
                    ) : (
                      s.score
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Skill Snapshot */}
        <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6">
          <h2 className="text-xl font-headline font-bold mb-6">Skill Snapshot</h2>
          <div className="flex flex-col gap-5">
            {stats.skills.map((sk: any) => (
              <div key={sk.name}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-[var(--color-on-surface)]">{sk.name}</span>
                  <span className="text-sm font-bold font-headline" style={{ color: sk.color }}>
                    {sk.score}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[var(--color-surface-container)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${sk.score}%`, backgroundColor: sk.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/analytics"
            id="dashboard-full-analytics"
            className="mt-8 w-full py-3 rounded-xl ghost-border text-sm font-headline font-bold text-center block text-[var(--color-primary)] hover:bg-[var(--color-surface-container)] transition-colors"
          >
            Full Analytics →
          </Link>
        </div>
      </div>

      {/* Quick Start */}
      <div className="mt-6 bg-gradient-to-br from-[var(--color-surface-container)] to-[var(--color-surface-container-lowest)] ghost-border rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-headline font-bold mb-2">Ready for your next challenge?</h2>
          <p className="text-[var(--color-on-surface-variant)] text-sm">
            Start a new AI-powered interview session and push your limits.
          </p>
        </div>
        <Link
          href="/interview/setup"
          id="dashboard-start-interview"
          className="px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-fixed)] text-[var(--color-on-primary)] font-bold rounded-xl whitespace-nowrap hover:shadow-[0_0_25px_rgba(0,241,254,0.35)] transition-all active:scale-95"
        >
          New Interview →
        </Link>
      </div>
    </div>
  );
}
