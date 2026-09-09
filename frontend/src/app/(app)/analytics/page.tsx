import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Skill Analytics",
  description: "Deep-dive into your interview skill progression and performance trends.",
};

const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

async function getAnalyticsData(userId: string) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const url = `${backendUrl}/api/users/${userId}/analytics`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch analytics data (Status ${res.status})`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return {
      skills: [
        { name: "Communication", score: 0, prev: 0, icon: "record_voice_over" },
        { name: "Technical Depth", score: 0, prev: 0, icon: "code" },
        { name: "Leadership Presence", score: 0, prev: 0, icon: "leaderboard" },
        { name: "Clarity Under Fire", score: 0, prev: 0, icon: "psychology" }
      ],
      weeklyData: Array(12).fill(0)
    };
  }
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { skills, weeklyData } = await getAnalyticsData(session.user.id);

  const hasData = skills.some((sk: any) => sk.score > 0) || weeklyData.some((val: number) => val > 0);

  if (!hasData) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-label text-[var(--color-on-surface-variant)] mb-1">Performance</p>
          <h1 className="text-4xl font-headline font-black">Skill Analytics</h1>
        </div>
        <div className="flex flex-col items-center justify-center text-center p-12 bg-[var(--color-surface-container-low)] ghost-border rounded-2xl min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-3xl text-[var(--color-primary)]">query_stats</span>
          </div>
          <h2 className="text-xl font-headline font-bold text-[var(--color-on-surface)] mb-2">No Analytics Data Yet</h2>
          <p className="text-[var(--color-on-surface-variant)] text-sm max-w-md mb-8">
            Complete your first AI-powered mock interview to generate your personalized skill progression map and performance trends.
          </p>
          <Link
            href="/interview/setup"
            className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-fixed)] text-[var(--color-on-primary)] font-headline font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(0,241,254,0.3)] transition-all active:scale-95"
          >
            Start Mock Session →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-label text-[var(--color-on-surface-variant)] mb-1">Performance</p>
        <h1 className="text-4xl font-headline font-black">Skill Analytics</h1>
      </div>

      {/* Trend Chart */}
      <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 mb-8">
        <h2 className="font-headline font-bold text-lg mb-6">Overall Score Trend</h2>
        {/* Chart area */}
        <div className="relative h-44 mb-6">
          {/* Grid lines */}
          {[25, 50, 75, 100].map((v) => (
            <div
              key={v}
              className="absolute w-full border-t border-[var(--color-outline-variant)]/30"
              style={{ bottom: `${v}%` }}
            >
              <span className="text-[10px] font-label text-[var(--color-on-surface-variant)] relative -top-3 left-0">
                {v}
              </span>
            </div>
          ))}
          {/* Bars container — full height, flex align bottom */}
          <div className="absolute inset-0 pl-7 flex items-end gap-1.5">
            {weeklyData.map((val: number, i: number) => (
              <div
                key={i}
                className={`flex-1 rounded-t-md bar-primary hover:brightness-125 cursor-pointer transition-all duration-700 ${val === 0 ? "opacity-0" : ""}`}
                style={{ height: `${val}%` }}
                title={`${labels[i]}: ${val || "No data"}`}
              />
            ))}
          </div>
        </div>
        {/* Month labels below chart */}
        <div className="flex gap-1.5 pl-7">
          {labels.map((l) => (
            <div key={l} className="flex-1 text-center text-[9px] font-label text-[var(--color-on-surface-variant)]">
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Skill Breakdown */}
      <div className="grid md:grid-cols-2 gap-5">
        {skills.map((skill: any) => {
          const delta = skill.score - skill.prev;
          return (
            <div key={skill.name} className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ color: skill.score >= 80 ? "var(--color-primary)" : skill.score >= 70 ? "var(--color-secondary)" : "var(--color-error)" }}
                  >
                    {skill.icon}
                  </span>
                  <h3 className="font-headline font-bold">{skill.name}</h3>
                </div>
                <div className="text-right">
                  <div
                    className="font-headline font-black text-2xl"
                    style={{ color: skill.score >= 80 ? "var(--color-primary)" : skill.score >= 70 ? "var(--color-secondary)" : "var(--color-error)" }}
                  >
                    {skill.score}%
                  </div>
                  <div
                    className={`text-xs font-label ${delta >= 0 ? "text-[var(--color-primary)]" : "text-[var(--color-error)]"}`}
                  >
                    {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} pts
                  </div>
                </div>
              </div>
              <div className="w-full h-2 bg-[var(--color-surface-container)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${skill.score}%`,
                    backgroundColor:
                      skill.score >= 80
                        ? "var(--color-primary)"
                        : skill.score >= 70
                        ? "var(--color-secondary)"
                        : "var(--color-error)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
