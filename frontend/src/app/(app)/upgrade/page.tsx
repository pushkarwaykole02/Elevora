import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Upgrade to Elite",
  description: "Unlock your full potential with Elevora Elite.",
};

const plans = [
  {
    name: "Base Analyst",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started and preparing for your first interviews.",
    features: [
      "5 AI Mock Interviews per month",
      "Standard Skill Map",
      "Basic Session History",
      "Community Support",
    ],
    buttonText: "Current Plan",
    isPopular: false,
    color: "var(--color-surface-variant)",
    buttonColor: "var(--color-surface-container-highest)",
    textColor: "var(--color-on-surface)",
  },
  {
    name: "Elite",
    price: "$29",
    period: "per month",
    description: "For serious professionals aiming for top-tier roles.",
    features: [
      "Unlimited AI Mock Interviews",
      "Advanced Predictive Analytics",
      "Line-by-line Resume Parsing",
      "Priority Elite Support",
      "Custom Interview Scenarios",
    ],
    buttonText: "Upgrade Now",
    isPopular: true,
    color: "var(--color-primary)",
    buttonColor: "var(--color-primary)",
    textColor: "var(--color-on-primary)",
  },
];

export default function UpgradePage() {
  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col items-center min-h-[85vh] justify-center">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-headline font-black text-[var(--color-on-surface)] mb-4">
          Accelerate your career.
        </h1>
        <p className="text-[var(--color-on-surface-variant)] max-w-xl mx-auto">
          Choose the plan that fits your ambition. Elevora Elite gives you the ultimate edge in your tech interviews.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative p-8 rounded-3xl flex flex-col transition-all duration-300 ${
              plan.isPopular
                ? "bg-gradient-to-b from-[var(--color-surface-container)] to-[var(--color-surface-container-lowest)] shadow-[0_0_40px_rgba(0,241,254,0.15)] border-2 border-[var(--color-primary)] scale-105 z-10"
                : "bg-[var(--color-surface-container-low)] ghost-border hover:bg-[var(--color-surface-container)] opacity-90 hover:opacity-100 mt-4 mb-4"
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-[var(--color-on-primary)] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-headline font-semibold mb-2">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-5xl font-headline font-black" style={{ color: plan.isPopular ? "var(--color-primary)" : "var(--color-on-surface)" }}>
                  {plan.price}
                </span>
                <span className="text-[var(--color-on-surface-variant)] text-sm mb-2">/{plan.period}</span>
              </div>
              <p className="text-sm text-[var(--color-on-surface-variant)] min-h-[40px]">
                {plan.description}
              </p>
            </div>

            <div className="flex-1">
              <ul className="space-y-4 mb-8 text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span 
                      className="material-symbols-outlined text-[20px]" 
                      style={{ color: plan.isPopular ? "var(--color-primary)" : "var(--color-on-surface-variant)" }}
                    >
                      check_circle
                    </span>
                    <span className={plan.isPopular ? "text-[var(--color-on-surface)]" : "text-[var(--color-on-surface-variant)]"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`w-full py-4 rounded-xl font-bold font-headline transition-all active:scale-95 flex items-center justify-center gap-2 ${
                plan.isPopular ? "hover:shadow-[0_0_20px_rgba(0,241,254,0.4)]" : "hover:opacity-100"
              }`}
              style={{
                backgroundColor: plan.buttonColor,
                color: plan.textColor,
                opacity: plan.isPopular ? 1 : 0.7,
              }}
            >
              {plan.buttonText}
              {plan.isPopular && <span className="material-symbols-outlined text-[18px]">bolt</span>}
            </button>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="mt-16 text-center text-[var(--color-on-surface-variant)] flex flex-col items-center">
        <span className="material-symbols-outlined text-4xl mb-4 opacity-50">verified_user</span>
        <p className="text-xs uppercase tracking-widest max-w-md">
          Secure payment. Cancel anytime. <br className="hidden md:block"/> 
          Used by candidates landing roles at Top Tech Companies.
        </p>
      </div>
    </div>
  );
}
