"use client";

import React, { useEffect, useRef, useState } from "react";

export interface VideoData {
  id: string;
  title: string;
  type: string;
  duration: string;
  company: string;
  companyBrand?: string;
  videoUrl?: string;
  fallbackUrl?: string;
  description?: string;
  highlights?: string[];
}

interface VideoPlayerModalProps {
  video: VideoData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoPlayerModal({
  video,
  isOpen,
  onClose,
}: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset video state when video changes
  useEffect(() => {
    if (isOpen && video) {
      setIsLoading(true);
      setHasError(false);
      setIsUsingFallback(false);
      setCurrentSrc(video.videoUrl || video.fallbackUrl);
    }
  }, [video, isOpen]);

  if (!isOpen || !video) return null;

  const handleCopyLink = () => {
    const link = currentSrc || video.videoUrl || window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleError = () => {
    // If primary URL failed and we haven't tried fallback yet, attempt fallback
    const fallback = video.fallbackUrl || "/videos/google-honest-interview-experience.mp4";
    if (!isUsingFallback && currentSrc !== fallback) {
      console.log("Remote stream unavailable, switching to local backup stream:", fallback);
      setIsUsingFallback(true);
      setCurrentSrc(fallback);
      setIsLoading(true);
      setHasError(false);
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-[var(--color-surface-container-low)] border border-white/10 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[var(--color-surface-container)]/50">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                video.companyBrand || "bg-white/10 text-white border-white/20"
              }`}
            >
              {video.company}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
              {video.type}
            </span>
            <span className="text-xs text-[var(--color-on-surface-variant)]">•</span>
            <span className="text-xs text-[var(--color-on-surface-variant)] flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {video.duration}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Video Player Section */}
        <div className="relative bg-black aspect-video w-full flex items-center justify-center overflow-hidden">
          {currentSrc ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
                  <div className="w-10 h-10 border-3 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin mb-3" />
                  <p className="text-xs text-[var(--color-on-surface-variant)] font-mono">
                    Loading video...
                  </p>
                </div>
              )}

              {hasError ? (
                <div className="p-8 text-center max-w-md">
                  <span className="material-symbols-outlined text-5xl text-[var(--color-error)] mb-3">
                    error_outline
                  </span>
                  <h4 className="font-bold text-white mb-2">Failed to load video stream</h4>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mb-4">
                    The video source could not be reached. Ensure network is active.
                  </p>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.load();
                        setIsLoading(true);
                        setHasError(false);
                      }
                    }}
                    className="px-4 py-2 bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Retry Stream
                  </button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  key={currentSrc}
                  src={currentSrc}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  onCanPlay={() => setIsLoading(false)}
                  onError={handleError}
                  className="w-full h-full object-contain"
                />
              )}
            </>
          ) : (
            <div className="text-center p-8">
              <span className="material-symbols-outlined text-5xl text-white/20 mb-3">
                videocam_off
              </span>
              <p className="text-sm text-[var(--color-on-surface-variant)]">
                Video recording is being processed or URL is not yet attached.
              </p>
            </div>
          )}
        </div>

        {/* Video Info and Controls Footer */}
        <div className="p-6 overflow-y-auto space-y-4 bg-[var(--color-surface-container-low)]">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h3 className="font-headline font-black text-xl md:text-2xl text-white">
                {video.title}
              </h3>
              <p className="text-sm text-[var(--color-on-surface-variant)] mt-2 leading-relaxed max-w-3xl">
                {video.description ||
                  "Watch this full authentic interview breakdown and technical walkthrough. Master the problem-solving frameworks, behavioral expectations, and structural strategies for top tech companies."}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-white border border-white/5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">
                  {copied ? "check" : "share"}
                </span>
                {copied ? "URL Copied!" : "Share Link"}
              </button>
            </div>
          </div>

          {/* Highlights / Takeaways */}
          {video.highlights && video.highlights.length > 0 && (
            <div className="pt-4 border-t border-white/5">
              <h4 className="text-xs font-label text-[var(--color-primary)] mb-3">
                Key Topics Covered
              </h4>
              <div className="flex flex-wrap gap-2">
                {video.highlights.map((highlight, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] border border-white/5"
                  >
                    ✓ {highlight}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
