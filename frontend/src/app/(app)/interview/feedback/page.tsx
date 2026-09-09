import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Interview Feedback",
  description: "Detailed AI-powered feedback from your interview session.",
};

const fallbackCategories = [
  {
    name: "Communication",
    score: 88,
    color: "var(--color-primary)",
    notes: "Excellent articulation. Articulated database and project concepts clearly.",
  },
  {
    name: "Technical Fundamentals",
    score: 74,
    color: "var(--color-secondary)",
    notes: "Good grasp of core computer science fundamentals. Focus on database indexing and code complexity analysis.",
  },
  {
    name: "Problem Solving",
    score: 91,
    color: "var(--color-tertiary)",
    notes: "Showed a logical and structured step-by-step approach to algorithmic questions.",
  },
  {
    name: "Clarity Under Pressure",
    score: 63,
    color: "var(--color-error)",
    notes: "Showed some hesitation when probed on database normalization. Use the STAR method to describe project challenges.",
  },
];

const fallbackHighlights = [
  { time: "01:30", label: "Clear walkthrough of academic achievements and target role interests" },
  { time: "05:45", label: "Good explanation of Object-Oriented Programming (OOP) concepts" },
  { time: "11:20", label: "Slight hesitation when queried on database normalization / SQL joins" },
  { time: "17:10", label: "Strong and structured answer explaining your final year project" },
];

async function getSession(sessionId: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/sessions/${sessionId}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch session");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching session in feedback page:", error);
    return null;
  }
}

interface PageProps {
  searchParams: Promise<{ sessionId?: string }>;
}

export default async function InterviewFeedbackPage({ searchParams }: PageProps) {
  const { sessionId } = await searchParams;

  let sessionData = null;
  if (sessionId) {
    sessionData = await getSession(sessionId);
  }

  const role = sessionData?.domain || "Graduate Software Engineer";
  const level = sessionData?.level || "junior";
  const duration = sessionData?.duration || 24;
  const overallScore =
    sessionData?.overallScore !== undefined && sessionData?.overallScore !== null
      ? sessionData.overallScore
      : Math.round(fallbackCategories.reduce((sum, c) => sum + c.score, 0) / fallbackCategories.length);

  let categories = fallbackCategories;
  let highlights = fallbackHighlights;
  let persona = "APEX";

  if (sessionData?.feedbackJson && typeof sessionData.feedbackJson === "object") {
    const feedback = sessionData.feedbackJson as {
      persona?: string;
      categories?: typeof fallbackCategories;
      highlights?: typeof fallbackHighlights;
    };
    if (feedback.persona) {
      persona = feedback.persona.toUpperCase();
    }
    if (Array.isArray(feedback.categories)) {
      categories = feedback.categories;
    }
    if (Array.isArray(feedback.highlights)) {
      highlights = feedback.highlights;
    }
  }

  const transcript = Array.isArray(sessionData?.transcript)
    ? (sessionData.transcript as Array<{ speaker: string; text: string }>)
    : [];

  const proctoring = sessionData?.proctoringJson as
    | { violationCount?: number; violations?: Array<{ message: string }> }
    | null
    | undefined;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-label text-[var(--color-on-surface-variant)] mb-1">Session Complete</p>
        <h1 className="text-4xl font-headline font-black">Debrief Report</h1>
        <p className="text-[var(--color-on-surface-variant)] mt-2 uppercase tracking-wide text-xs font-semibold">
          {role} · {persona} Persona · {duration} min · {level}
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-br from-[var(--color-surface-container)] to-[var(--color-surface-container-lowest)] ghost-border rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 mb-8">
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-surface-variant)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - overallScore / 100)}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-headline font-black text-4xl text-[var(--color-primary)]">{overallScore}</span>
            <span className="text-xs font-label text-[var(--color-on-surface-variant)]">/ 100</span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-headline font-bold mb-2">Overall Performance</h2>
          <p className="text-[var(--color-on-surface-variant)] leading-relaxed">
            {overallScore >= 85
              ? "Excellent session. You showed strong mastery of key communication, technical structure, and alignment principles. Review minor highlights to push for perfection."
              : overallScore >= 70
                ? "Solid attempt. Good foundational skills, but technical depth and pressure management have room for growth. Practice with different personas to build confidence."
                : "A challenging session. Structure your responses using the STAR method and focus on core technical scenarios to improve clarity and reduce hesitation."}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {categories.map((cat) => (
          <div key={cat.name} className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-headline font-bold">{cat.name}</h3>
              <span className="font-headline font-black text-2xl" style={{ color: cat.color }}>
                {cat.score}
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--color-surface-container)] rounded-full mb-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${cat.score}%`, backgroundColor: cat.color }}
              />
            </div>
            <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">{cat.notes}</p>
          </div>
        ))}
      </div>

      {/* Full Interview Transcript */}
      {transcript.length > 0 && (
        <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline font-bold text-lg">Full Interview Transcript</h2>
            <span className="text-xs font-label text-[var(--color-on-surface-variant)]">
              {transcript.length} messages saved
            </span>
          </div>
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
            {transcript.map((line, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 ${line.speaker === "You" ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] font-label text-[var(--color-on-surface-variant)]">
                  {line.speaker}
                </span>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm max-w-[90%] leading-relaxed ${
                    line.speaker === "You"
                      ? "bg-[var(--color-primary)]/20 text-[var(--color-on-surface)]"
                      : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]"
                  }`}
                >
                  {line.text}
                </div>
              </div>
            ))}
          </div>
          {proctoring && (proctoring.violationCount ?? 0) > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--color-outline-variant)]/10">
              <p className="text-xs font-label text-[var(--color-error)] uppercase tracking-wider mb-2">
                Proctoring log · {proctoring.violationCount} flagged
              </p>
              <ul className="text-xs text-[var(--color-on-surface-variant)] space-y-1">
                {proctoring.violations?.slice(0, 5).map((v, i) => (
                  <li key={i}>· {v.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Highlights Timeline */}
      <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 mb-8">
        <h2 className="font-headline font-bold text-lg mb-5">Session Highlights</h2>
        <div className="flex flex-col gap-3">
          {highlights.map((h) => (
            <div
              key={h.time}
              className="flex items-center gap-4 py-3 px-4 rounded-xl bg-[var(--color-surface-container)]"
            >
              <span className="font-headline font-bold text-[var(--color-primary)] w-12">{h.time}</span>
              <span className="text-sm text-[var(--color-on-surface)]">{h.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="flex flex-col md:flex-row gap-4">
        <Link
          href="/interview/setup"
          id="feedback-retake-btn"
          className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-fixed)] text-[var(--color-on-primary)] font-headline font-bold text-center hover:shadow-[0_0_25px_rgba(0,241,254,0.35)] transition-all active:scale-95"
        >
          Practice Again
        </Link>
        <Link
          href="/dashboard"
          id="feedback-dashboard-btn"
          className="flex-1 py-4 rounded-xl ghost-border bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] font-headline font-bold text-center hover:bg-[var(--color-surface-variant)] transition-all"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
