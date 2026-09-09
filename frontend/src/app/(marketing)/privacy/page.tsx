import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-24 px-8 max-w-4xl mx-auto min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] hover:text-white transition-colors mb-12">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back Home
      </Link>
      
      <h1 className="text-5xl font-headline font-black mb-8 text-[var(--color-primary)]">Privacy Policy</h1>
      <div className="space-y-6 text-[var(--color-on-surface-variant)] leading-relaxed">
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Data Collection</h2>
        <p>Elevora collects standard account information (email, name) and usage data to improve our services. When utilizing our simulated interviews, we also temporarily process biometric metadata (eye tracking, vocal tone).</p>
        
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Biometric Data Processing</h2>
        <p>Your biometric feedback is processed locally or in memory whenever possible. Video streams are analyzed in real-time by edge neural networks and are <strong>never permanently recorded or sold to third parties</strong> unless you explicitly enable Cloud Replays in your Session Archive.</p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Resume & Uploaded Files</h2>
        <p>Any resumes or documents you upload to the Resume Manager are parsed by our AI for ATS optimization. These files are securely stored and encrypted at rest.</p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Your Rights</h2>
        <p>You have the right to request full deletion of your account, session histories, and uploaded resumes at any time. Contact our support team for a full GDPR/CCPA data export.</p>
      </div>
    </div>
  );
}
