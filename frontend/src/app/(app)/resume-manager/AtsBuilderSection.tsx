"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AtsBuilderSectionProps {
  isElite: boolean;
}

export default function AtsBuilderSection({ isElite }: AtsBuilderSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"idle" | "analyzing" | "success">("idle");
  const [progressText, setProgressText] = useState("");

  const startAnalysis = () => {
    setIsOpen(true);
    setStep("analyzing");
    
    // Mock the building sequence
    setTimeout(() => setProgressText("Extracting raw text..."), 0);
    setTimeout(() => setProgressText("Aligning to Harvard ATS standards..."), 1200);
    setTimeout(() => setProgressText("Injecting missing action verbs..."), 2400);
    setTimeout(() => setProgressText("Finalizing PDF structure..."), 3600);
    
    setTimeout(() => {
      setStep("success");
    }, 4500);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setStep("idle"), 300); // reset after animation
  };

  return (
    <>
      {/* Premium Feature: ATS-Friendly Builder */}
      <div className="mt-6 relative overflow-hidden rounded-2xl p-8 border border-[var(--color-secondary)]/20 bg-gradient-to-br from-[var(--color-surface-container-low)] to-[var(--color-surface-container-lowest)] ghost-border flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Background glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-secondary)]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[var(--color-secondary)] text-2xl">magic_button</span>
            <h2 className="text-2xl font-headline font-bold text-[var(--color-on-surface)]">
              ATS-Friendly Resume Builder
            </h2>
            {!isElite && (
              <span className="ml-2 text-[10px] font-bold tracking-widest uppercase bg-[var(--color-primary)] text-[var(--color-on-primary)] px-2 py-0.5 rounded-full">
                Elite
              </span>
            )}
          </div>
          <p className="text-[var(--color-on-surface-variant)] text-sm max-w-lg leading-relaxed">
            Automatically reformat your uploaded resume and optimize your keywords to beat Applicant Tracking Systems (ATS). Land interviews effortlessly.
          </p>
        </div>

        <div className="relative z-10 w-full md:w-auto">
          {isElite ? (
            <Link 
              href="/resume-builder"
              className="w-full md:w-auto px-8 py-3 bg-[var(--color-secondary)] text-[#390050] font-black rounded-xl hover:shadow-[0_0_20px_rgba(213,117,255,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">auto_fix_high</span>
              Make ATS-Friendly
            </Link>
          ) : (
            <Link 
              href="/upgrade"
              className="w-full md:w-auto px-8 py-3 bg-[var(--color-surface-container-highest)] border border-white/10 text-[var(--color-on-surface-variant)] font-bold rounded-xl hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)] transition-all flex items-center justify-center gap-2 active:scale-95 group"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              Upgrade to Unlock
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
