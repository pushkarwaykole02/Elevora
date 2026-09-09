"use client";

import { useState } from "react";
import Link from "next/link";

interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  dates: string;
  achievements: string;
}

interface Education {
  id: number;
  degree: string;
  university: string;
  year: string;
}

interface Certification {
  id: number;
  name: string;
  link: string;
}

interface Project {
  id: number;
  name: string;
  link: string;
  summary: string;
}

export default function ResumeBuilderPage() {
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: 1, title: "", company: "", location: "", dates: "", achievements: "" }
  ]);
  const [educations, setEducations] = useState<Education[]>([
    { id: 1, degree: "", university: "", year: "" }
  ]);
  const [certifications, setCertifications] = useState<Certification[]>([
    { id: 1, name: "", link: "" }
  ]);
  const [projects, setProjects] = useState<Project[]>([
    { id: 1, name: "", link: "", summary: "" }
  ]);

  const addExperience = () => {
    setExperiences([...experiences, { id: Date.now(), title: "", company: "", location: "", dates: "", achievements: "" }]);
  };
  const removeExperience = (id: number) => {
    if (experiences.length > 1) setExperiences(experiences.filter(e => e.id !== id));
  };

  const addEducation = () => {
    setEducations([...educations, { id: Date.now(), degree: "", university: "", year: "" }]);
  };
  const removeEducation = (id: number) => {
    if (educations.length > 1) setEducations(educations.filter(e => e.id !== id));
  };

  const addCertification = () => {
    setCertifications([...certifications, { id: Date.now(), name: "", link: "" }]);
  };
  const removeCertification = (id: number) => {
    if (certifications.length > 1) setCertifications(certifications.filter(c => c.id !== id));
  };

  const addProject = () => {
    setProjects([...projects, { id: Date.now(), name: "", link: "", summary: "" }]);
  };
  const removeProject = (id: number) => {
    if (projects.length > 1) setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* Scrollable Form Section */}
      <div className="flex-1 max-w-3xl">
        <div className="mb-10 flex items-center gap-4">
          <Link href="/resume-manager" className="text-[var(--color-on-surface-variant)] hover:text-white transition-colors bg-[var(--color-surface-container)] p-2 rounded-xl">
            <span className="material-symbols-outlined block">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-3xl font-headline font-black">ATS-Friendly Builder</h1>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">We&apos;ll strict-format it to beat any ATS parser.</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          
          {/* Section 1: Contact Info */}
          <section className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-[var(--color-primary)]">person</span>
              Header / Contact Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-on-surface-variant)] mb-2">Full Name</label>
                <input type="text" placeholder="Jane Doe" className="w-full bg-[var(--color-surface-container)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-on-surface-variant)] mb-2">Professional Email</label>
                <input type="email" placeholder="jane.doe@example.com" className="w-full bg-[var(--color-surface-container)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-on-surface-variant)] mb-2">Phone Number</label>
                <input type="tel" placeholder="(555) 123-4567" className="w-full bg-[var(--color-surface-container)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-on-surface-variant)] mb-2">LinkedIn Profile URL</label>
                <input type="url" placeholder="linkedin.com/in/janedoe" className="w-full bg-[var(--color-surface-container)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-on-surface-variant)] mb-2">GitHub Profile URL</label>
                <input type="url" placeholder="github.com/janedoe" className="w-full bg-[var(--color-surface-container)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
              </div>
            </div>
            <p className="text-xs text-[var(--color-secondary)] mt-4 opacity-80 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              ATS Tip: Do not place contact information in the document header/footer. Our PDF builder automatically sets this correctly.
            </p>
          </section>

          {/* Section 2: Summary */}
          <section className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-[var(--color-primary)]">edit_document</span>
              Professional Summary
            </h2>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-on-surface-variant)] mb-2">2-3 Sentences Overview</label>
              <textarea 
                rows={4} 
                placeholder="Results-driven Software Engineer with 5+ years of experience in building scalable web applications. Adept at leveraging modern JavaScript frameworks to enhance user experience..."
                className="w-full bg-[var(--color-surface-container)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] border border-transparent transition-all resize-none"
              ></textarea>
            </div>
          </section>

          {/* Section 3: Work Experience */}
          <section className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--color-primary)]">work</span>
                Work Experience
              </h2>
            </div>
            
            <div className="flex flex-col gap-8">
              {experiences.map((exp, index) => (
                <div key={exp.id} className="relative bg-[var(--color-surface-container)] p-5 rounded-xl border border-white/5">
                  {experiences.length > 1 && (
                    <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  )}
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-[var(--color-secondary)]">Role {index + 1}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">Job Title</label>
                      <input type="text" placeholder="Senior Frontend Engineer" className="w-full bg-[var(--color-surface-container-high)] rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">Company</label>
                      <input type="text" placeholder="Tech Innovations Inc." className="w-full bg-[var(--color-surface-container-high)] rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">Dates (e.g. Jun 2020 - Present)</label>
                      <input type="text" placeholder="Jun 2020 - Present" className="w-full bg-[var(--color-surface-container-high)] rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">Location</label>
                      <input type="text" placeholder="New York, NY" className="w-full bg-[var(--color-surface-container-high)] rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">Achievements & Responsibilities (Use Bullet Points)</label>
                      <textarea 
                        rows={4} 
                        placeholder="• Spearheaded the migration of the legacy codebase to React 18, improving page load speeds by 40%&#10;• Mentored 3 junior engineers..."
                        className="w-full bg-[var(--color-surface-container-high)] rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-[var(--color-primary)] border border-transparent transition-all resize-none font-mono text-sm leading-relaxed"
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
              
              <button onClick={addExperience} className="py-3 px-4 border border-dashed border-[var(--color-primary)]/50 text-[var(--color-primary)] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-primary)]/10 transition-colors">
                <span className="material-symbols-outlined">add</span>
                Add Another Role
              </button>
            </div>
          </section>

          {/* Section 4: Skills */}
          <section className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-[var(--color-primary)]">psychology</span>
              Skills Section
            </h2>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-on-surface-variant)] mb-2">Hard Skills, Tools, & Software (Comma separated)</label>
              <textarea 
                rows={3} 
                placeholder="JavaScript, TypeScript, React, Next.js, Node.js, Python, PostgreSQL, AWS, Docker, Git"
                className="w-full bg-[var(--color-surface-container)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] border border-transparent transition-all resize-none font-mono text-sm"
              ></textarea>
            </div>
          </section>

          {/* Section 5: Education */}
          <section className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-[var(--color-primary)]">school</span>
              Education
            </h2>
            <div className="flex flex-col gap-6">
              {educations.map((edu, index) => (
                <div key={edu.id} className="relative bg-[var(--color-surface-container)] p-5 rounded-xl border border-white/5">
                  {educations.length > 1 && (
                    <button onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">Degree</label>
                      <input type="text" placeholder="B.S. in Computer Science" className="w-full bg-[var(--color-surface-container-high)] rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">University Name</label>
                      <input type="text" placeholder="Stanford University" className="w-full bg-[var(--color-surface-container-high)] rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">Graduation Year</label>
                      <input type="text" placeholder="2021" className="w-full bg-[var(--color-surface-container-high)] rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
                    </div>
                  </div>
                </div>
              ))}
              
              <button onClick={addEducation} className="py-3 px-4 border border-dashed border-[var(--color-primary)]/50 text-[var(--color-primary)] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-primary)]/10 transition-colors">
                <span className="material-symbols-outlined">add</span>
                Add Degree
              </button>
            </div>
          </section>

          {/* Section 6: Certifications */}
          <section className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-[var(--color-primary)]">workspace_premium</span>
              Certifications (Optional)
            </h2>
            <div className="flex flex-col gap-6">
              {certifications.map((cert) => (
                <div key={cert.id} className="relative bg-[var(--color-surface-container)] p-5 rounded-xl border border-white/5">
                  {certifications.length > 1 && (
                    <button onClick={() => removeCertification(cert.id)} className="absolute top-4 right-4 text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">Certification Name</label>
                      <input type="text" placeholder="AWS Certified Solutions Architect" className="w-full bg-[var(--color-surface-container-high)] rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">Certificate Link URL</label>
                      <input type="url" placeholder="https://www.credly.com/badges/..." className="w-full bg-[var(--color-surface-container-high)] rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
                    </div>
                  </div>
                </div>
              ))}
              
              <button onClick={addCertification} className="py-3 px-4 border border-dashed border-[var(--color-primary)]/50 text-[var(--color-primary)] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-primary)]/10 transition-colors">
                <span className="material-symbols-outlined">add</span>
                Add Certification
              </button>
            </div>
          </section>

          {/* Section 7: Projects */}
          <section className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-[var(--color-primary)]">assignment</span>
              Projects (Optional)
            </h2>
            <div className="flex flex-col gap-8">
              {projects.map((proj, index) => (
                <div key={proj.id} className="relative bg-[var(--color-surface-container)] p-5 rounded-xl border border-white/5">
                  {projects.length > 1 && (
                    <button onClick={() => removeProject(proj.id)} className="absolute top-4 right-4 text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  )}
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-[var(--color-secondary)]">Project {index + 1}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">Project Name</label>
                      <input type="text" placeholder="Elevora Fraud Detection" className="w-full bg-[var(--color-surface-container-high)] rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">Project Link (GitHub/Live URL)</label>
                      <input type="url" placeholder="https://github.com/..." className="w-full bg-[var(--color-surface-container-high)] rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-[var(--color-primary)] border border-transparent transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">Short Summary</label>
                      <textarea 
                        rows={3} 
                        placeholder="Built a full-stack Next.js application using machine learning models to detect credit card fraud..."
                        className="w-full bg-[var(--color-surface-container-high)] rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-[var(--color-primary)] border border-transparent transition-all resize-none font-mono text-sm leading-relaxed"
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
              
              <button onClick={addProject} className="py-3 px-4 border border-dashed border-[var(--color-primary)]/50 text-[var(--color-primary)] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-primary)]/10 transition-colors">
                <span className="material-symbols-outlined">add</span>
                Add Another Project
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Sidebar Action panel */}
      <div className="w-full lg:w-72 mt-8 lg:mt-0 p-6 bg-[var(--color-surface-container-low)] ghost-border rounded-2xl h-fit lg:sticky lg:top-24">
        <h3 className="font-headline font-bold text-lg mb-4">Ready to export?</h3>
        <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
          Your input is auto-saved. Click export to generate an ATS-verified PDF format based on Harvard standard templates.
        </p>
        <button className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-fixed)] text-[var(--color-on-primary)] py-4 rounded-xl font-black shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] transition-all flex items-center justify-center gap-2 active:scale-95 mb-4">
          <span className="material-symbols-outlined">download</span>
          Export PDF
        </button>
        <button className="w-full bg-[var(--color-surface-container-highest)] hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">visibility</span>
          Preview
        </button>
      </div>

    </div>
  );
}
