import type { Metadata } from "next";
import Link from "next/link";
import ContactSupportSection from "./ContactSupportSection";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Get assistance, view FAQs, and contact support for Elevora.",
};

const faqItems = [
  {
    question: "How are my interview skills evaluated?",
    answer: "Our AI evaluates your responses based on communication clarity, technical accuracy, confidence, and leadership presence using standard industry rubrics.",
  },
  {
    question: "Can I review past interview sessions?",
    answer: "Yes, head over to the Session Archive to view past recordings, detailed feedback, and performance metrics for each interview.",
  },
  {
    question: "How do I upgrade to the Elite tier?",
    answer: "Simply click the 'Upgrade to Elite' button in the sidebar or visit your Account Settings to see our premium plans and features.",
  },
  {
    question: "Is there a limit on how many interviews I can take?",
    answer: "Free users have a limit of 5 sessions per month. Elite users enjoy unlimited mock interviews and advanced analytics.",
  },
];

const topics = [
  { title: "Account & Billing", icon: "manage_accounts", desc: "Manage your subscription and profile." },
  { title: "Interview Tips", icon: "lightbulb", desc: "Best practices to ace your AI interviews." },
  { title: "Technical Support", icon: "construction", desc: "Troubleshooting audio and video issues." },
  { title: "Privacy & Data", icon: "shield_lock", desc: "How we protect and use your data." },
];

export default function HelpCenterPage() {
  return (
    <div className="p-8 pt-28 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-black text-[var(--color-on-surface)] mb-4">
          How can we help you today?
        </h1>
        <p className="text-[var(--color-on-surface-variant)] text-sm md:text-base max-w-2xl mx-auto">
          Browse our topics below or search for specific questions related to your Elevora experience.
        </p>
        
        {/* Search Bar */}
        <div className="mt-8 max-w-xl mx-auto relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">
            search
          </span>
          <input
            type="text"
            placeholder="Search the help center..."
            className="w-full bg-[var(--color-surface-container)] text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] px-12 py-4 rounded-2xl ghost-border outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium"
          />
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {topics.map((t) => (
          <div
            key={t.title}
            className="bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] ghost-border rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-3xl text-[var(--color-primary)]">
              {t.icon}
            </span>
            <div>
              <h3 className="font-headline font-bold text-[var(--color-on-surface)] mb-1">
                {t.title}
              </h3>
              <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                {t.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-headline font-bold mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-[var(--color-secondary)]">question_answer</span>
          Frequently Asked Questions
        </h2>
        
        <div className="flex flex-col gap-4">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group bg-[var(--color-surface-container)] rounded-xl [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between p-5 font-headline font-semibold cursor-pointer list-none text-[var(--color-on-surface)]">
                {item.question}
                <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-[var(--color-primary)]">
                  expand_more
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm text-[var(--color-on-surface-variant)] leading-relaxed border-t border-[var(--color-surface-variant)] pt-4 mt-2">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      <ContactSupportSection />
    </div>
  );
}
