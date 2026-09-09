"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const roles = [
  "Graduate Software Engineer",
  "Associate Frontend Developer",
  "Associate Backend Developer",
  "Full Stack Developer (Trainee)",
  "QA Test Analyst (Fresher)",
  "Systems Engineer (IT Support)",
  "Junior Data Analyst",
  "Cloud & DevOps Associate",
];

const difficulties = [
  { id: "intern", label: "Internship Role", desc: "Academics & basic logical skills" },
  { id: "junior", label: "Junior Developer", desc: "Core coding & CS fundamentals" },
  { id: "associate", label: "Associate Engineer", desc: "Deeper scenarios & system thinking" },
];

const questionLimits = [
  {
    count: 5,
    label: "5 Questions",
    est: "~15 mins",
    desc: "Fast technical screening & final year project check",
  },
  {
    count: 10,
    label: "10 Questions",
    est: "~30 mins",
    desc: "Standard technical interview with coding & system depth",
  },
  {
    count: 15,
    label: "15 Questions",
    est: "~45 mins",
    desc: "Comprehensive multi-domain engineering assessment",
  },
];

interface ActiveResumeInfo {
  id: string;
  fileUrl?: string;
  filename?: string;
  isActive: boolean;
  parsedData?: {
    size?: string;
    extractedData?: {
      projects?: string[];
      skills?: string[];
      internships?: string[];
      education?: string[];
      certifications?: string[];
    };
  };
}

