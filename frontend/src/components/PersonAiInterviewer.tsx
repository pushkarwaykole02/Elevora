"use client";

import Image from "next/image";

export type InterviewerCharacterState = "idle" | "speaking" | "listening" | "thinking";

interface PersonAiInterviewerProps {
  state: InterviewerCharacterState;
  micLevel?: number;
  isCodeQuestion?: boolean;
  wordPulse?: number;
}

const STATE_CONFIG = {
  idle: {
    label: "Ready",
    color: "#94a3b8",
    dotColor: "#94a3b8",
  },
  speaking: {
    label: "Speaking",
    color: "#00f1fe",
    dotColor: "#00f1fe",
  },
  listening: {
    label: "Listening",
    color: "#a855f7",
    dotColor: "#a855f7",
  },
  thinking: {
    label: "Analyzing",
    color: "#f59e0b",
    dotColor: "#f59e0b",
  },
};

export default function PersonAiInterviewer({
  state,
  isCodeQuestion = false,
}: PersonAiInterviewerProps) {
  const stateMeta = STATE_CONFIG[state] || STATE_CONFIG.idle;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      {/* Static Avatar Container (0 animations) */}
      <div className="relative flex items-center justify-center">
        {/* Frame with subtle border */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden bg-[var(--color-surface-container)] border border-white/10 shadow-xl flex items-end justify-center">
          {/* Subtle soft backdrop radial gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-container-high)] to-transparent pointer-events-none" />

          {/* Clean Cutout Interviewer without background (0 animations) */}
          <div className="relative w-full h-full flex items-end justify-center">
            <Image
              src="/avatars/interviewer.png"
              alt="AI Interviewer"
              fill
              sizes="(max-width: 640px) 160px, 192px"
              priority
              className="object-contain object-bottom"
            />
          </div>

          {/* Status Indicator Pill (Static, 0 animations) */}
          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-[10px] font-label z-10">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: stateMeta.dotColor }}
            />
            <span className="font-bold text-white uppercase tracking-wider">
              {stateMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Recruiter Details (Static) */}
      <div className="mt-3 flex flex-col items-center gap-0.5 z-10 text-center">
        <h4 className="font-headline font-bold text-base text-[var(--color-on-surface)]">
          AI Interviewer
        </h4>
        <p className="text-xs text-[var(--color-on-surface-variant)]">
          Technical Interview Lead · Elevora AI
        </p>

        {isCodeQuestion && (
          <span className="text-[10px] text-[var(--color-secondary)] font-label uppercase tracking-widest mt-0.5">
            Technical Problem Solving Mode
          </span>
        )}
      </div>
    </div>
  );
}
