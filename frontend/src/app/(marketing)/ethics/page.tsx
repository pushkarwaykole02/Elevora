import Link from "next/link";

export default function EthicsPage() {
  return (
    <div className="pt-32 pb-24 px-8 max-w-4xl mx-auto min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] hover:text-white transition-colors mb-12">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back Home
      </Link>
      
      <h1 className="text-5xl font-headline font-black mb-8 text-[var(--color-primary)]">AI Ethics & Principles</h1>
      <div className="space-y-6 text-[var(--color-on-surface-variant)] leading-relaxed">
        <p className="text-xl text-white font-medium">As we build the future of interview preparation, we remain committed to responsible intelligence.</p>
        
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Bias Mitigation</h2>
        <p>Our AI interrogators and sentiment analysis models are rigorously tested to minimize bias regarding accents, conversational pausing, and cultural communication styles. We believe an interface should evaluate technical and strategic brilliance—not mimic historical human hiring biases.</p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Transparent Biometrics</h2>
        <p>Biometric and sentiment feedback is strictly a self-improvement mirror. We do not use &ldquo;emotion scoring&rdquo; to penalize candidates behind the scenes. The metrics we show you are the same metrics our backend processes—no hidden &ldquo;hireability&rdquo; scores are computed.</p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Empowerment, Not Replacement</h2>
        <p>Elevora is designed to democratize access to elite-level interview practice. We do not sell our platform to corporations to replace human interviewers; our sole mission is to empower the candidate to shine under pressure.</p>
      </div>
    </div>
  );
}
