import Link from "next/link";
import { notFound } from "next/navigation";

interface Interview {
  id: string;
  title: string;
  type: string;
  duration: string;
}

interface Company {
  name: string;
  brand: string;
  interviews: Interview[];
}

interface RoleData {
  title: string;
  color: string;
  icon: string;
  description: string;
  domain: string;
  companies: Company[];
}

// Mock Database grouped by Companies and their public interviews
const catalogDatabase: Record<string, RoleData> = {
  "senior-software-engineer": {
    title: "Senior Software Engineer",
    color: "var(--color-primary)",
    icon: "code",
    description: "Master system design, complex algorithms, and behavioral leadership scenarios. Watch publicly available mock interviews from top tech giants.",
    domain: "Engineering",
    companies: [
      {
        name: "Google",
        brand: "bg-[#db4437]/10 text-[#db4437] border-[#db4437]/20",
        interviews: [
          { id: "g1", title: "L5 Distributed Systems Design", type: "System Design", duration: "45 mins" },
          { id: "g2", title: "Advanced Algorithms & Graphs", type: "Coding", duration: "60 mins" }
        ]
      },
      {
        name: "Meta",
        brand: "bg-[#0668E1]/10 text-[#0668E1] border-[#0668E1]/20",
        interviews: [
          { id: "m1", title: "E5 Product Architecture", type: "System Design", duration: "45 mins" },
          { id: "m2", title: "React Component Deep Dive", type: "Frontend Engineering", duration: "45 mins" }
        ]
      },
      {
        name: "Amazon",
        brand: "bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20",
        interviews: [
          { id: "a1", title: "Leadership Principles (LP)", type: "Behavioral", duration: "30 mins" },
          { id: "a2", title: "Scalable E-Commerce Cart Design", type: "Systems", duration: "60 mins" }
        ]
      },
      {
        name: "Netflix",
        brand: "bg-[#E50914]/10 text-[#E50914] border-[#E50914]/20",
        interviews: [
          { id: "n1", title: "High-Availability Streaming Arch", type: "System Design", duration: "60 mins" }
        ]
      },
      {
        name: "Apple",
        brand: "bg-white/10 text-white border-white/20",
        interviews: [
          { id: "ap1", title: "Core OS Performance Optimization", type: "Low-Level Systems", duration: "45 mins" },
          { id: "ap2", title: "Privacy-First API Design", type: "Architecture", duration: "45 mins" }
        ]
      },
      {
        name: "Microsoft",
        brand: "bg-[#00A4EF]/10 text-[#00A4EF] border-[#00A4EF]/20",
        interviews: [
          { id: "ms1", title: "Azure Cloud Scalability Architecture", type: "System Design", duration: "60 mins" }
        ]
      }
    ]
  },
  "product-manager": {
    title: "Product Manager",
    color: "var(--color-secondary)",
    icon: "inventory",
    description: "Watch real product sense, analytical, and execution interviews from elite PM organizations.",
    domain: "Product",
    companies: [
      {
        name: "Airbnb",
        brand: "bg-[#FF5A5F]/10 text-[#FF5A5F] border-[#FF5A5F]/20",
        interviews: [
          { id: "ab1", title: "Design an experience for Digital Nomads", type: "Product Sense", duration: "45 mins" }
        ]
      },
      {
        name: "Uber",
        brand: "bg-white/10 text-white border-white/20",
        interviews: [
          { id: "ub1", title: "Uber Eats metrics dropped 15%", type: "Execution", duration: "45 mins" }
        ]
      },
      {
        name: "Stripe",
        brand: "bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20",
        interviews: [
          { id: "st1", title: "GTM Strategy for Stripe Billing", type: "Strategy", duration: "60 mins" }
        ]
      },
      {
        name: "Google",
        brand: "bg-[#db4437]/10 text-[#db4437] border-[#db4437]/20",
        interviews: [
          { id: "gpm1", title: "Design a better alarm clock", type: "Product Sense", duration: "45 mins" }
        ]
      },
      {
        name: "Atlassian",
        brand: "bg-[#0052CC]/10 text-[#0052CC] border-[#0052CC]/20",
        interviews: [
          { id: "at1", title: "Improving Jira Onboarding", type: "Growth", duration: "30 mins" }
        ]
      }
    ]
  },
  "cto-panel": {
    title: "CTO Panel",
    color: "var(--color-tertiary)",
    icon: "corporate_fare",
    description: "High-stakes executive interviews focusing on long-term technology vision and organizational scaling.",
    domain: "Leadership",
    companies: [
      { name: "Stripe", brand: "bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20", interviews: [{ id: "cto1", title: "Global Expansion Architecture", type: "Vision", duration: "60 mins" }] }
    ]
  },
  "data-scientist": {
    title: "Data Scientist",
    color: "var(--color-primary-fixed)",
    icon: "science",
    description: "Evaluate your statistical knowledge, machine learning models, and ability to extract insights.",
    domain: "Engineering",
    companies: [
      { name: "OpenAI", brand: "bg-[#000000]/30 text-white border-white/20", interviews: [{ id: "ds1", title: "LLM Alignment Strategies", type: "Machine Learning", duration: "60 mins" }] },
      { name: "Databricks", brand: "bg-[#FF3621]/10 text-[#FF3621] border-[#FF3621]/20", interviews: [{ id: "ds2", title: "Distributed Big Data Systems", type: "Architecture", duration: "45 mins" }] }
    ]
  },
  "ux-design-lead": {
    title: "UX Design Lead",
    color: "var(--color-secondary)",
    icon: "palette",
    description: "Demonstrate your design thinking, user-centric methodologies, and leadership.",
    domain: "Design",
    companies: [
      { name: "Figma", brand: "bg-[#0ACF83]/10 text-[#0ACF83] border-[#0ACF83]/20", interviews: [{ id: "ux1", title: "Whiteboarding Collaborative Tools", type: "Design", duration: "60 mins" }] },
      { name: "Apple", brand: "bg-white/10 text-white border-white/20", interviews: [{ id: "ux2", title: "App Critique & Micro-interactions", type: "Critique", duration: "45 mins" }] }
    ]
  },
  "vp-of-engineering": {
    title: "VP of Engineering",
    color: "var(--color-primary)",
    icon: "engineering",
    description: "Executive technical leadership focusing on budget, team scaling, and strategy.",
    domain: "Leadership",
    companies: [
      { name: "Snowflake", brand: "bg-[#29B5E8]/10 text-[#29B5E8] border-[#29B5E8]/20", interviews: [{ id: "vp1", title: "Aligning Tech Debt with Board Meetings", type: "Strategy", duration: "45 mins" }] }
    ]
  },
  "investment-analyst": {
    title: "Investment Analyst",
    color: "var(--color-primary)",
    icon: "payments",
    description: "Test your financial modeling, market analysis, and valuation skills.",
    domain: "Finance",
    companies: [
      { name: "Goldman Sachs", brand: "bg-[#7399C6]/10 text-[#7399C6] border-[#7399C6]/20", interviews: [{ id: "ia1", title: "LBO Model Walkthrough", type: "Modeling", duration: "90 mins" }] }
    ]
  }
};

