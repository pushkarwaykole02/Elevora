"use client";

import { RefObject } from "react";
import type { MediaDeviceStatus } from "@/hooks/useMediaDevices";

interface InterviewPreInterviewGateProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: MediaDeviceStatus;
  error: string | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  micLevel: number;
  isReady: boolean;
  role: string;
  onRetry: () => void;
  onBegin: () => void;
}

export default function InterviewPreInterviewGate({
  videoRef,
  status,
  error,
  videoEnabled,
  audioEnabled,
  micLevel,
  isReady,
  role,
  onRetry,
  onBegin,
}: InterviewPreInterviewGateProps) {
  return (
    <div className="h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 md:p-8">
        <div className="mb-6">
          <p className="text-xs font-label text-[var(--color-primary)] mb-1 uppercase tracking-widest">
            Session launched
          </p>
          <h1 className="text-3xl font-headline font-black">Prepare for Your Interview</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] mt-2">
            {role} — enable camera and microphone to begin. Proctoring starts once you join.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="relative aspect-video bg-[var(--color-surface-container)] ghost-border rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {!isReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-2">
                <span className="material-symbols-outlined text-4xl text-[var(--color-on-surface-variant)]">
                  videocam
                </span>
                <p className="text-xs text-[var(--color-on-surface-variant)]">
                  {status === "requesting" ? "Requesting access..." : "Allow camera & mic to continue"}
                </p>
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs font-label bg-black/50 px-2 py-1 rounded-lg">
              <span
                className={`w-2 h-2 rounded-full ${
                  videoEnabled ? "bg-[var(--color-primary)] animate-pulse" : "bg-[var(--color-error)]"
                }`}
              />
              {videoEnabled ? "Camera Active" : "Camera Required"}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-[var(--color-surface-container)] ghost-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[var(--color-primary)]">mic</span>
                <p className="font-headline font-bold text-sm">Microphone Test</p>
              </div>
              <p className="text-xs text-[var(--color-on-surface-variant)] mb-3">
                Speak normally — the bar should move when your mic picks up sound.
              </p>
              <div className="h-2 bg-[var(--color-surface-container-high)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-100"
                  style={{ width: `${micLevel}%` }}
                />
              </div>
              <p className="text-xs mt-2 text-[var(--color-on-surface-variant)]">
                {audioEnabled ? "Microphone detected" : "Microphone required"}
              </p>
            </div>

            <div className="bg-[var(--color-surface-container)] ghost-border rounded-xl p-4 text-sm text-[var(--color-on-surface-variant)] space-y-2">
              <p className="font-headline font-bold text-[var(--color-on-surface)] text-sm">Proctoring rules</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Stay on this tab — switches are logged</li>
                <li>Keep your face visible and centered at all times</li>
                <li>Avoid excessive movement or turning away</li>
                <li>Copy/paste is disabled during the session</li>
                <li>Code questions open a syntax chat panel</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--color-error-container)] text-[var(--color-error)] text-sm flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1.5 rounded-lg bg-[var(--color-error)]/20 font-headline font-bold text-xs hover:brightness-110"
            >
              Retry
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onBegin}
          disabled={!isReady || !videoEnabled || !audioEnabled}
          className="w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-fixed)] text-[var(--color-on-primary)] font-headline font-black text-lg rounded-2xl hover:shadow-[0_0_40px_rgba(0,241,254,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isReady ? "Begin Interview →" : "Enable Camera & Mic to Begin"}
        </button>
      </div>
    </div>
  );
}