export default function InterviewSetupPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [role, setRole] = useState(roles[0]);
  const [difficulty, setDifficulty] = useState("junior");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isStarting, setIsStarting] = useState(false);

  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [activeResume, setActiveResume] = useState<ActiveResumeInfo | null>(null);
  const [hasActiveResume, setHasActiveResume] = useState<boolean | null>(null);
  const [resumeHasParsedData, setResumeHasParsedData] = useState<boolean | null>(null);

  useEffect(() => {
    if (!userId) return;
    setIsLoadingResume(true);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${backendUrl}/api/users/${userId}/resumes`)
      .then((res) => res.json())
      .then((resumes: ActiveResumeInfo[]) => {
        setIsLoadingResume(false);
        if (!Array.isArray(resumes)) {
          setHasActiveResume(false);
          setResumeHasParsedData(false);
          setActiveResume(null);
          return;
        }

        const active = resumes.find((r) => r.isActive);
        if (!active) {
          setHasActiveResume(false);
          setResumeHasParsedData(false);
          setActiveResume(null);
          return;
        }

        setActiveResume(active);
        setHasActiveResume(true);

        const ext = active.parsedData?.extractedData;
        const hasContent = Boolean(
          ext &&
            ((Array.isArray(ext.projects) && ext.projects.length > 0) ||
              (Array.isArray(ext.internships) && ext.internships.length > 0) ||
              (Array.isArray(ext.skills) && ext.skills.length > 0) ||
              (Array.isArray(ext.education) && ext.education.length > 0) ||
              (Array.isArray(ext.certifications) && ext.certifications.length > 0))
        );
        setResumeHasParsedData(hasContent);
      })
      .catch((err) => {
        console.error("Failed to load user resumes:", err);
        setIsLoadingResume(false);
        setHasActiveResume(false);
        setResumeHasParsedData(false);
        setActiveResume(null);
      });
  }, [userId]);

  const canStart = !isLoadingResume && hasActiveResume === true && resumeHasParsedData === true;

  const handleStart = async () => {
    if (!userId) {
      alert("You must be logged in to start an interview session.");
      return;
    }

    if (!hasActiveResume || !resumeHasParsedData) {
      alert("A verified active resume is mandatory to start an interview session. Please upload your resume first.");
      return;
    }

    setIsStarting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          domain: role,
          level: difficulty,
          questionCount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to start session");
      }

      const data = await res.json();
      router.push(`/interview/active?sessionId=${data.sessionId}`);
    } catch (error: any) {
      console.error("Error starting interview session:", error);
      alert(error.message || "Failed to start interview session. Please try again.");
      setIsStarting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-label text-[var(--color-on-surface-variant)] mb-1">Configure</p>
        <h1 className="text-4xl font-headline font-black">New Interview Session</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* Target Role */}
        <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6">
          <h2 className="font-headline font-bold text-lg mb-4">Target Role</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {roles.map((r) => (
              <button
                key={r}
                id={`role-${r.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setRole(r)}
                className={`px-4 py-3 rounded-xl text-sm font-headline font-medium text-left transition-all ${
                  role === r
                    ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md"
                    : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] ghost-border"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6">
          <h2 className="font-headline font-bold text-lg mb-4">Difficulty Level</h2>
          <p className="text-xs text-[var(--color-on-surface-variant)] mb-4">
            Changes question depth during the live interview — intern is foundational, associate requires system thinking.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {difficulties.map((d) => (
              <button
                key={d.id}
                id={`difficulty-${d.id}`}
                onClick={() => setDifficulty(d.id)}
                className={`px-5 py-4 rounded-xl text-left transition-all ${
                  difficulty === d.id
                    ? "bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] ghost-border"
                    : "bg-[var(--color-surface-container)] ghost-border text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                }`}
              >
                <p className="font-headline font-bold">{d.label}</p>
                <p className="text-xs mt-1 opacity-80">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Question Limit (Replaces Duration Slider) */}
        <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-headline font-bold text-lg">Question Limit</h2>
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
                Select interview length. The AI interviewer will ask exactly this number of questions.
              </p>
            </div>
            <span className="text-xs font-label uppercase px-2.5 py-1 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
              {questionCount} Questions Selected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {questionLimits.map((q) => {
              const isSelected = questionCount === q.count;
              return (
                <button
                  key={q.count}
                  type="button"
                  id={`limit-${q.count}`}
                  onClick={() => setQuestionCount(q.count)}
                  className={`p-5 rounded-xl text-left transition-all relative ${
                    isSelected
                      ? "bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)] text-[var(--color-on-surface)]"
                      : "bg-[var(--color-surface-container)] ghost-border text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-headline font-black text-xl text-[var(--color-primary)]">
                      {q.label}
                    </span>
                    <span className="text-xs font-label px-2 py-0.5 rounded bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]">
                      {q.est}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{q.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mandatory Resume Context Card */}
        <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">
                description
              </span>
              <h2 className="font-headline font-bold text-lg">Resume Verification</h2>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--color-tertiary)]/20 text-[var(--color-tertiary)]">
              Mandatory Requirement
            </span>
          </div>

          <p className="text-xs text-[var(--color-on-surface-variant)] mb-4 leading-relaxed">
            Every interview conducts ground-truth verification of your <strong>Final Year Project</strong>, technical stack, and internships listed on your resume to evaluate authentic mastery and prevent fabricated credentials.
          </p>

          {isLoadingResume ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-surface-container)] ghost-border animate-pulse">
              <span className="w-4 h-4 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
              <p className="text-xs text-[var(--color-on-surface-variant)]">Checking active resume status...</p>
            </div>
          ) : hasActiveResume && resumeHasParsedData && activeResume ? (
            <div className="p-4 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center shrink-0 text-[var(--color-primary)]">
                  ✓
                </span>
                <div className="min-w-0">
                  <p className="font-headline font-bold text-sm text-[var(--color-on-surface)] truncate">
                    {activeResume.filename ||
                      (activeResume.fileUrl ? activeResume.fileUrl.split("/").pop()?.replace(/^\d+_/, "") : null) ||
                      "Uploaded Resume.pdf"}
                  </p>
                  <p className="text-xs text-[var(--color-primary)]">
                    Active & Verified — Ready for Final Year Project probing
                  </p>
                </div>
              </div>
              <Link
                href="/resume-manager"
                className="text-xs font-headline font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] underline shrink-0"
              >
                Change Resume
              </Link>
            </div>
          ) : hasActiveResume && !resumeHasParsedData ? (
            <div className="p-4 rounded-xl bg-[var(--color-error-container)]/20 border border-[var(--color-error)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-headline font-bold text-sm text-[var(--color-error)]">
                  Resume Content Unparsed
                </p>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
                  Your active resume has no extracted projects or skills. Please re-upload a text-based PDF.
                </p>
              </div>
              <Link
                href="/resume-manager"
                className="px-4 py-2 rounded-xl bg-[var(--color-error)] text-[var(--color-on-error)] font-headline text-xs font-bold shrink-0 text-center"
              >
                Fix in Resume Manager →
              </Link>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-headline font-bold text-sm text-[var(--color-on-surface)]">
                  No Active Resume Found
                </p>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
                  Upload and activate your resume PDF so the AI interviewer can analyze your final year project.
                </p>
              </div>
              <Link
                href="/resume-manager"
                className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-headline text-sm font-bold shrink-0 text-center hover:shadow-lg transition-all"
              >
                Upload Resume Now →
              </Link>
            </div>
          )}
        </div>

        {/* Start Button */}
        <button
          id="start-interview-btn"
          onClick={handleStart}
          disabled={isStarting || !canStart}
          className="w-full py-5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-fixed)] text-[var(--color-on-primary)] font-headline font-black text-xl rounded-2xl hover:shadow-[0_0_40px_rgba(0,241,254,0.4)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isStarting
            ? "Preparing Personalized Interview & Project Questions..."
            : !canStart
            ? "Upload Resume to Unlock Interview"
            : `Launch Interview Session (${questionCount} Questions) →`}
        </button>

        {!canStart && !isLoadingResume && (
          <p className="text-xs text-center text-[var(--color-on-surface-variant)] -mt-2">
            * An active resume is required to generate tailored questions on your final year project and practical skills.
          </p>
        )}
      </div>
    </div>
  );
}
