import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="pt-32 pb-24 px-8 max-w-4xl mx-auto min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] hover:text-white transition-colors mb-12">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back Home
      </Link>
      
      <h1 className="text-5xl font-headline font-black mb-8 text-[var(--color-primary)]">Terms of Service</h1>
      <div className="space-y-6 text-[var(--color-on-surface-variant)] leading-relaxed">
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing and using Elevora, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
        
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. User Conduct</h2>
        <p>You agree to use our AI and platform solely for personal interview preparation. Any attempt to reverse engineer our proprietary AI models, scrape interview catalogs, or exploit the biometric analysis systems is strictly prohibited.</p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Subscription & Billing</h2>
        <p>Elite memberships are billed securely. You may cancel your subscription at any time through your dashboard. Refund policies apply as strictly outlined in our billing FAQs.</p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Limitation of Liability</h2>
        <p>Elevora does not guarantee job placement or successful interview outcomes. Our platform is a training tool. We are not liable for any employment decisions made by third-party companies.</p>
      </div>
    </div>
  );
}
