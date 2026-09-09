import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 px-8 max-w-4xl mx-auto min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] hover:text-white transition-colors mb-12">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back Home
      </Link>
      
      <h1 className="text-5xl font-headline font-black mb-8 text-[var(--color-primary)]">About Elevora</h1>
      <div className="space-y-6 text-[var(--color-on-surface-variant)] leading-relaxed">
        <p className="text-xl text-white font-medium">Forging the elite professionals of tomorrow through luminescent intelligence.</p>
        <p>Elevora started as a research project aiming to solve the disconnect between technical brilliance and interview presentation. We noticed that some of the brightest engineers and analysts failed to secure positions simply due to high-pressure environments.</p>
        <p>Our platform uses advanced biometric sentiment analysis, real-time AI interrogators, and vast data catalogs to simulate the exact conditions of high-stakes interviews at top-tier organizations.</p>
        <p>Built by a team of ex-FAANG engineers, cognitive scientists, and design leaders, we believe that interview mastery is a learnable skill, not an innate trait. Elevora is the ultimate training ground.</p>
      </div>
    </div>
  );
}
