"use client";

import React, { useState } from "react";
import VideoPlayerModal, { VideoData } from "./VideoPlayerModal";

export interface InterviewItem {
  id: string;
  title: string;
  type: string;
  duration: string;
  videoUrl?: string;
  fallbackUrl?: string;
  thumbnailUrl?: string;
  fallbackThumbnailUrl?: string;
  description?: string;
  highlights?: string[];
  isFeatured?: boolean;
}

export interface CompanySection {
  name: string;
  brand: string;
  interviews: InterviewItem[];
}

interface RoleInterviewCatalogClientProps {
  companies: CompanySection[];
}

export default function RoleInterviewCatalogClient({
  companies,
}: RoleInterviewCatalogClientProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenVideo = (company: CompanySection, interview: InterviewItem) => {
    setSelectedVideo({
      id: interview.id,
      title: interview.title,
      type: interview.type,
      duration: interview.duration,
      company: company.name,
      companyBrand: company.brand,
      videoUrl: interview.videoUrl,
      fallbackUrl: interview.fallbackUrl,
      description: interview.description,
      highlights: interview.highlights,
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-16">
        {companies.map((company) => (
          <section key={company.name} className="relative scroll-mt-24" id={`company-${company.name.toLowerCase()}`}>
            {/* Company Section Header */}
            <div className="flex items-center gap-4 mb-8">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border shadow-[0_0_15px_rgba(255,255,255,0.05)] ${company.brand}`}
              >
                {company.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-3xl font-headline font-bold text-white">
                  {company.name} Interviews
                </h2>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
                  {company.interviews.length} public session{company.interviews.length > 1 ? "s" : ""} available
                </p>
              </div>
            </div>

            {/* Interviews Video Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {company.interviews.map((interview) => {
                return (
                  <div
                    key={interview.id}
                    onClick={() => handleOpenVideo(company, interview)}
                    className="group flex flex-col bg-[var(--color-surface-container-low)] ghost-border rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-400 cursor-pointer border hover:border-[var(--color-primary)]/50"
                  >
                    {/* Video Thumbnail / Stream Preview */}
                    <div className="aspect-video bg-black relative flex items-center justify-center border-b border-white/5 overflow-hidden">
                      {interview.thumbnailUrl ? (
                        <>
                          <img
                            src={interview.thumbnailUrl}
                            alt={interview.title}
                            onError={(e) => {
                              if (interview.fallbackThumbnailUrl) {
                                (e.target as HTMLImageElement).src = interview.fallbackThumbnailUrl;
                              }
                            }}
                            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20 group-hover:via-black/10 transition-colors" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-900 to-zinc-800 opacity-90 group-hover:scale-105 transition-transform duration-500" />
                      )}

                      {/* Featured Badge */}
                      {interview.isFeatured && (
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-red-600/90 to-amber-600/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                          <span className="material-symbols-outlined text-xs">star</span>
                          Featured Video
                        </div>
                      )}

                      {/* Play Button Icon with Pulsing Halo */}
                      <div className="relative z-10 w-14 h-14 rounded-full bg-black/50 group-hover:bg-[var(--color-primary)] flex items-center justify-center backdrop-blur-md border border-white/30 group-hover:border-[var(--color-primary)] group-hover:shadow-[0_0_25px_rgba(153,247,255,0.6)] group-hover:scale-110 transition-all duration-300">
                        <span className="material-symbols-outlined text-3xl text-white group-hover:text-[#004145] ml-0.5 transition-colors">
                          play_arrow
                        </span>
                      </div>

                      {/* Duration Tag */}
                      <div className="absolute bottom-3 right-3 z-10 bg-black/85 backdrop-blur text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-1 rounded-md text-white border border-white/10">
                        {interview.duration}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)]">
                          {interview.type}
                        </span>
                      </div>

                      <h3 className="font-headline font-bold text-lg leading-snug mb-3 text-white group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                        {interview.title}
                      </h3>

                      {interview.description && (
                        <p className="text-xs text-[var(--color-on-surface-variant)] line-clamp-2 mb-4 leading-relaxed">
                          {interview.description}
                        </p>
                      )}

                      <div className="mt-auto pt-2">
                        <button
                          type="button"
                          className="w-full py-2.5 rounded-xl text-sm font-bold bg-[var(--color-surface-container-high)] border border-white/5 text-[var(--color-on-surface)] group-hover:bg-[var(--color-primary)] group-hover:text-[#004145] group-hover:border-[var(--color-primary)] transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">smart_display</span>
                          Watch Public Interview
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Video Playback Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
