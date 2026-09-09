"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AtsBuilderSection from "./AtsBuilderSection";

interface ExtractedData {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  projects: string[];
  education: string[];
  internships: string[];
  certifications: string[];
}

interface Resume {
  id: string;
  fileUrl: string;
  isActive: boolean;
  uploadedAt: string;
  parsedData: {
    atsScore: number;
    keywordDensity: string;
    actionVerbs: number;
    size: string;
    strengths?: string[];
    missingSections?: string[];
    suggestions?: string[];
    extractedData?: ExtractedData;
  };
}

const MAX_RESUMES = 2;

export default function ResumeManagerPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const isElite = (session?.user as any)?.role === "ELITE" || true; // Maintain default test capability

  // Helper to extract clean filename
  const getFilename = (url: string) => {
    const parts = url.split("/");
    const rawName = parts[parts.length - 1];
    // Remove the timestamp prefix (e.g. 1700000000000_)
    const underscoreIndex = rawName.indexOf("_");
    return underscoreIndex !== -1 ? rawName.substring(underscoreIndex + 1) : rawName;
  };

  const fetchResumes = async () => {
    if (!userId) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/users/${userId}/resumes`);
      if (!res.ok) throw new Error("Failed to fetch resumes");
      const data = await res.json();
      setResumes(data);
    } catch (err) {
      console.error("Error loading resumes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchResumes();
    }
  }, [userId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (resumes.length >= MAX_RESUMES) {
      alert(`Maximum of ${MAX_RESUMES} resumes allowed. Delete one to upload a new resume.`);
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds the 5 MB limit.");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${backendUrl}/api/users/${userId}/resumes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: file.name,
            size: `${(file.size / 1024).toFixed(0)} KB`,
            dataUrl: base64Data,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Upload failed");
        }

        await fetchResumes();
      } catch (err) {
        console.error("Failed to upload file:", err);
        alert(err instanceof Error ? err.message : "Failed to upload resume. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSetActive = async (resumeId: string) => {
    if (!userId) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/users/${userId}/resumes/${resumeId}/active`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to set active");
      await fetchResumes();
    } catch (err) {
      console.error("Error activating resume:", err);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!userId) return;
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/users/${userId}/resumes/${resumeId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete resume");
      await fetchResumes();
    } catch (err) {
      console.error("Error deleting resume:", err);
    }
  };

  const activeResume = resumes.find((r) => r.isActive);

  const insights = [
    {
      label: "ATS Score",
      value: activeResume ? `${activeResume.parsedData.atsScore}%` : "--",
      icon: "check_circle",
      color: "var(--color-primary)",
    },
    {
      label: "Keyword Density",
      value: activeResume ? activeResume.parsedData.keywordDensity : "--",
      icon: "tag",
      color: "var(--color-secondary)",
    },
    {
      label: "Action Verbs",
      value: activeResume ? String(activeResume.parsedData.actionVerbs) : "--",
      icon: "bolt",
      color: "var(--color-tertiary)",
    },
  ];

  const atLimit = resumes.length >= MAX_RESUMES;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-label text-[var(--color-on-surface-variant)] mb-1">Manage</p>
        <h1 className="text-4xl font-headline font-black">Resume Manager</h1>
        <p className="text-sm text-[var(--color-on-surface-variant)] mt-2">
          You can store up to <span className="text-[var(--color-primary)] font-headline font-bold">{MAX_RESUMES} resumes</span>. One must be set as active for interview resume context.
        </p>
      </div>

      {/* Upload Zone */}
      <label
        id="resume-upload-zone"
        htmlFor={atLimit ? undefined : "resume-file-input"}
        className={`block w-full bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-12 text-center transition-all duration-300 mb-8 group ${
          isUploading ? "opacity-60 pointer-events-none" : atLimit ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-container)]"
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin mb-4" />
            <p className="font-headline font-bold text-lg text-[var(--color-on-surface)]">
              Uploading & Analyzing...
            </p>
          </div>
        ) : (
          <>
            <span className="material-symbols-outlined text-5xl text-[var(--color-primary)] mb-4 block group-hover:scale-110 transition-transform">
              upload_file
            </span>
            <p className="font-headline font-bold text-lg text-[var(--color-on-surface)] mb-2">
              Drop your resume here
            </p>
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              PDF, DOCX up to 5 MB · {resumes.length}/{MAX_RESUMES} slots used
            </p>
            {atLimit && (
              <p className="text-xs text-[var(--color-error)] mt-3 font-headline">
                Resume limit reached. Delete a resume below to upload a new one.
              </p>
            )}
          </>
        )}
        <input
          id="resume-file-input"
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          disabled={isUploading || atLimit}
          className="hidden"
        />
      </label>

      {/* File List */}
      <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-headline font-bold text-lg">Uploaded Resumes</h2>
          <span className="text-xs font-label text-[var(--color-on-surface-variant)]">
            {resumes.length}/{MAX_RESUMES} max
          </span>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-xs text-[var(--color-on-surface-variant)] font-label">Loading Resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-12 text-sm text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container)] rounded-xl border border-dashed border-white/5 p-6">
            <span className="material-symbols-outlined text-3xl mb-2 text-[var(--color-on-surface-variant)] block">
              description
            </span>
            No uploaded resumes found. Upload a resume to get AI insights.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {resumes.map((r) => {
              const formattedDate = new Date(r.uploadedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const filename = getFilename(r.fileUrl);

              return (
                <div
                  key={r.id}
                  className={`flex items-center justify-between px-5 py-4 rounded-xl transition-colors ${
                    r.isActive
                      ? "bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent border border-[var(--color-primary)]/30"
                      : "bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-variant)]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{ color: r.isActive ? "var(--color-primary)" : "var(--color-on-surface-variant)" }}
                    >
                      description
                    </span>
                    <div>
                      <p className={`font-headline font-semibold text-sm ${r.isActive ? "text-[var(--color-primary)]" : "text-[var(--color-on-surface)]"}`}>
                        {filename}
                        {r.isActive && (
                          <span className="ml-2 text-[10px] font-label bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--color-on-surface-variant)]">
                        {r.parsedData.size || "100 KB"} · {formattedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!r.isActive && (
                      <button
                        onClick={() => handleSetActive(r.id)}
                        className="text-xs font-label text-[var(--color-primary)] hover:underline cursor-pointer"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="material-symbols-outlined text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] text-lg transition-colors cursor-pointer"
                      aria-label="Delete resume"
                    >
                      delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="mt-6 bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6">
        <h2 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--color-secondary)]">auto_awesome</span>
          AI Resume Insights
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.label}
              className="bg-[var(--color-surface-container)] rounded-xl p-4 flex items-center gap-4 animate-in fade-in duration-300"
            >
              <span className="material-symbols-outlined text-3xl" style={{ color: insight.color }}>
                {insight.icon}
              </span>
              <div>
                <p className="font-headline font-black text-xl" style={{ color: insight.color }}>
                  {insight.value}
                </p>
                <p className="text-xs font-label text-[var(--color-on-surface-variant)]">{insight.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Strengths & Missing Sections */}
      {activeResume && (
        <div className="grid md:grid-cols-2 gap-6 mt-6 animate-in fade-in duration-300">
          {/* Strengths */}
          {activeResume.parsedData.strengths && activeResume.parsedData.strengths.length > 0 && (
            <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6">
              <h2 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--color-primary)]">verified</span>
                Key Strengths
              </h2>
              <div className="flex flex-col gap-3">
                {activeResume.parsedData.strengths.map((str, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-variant)] transition-colors">
                    <span className="material-symbols-outlined text-[var(--color-primary)] text-xl select-none">
                      check_circle
                    </span>
                    <p className="text-sm text-[var(--color-on-surface)] leading-relaxed">{str}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Sections */}
          {activeResume.parsedData.missingSections && activeResume.parsedData.missingSections.length > 0 && (
            <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6">
              <h2 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--color-secondary)]">warning</span>
                Missing Sections
              </h2>
              <div className="flex flex-col gap-3">
                {activeResume.parsedData.missingSections.map((sec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-variant)] transition-colors">
                    <span className="material-symbols-outlined text-[var(--color-secondary)] text-xl select-none">
                      error_outline
                    </span>
                    <p className="text-sm text-[var(--color-on-surface)] leading-relaxed">{sec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Suggestions List */}
      {activeResume && activeResume.parsedData.suggestions && activeResume.parsedData.suggestions.length > 0 && (
        <div className="mt-6 bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 animate-in fade-in duration-300">
          <h2 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-primary)]">assignment_turned_in</span>
            Actionable AI Recommendations
          </h2>
          <div className="flex flex-col gap-3">
            {activeResume.parsedData.suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-xl bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-variant)] transition-all duration-200"
              >
                <span className="material-symbols-outlined text-[var(--color-primary)] text-xl mt-0.5 select-none">
                  check_box_outline_blank
                </span>
                <p className="text-sm leading-relaxed text-[var(--color-on-surface)]">
                  {suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Resume Information */}
      {activeResume && activeResume.parsedData.extractedData && (
        <div className="mt-6 bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 animate-in fade-in duration-300">
          <h2 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-tertiary)]">contact_page</span>
            Extracted Resume Information
          </h2>
          
          {/* Summary Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-6 border-b border-white/5 pb-6">
            <div className="bg-[var(--color-surface-container)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-on-surface-variant)] mb-1">Name</p>
              <p className="font-headline font-bold text-sm text-white">{activeResume.parsedData.extractedData.name || "N/A"}</p>
            </div>
            <div className="bg-[var(--color-surface-container)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-on-surface-variant)] mb-1">Email</p>
              <p className="font-headline font-bold text-sm text-white">{activeResume.parsedData.extractedData.email || "N/A"}</p>
            </div>
            <div className="bg-[var(--color-surface-container)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-on-surface-variant)] mb-1">Phone</p>
              <p className="font-headline font-bold text-sm text-white">{activeResume.parsedData.extractedData.phone || "N/A"}</p>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            {/* Skills */}
            {activeResume.parsedData.extractedData.skills && activeResume.parsedData.extractedData.skills.length > 0 && (
              <div>
                <h3 className="text-xs font-label text-[var(--color-on-surface-variant)] mb-2.5 uppercase tracking-wider">Identified Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {activeResume.parsedData.extractedData.skills.map((skill, idx) => (
                    <span key={idx} className="text-xs bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-white">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Grid for lists */}
            <div className="grid md:grid-cols-2 gap-5 mt-2">
              {/* Projects */}
              {activeResume.parsedData.extractedData.projects && activeResume.parsedData.extractedData.projects.length > 0 && (
                <div className="bg-[var(--color-surface-container)] rounded-xl p-5">
                  <h4 className="text-xs font-label text-[var(--color-primary)] mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">code</span> Projects
                  </h4>
                  <ul className="list-disc pl-4 text-xs text-[var(--color-on-surface-variant)] flex flex-col gap-2">
                    {activeResume.parsedData.extractedData.projects.map((p, idx) => (
                      <li key={idx} className="leading-relaxed text-white">{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Internships */}
              {activeResume.parsedData.extractedData.internships && activeResume.parsedData.extractedData.internships.length > 0 && (
                <div className="bg-[var(--color-surface-container)] rounded-xl p-5">
                  <h4 className="text-xs font-label text-[var(--color-secondary)] mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">work</span> Internships / Experience
                  </h4>
                  <ul className="list-disc pl-4 text-xs text-[var(--color-on-surface-variant)] flex flex-col gap-2">
                    {activeResume.parsedData.extractedData.internships.map((int, idx) => (
                      <li key={idx} className="leading-relaxed text-white">{int}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Education */}
              {activeResume.parsedData.extractedData.education && activeResume.parsedData.extractedData.education.length > 0 && (
                <div className="bg-[var(--color-surface-container)] rounded-xl p-5">
                  <h4 className="text-xs font-label text-[var(--color-tertiary)] mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">school</span> Education
                  </h4>
                  <ul className="list-disc pl-4 text-xs text-[var(--color-on-surface-variant)] flex flex-col gap-2">
                    {activeResume.parsedData.extractedData.education.map((edu, idx) => (
                      <li key={idx} className="leading-relaxed text-white">{edu}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certifications */}
              {activeResume.parsedData.extractedData.certifications && activeResume.parsedData.extractedData.certifications.length > 0 && (
                <div className="bg-[var(--color-surface-container)] rounded-xl p-5">
                  <h4 className="text-xs font-label text-[var(--color-primary-fixed)] mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">military_tech</span> Certifications
                  </h4>
                  <ul className="list-disc pl-4 text-xs text-[var(--color-on-surface-variant)] flex flex-col gap-2">
                    {activeResume.parsedData.extractedData.certifications.map((c, idx) => (
                      <li key={idx} className="leading-relaxed text-white">{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AtsBuilderSection isElite={isElite} />
    </div>
  );
}