export default async function RoleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const roleData = catalogDatabase[resolvedParams.slug];

  if (!roleData) {
    // If we don't have mock data for a specific role yet, show a graceful fallback or notFound
    notFound();
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 pb-24">
      
      {/* Header and Back Link */}
      <div>
        <Link href="/catalog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors mb-6">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Catalog
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[var(--color-surface-container)] ghost-border shadow-lg">
              <span className="material-symbols-outlined text-4xl" style={{ color: roleData.color }}>{roleData.icon}</span>
            </div>
            <div>
              <span className="text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest">{roleData.domain}</span>
              <h1 className="text-4xl md:text-5xl font-headline font-black mt-1 leading-tight">{roleData.title}</h1>
            </div>
          </div>
        </div>
        <p className="mt-6 text-lg text-[var(--color-on-surface-variant)] max-w-3xl leading-relaxed">
          {roleData.description}
        </p>
      </div>

      <hr className="border-t border-white/5" />

      {/* Companies & Video Interviews Grid */}
      <div className="space-y-16">
        {roleData.companies.map((company: Company) => (
          <section key={company.name} className="relative">
            {/* Company Section Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border shadow-[0_0_15px_rgba(255,255,255,0.05)] ${company.brand}`}>
                {company.name.charAt(0)}
              </div>
              <h2 className="text-3xl font-headline font-bold text-white">{company.name} Interviews</h2>
            </div>
            
            {/* Interviews Video Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {company.interviews.map((interview: Interview) => (
                <div key={interview.id} className="group flex flex-col bg-[var(--color-surface-container-low)] ghost-border rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-400">
                  
                  {/* Video Thumbnail Placeholder (User will connect DB logic here later) */}
                  <div className="aspect-video bg-black relative flex items-center justify-center border-b border-white/5 group-hover:border-[var(--color-primary)]/50 transition-colors">
                    <span className="material-symbols-outlined text-5xl text-white/20 group-hover:text-[var(--color-primary)] group-hover:scale-110 transition-all duration-500">
                      play_circle
                    </span>
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm text-white">
                      {interview.duration}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2 inline-block">
                      {interview.type}
                    </span>
                    <h3 className="font-headline font-bold text-lg leading-snug mb-6 text-white group-hover:text-[var(--color-primary)] transition-colors">
                      {interview.title}
                    </h3>

                    <div className="mt-auto">
                       <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-[var(--color-surface-container-high)] border border-white/5 text-[var(--color-on-surface)] group-hover:bg-[var(--color-primary)] group-hover:text-[#390050] group-hover:border-[var(--color-primary)] transition-all flex items-center justify-center gap-2">
                         <span className="material-symbols-outlined text-sm">smart_display</span>
                         Watch Public Interview
                       </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

    </div>
  );
}
