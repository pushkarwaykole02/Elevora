"use client";

import { useState } from "react";
import Link from "next/link";

export interface SessionItem {
  id: string;
  role: string;
  persona: string;
  difficulty: string;
  duration: string;
  score: number;
  status: string;
  date: string;
}

export interface StatsGroup {
  totalSessions: number;
  completedSessions: number;
  averageScore: string;
  hours: string;
}

export interface ArchiveClientProps {
  allSessions: SessionItem[];
  stats: {
    recent: StatsGroup;
    allTime: StatsGroup;
  };
}

function scoreColor(score: number) {
  if (score >= 85) return "var(--color-primary)";
  if (score >= 70) return "var(--color-secondary)";
  return "var(--color-error)";
}

export default function ArchiveClient({ allSessions, stats }: ArchiveClientProps) {
  const [view, setView] = useState<"recent" | "all">("recent");

  const displayedSessions = view === "recent" ? allSessions.slice(0, 5) : allSessions;
  const currentStats = view === "recent" ? stats.recent : stats.allTime;
  const inProgressCount = currentStats.totalSessions - currentStats.completedSessions;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-xs font-label text-[var(--color-on-surface-variant)] mb-1">History</p>
          <h1 className="text-4xl font-headline font-black">Session Archive</h1>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
            Browse and review your real AI interview practice sessions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="bg-[var(--color-surface-container-low)] ghost-border p-1 rounded-xl flex items-center">
            <button
              onClick={() => setView("recent")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-headline font-bold transition-all ${
                view === "recent"
                  ? "bg-[var(--color-surface-container)] text-[var(--color-primary)] shadow-sm"
                  : "text-[var(--color-on-surface-variant)] hover:text-white"
              }`}
            >
              Recent 5
            </button>
            <button
              onClick={() => setView("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-headline font-bold transition-all ${
                view === "all"
                  ? "bg-[var(--color-surface-container)] text-[var(--color-primary)] shadow-sm"
                  : "text-[var(--color-on-surface-variant)] hover:text-white"
              }`}
            >
              All ({stats.allTime.totalSessions})
            </button>
          </div>

          <Link
            href="/interview/setup"
            id="archive-new-session"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-fixed)] text-[var(--color-on-primary)] font-headline font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,241,254,0.3)] transition-all active:scale-95 whitespace-nowrap"
          >
            + New Session
          </Link>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-5 flex items-center gap-4">
          <span className="material-symbols-outlined text-2xl text-[var(--color-primary)]">history</span>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="font-headline font-black text-2xl text-[var(--color-primary)]">
                {currentStats.totalSessions}
              </p>
              <span className="text-[10px] font-label uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                {view === "recent" ? "Recent" : "Total"}
              </span>
            </div>
            <p className="text-xs font-label text-[var(--color-on-surface-variant)] mt-0.5">
              {currentStats.completedSessions} Completed · {inProgressCount} In Progress
            </p>
          </div>
        </div>

        <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-5 flex items-center gap-4">
          <span className="material-symbols-outlined text-2xl text-[var(--color-secondary)]">trending_up</span>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="font-headline font-black text-2xl text-[var(--color-secondary)]">
                {currentStats.averageScore}
              </p>
              <span className="text-[10px] font-label uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Average Score
              </span>
            </div>
            <p className="text-xs font-label text-[var(--color-on-surface-variant)] mt-0.5">
              Across {currentStats.completedSessions} completed {view === "recent" ? "recent" : "lifetime"} session(s)
            </p>
          </div>
        </div>

        <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-5 flex items-center gap-4">
          <span className="material-symbols-outlined text-2xl text-[var(--color-tertiary)]">schedule</span>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="font-headline font-black text-2xl text-[var(--color-tertiary)]">
                {currentStats.hours}
              </p>
              <span className="text-[10px] font-label uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Practiced
              </span>
            </div>
            <p className="text-xs font-label text-[var(--color-on-surface-variant)] mt-0.5">
              {view === "recent" ? "Recent 5 practice hours" : "All-time accumulated time"}
            </p>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-b border-[var(--color-outline-variant)]/20 text-xs font-label text-[var(--color-on-surface-variant)] uppercase tracking-wider text-center items-center">
          <span className="text-left left-aligned">
            Role {view === "recent" ? "(Recent 5)" : `(All ${allSessions.length})`}
          </span>
          <span>Persona</span>
          <span>Difficulty</span>
          <span>Duration</span>
          <span>Score</span>
          <span className="text-right">Action</span>
        </div>

        {displayedSessions.length === 0 ? (
          <div className="py-16 px-6 text-center flex flex-col items-center justify-center gap-4">
            <span className="material-symbols-outlined text-5xl text-[var(--color-on-surface-variant)]/40">
              history_toggle_off
            </span>
            <div>
              <p className="font-headline font-bold text-lg text-[var(--color-on-surface)]">
                No interview sessions recorded yet
              </p>
              <p className="text-sm text-[var(--color-on-surface-variant)] mt-1 max-w-md mx-auto">
                Complete your first practice session to get real AI-powered debriefs, scores, and proctoring analytics.
              </p>
            </div>
            <Link
              href="/interview/setup"
              className="mt-2 px-6 py-2.5 rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30 font-headline font-bold text-xs uppercase tracking-wider hover:bg-[var(--color-primary)]/25 transition-all"
            >
              Start an Interview
            </Link>
          </div>
        ) : (
          displayedSessions.map((s, i) => (
            <div
              key={s.id}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-4 items-center px-6 py-4 hover:bg-[var(--color-surface-container)] transition-colors text-center ${
                i !== displayedSessions.length - 1 ? "border-b border-[var(--color-outline-variant)]/10" : ""
              }`}
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <p className="font-headline font-semibold text-sm text-[var(--color-on-surface)]">{s.role}</p>
                  {s.status === "IN_PROGRESS" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] font-label uppercase">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-on-surface-variant)]">{s.date}</p>
              </div>
              <span className="text-sm text-[var(--color-on-surface-variant)] uppercase tracking-widest">{s.persona}</span>
              <div>
                <span
                  className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest"
                  style={{
                    backgroundColor:
                      s.difficulty.toLowerCase() === "senior" || s.difficulty.toLowerCase() === "director"
                        ? "color-mix(in srgb, var(--color-secondary) 15%, transparent)"
                        : "color-mix(in srgb, var(--color-primary) 15%, transparent)",
                    color:
                      s.difficulty.toLowerCase() === "senior" || s.difficulty.toLowerCase() === "director"
                        ? "var(--color-secondary)"
                        : "var(--color-primary)",
                  }}
                >
                  {s.difficulty}
                </span>
              </div>
              <span className="text-sm text-[var(--color-on-surface-variant)]">{s.duration}</span>
              <span
                className="font-headline font-black text-xl"
                style={{ color: s.status === "COMPLETED" ? scoreColor(s.score) : "var(--color-on-surface-variant)" }}
              >
                {s.status === "COMPLETED" ? s.score : "—"}
              </span>
              <div className="flex justify-end">
                {s.status === "COMPLETED" ? (
                  <Link
                    href={`/interview/feedback?sessionId=${s.id}`}
                    id={`archive-replay-${s.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] hover:text-white transition-colors whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-base">analytics</span>
                    Debrief
                  </Link>
                ) : (
                  <Link
                    href={`/interview/active?sessionId=${s.id}`}
                    id={`archive-resume-${s.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[var(--color-secondary)] hover:text-white transition-colors whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-base">play_arrow</span>
                    Resume
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
