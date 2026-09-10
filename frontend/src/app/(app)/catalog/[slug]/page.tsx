import Link from "next/link";
import { notFound } from "next/navigation";
import RoleInterviewCatalogClient, { CompanySection } from "@/components/RoleInterviewCatalogClient";

interface RoleData {
  title: string;
  color: string;
  icon: string;
  description: string;
  domain: string;
  companies: CompanySection[];
}

const SUPABASE_BASE = "https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos";

// Catalog Database grouped by Companies and their public interviews
const catalogDatabase: Record<string, RoleData> = {
  "senior-software-engineer": {
    title: "Senior Software Engineer",
    color: "var(--color-primary)",
    icon: "code",
    description: "Master system design, complex algorithms, and behavioral leadership scenarios. Watch publicly available mock interviews and authentic candidate experiences from top tech giants.",
    domain: "Engineering",
    companies: [
      {
        name: "Google",
        brand: "bg-[#db4437]/10 text-[#db4437] border-[#db4437]/20",
        interviews: [
          {
            id: "google-honest-experience",
            title: "My HONEST Google Interview Experience | Selected",
            type: "Interview Experience & Strategy",
            duration: "15 mins",
            videoUrl: `${SUPABASE_BASE}/google-honest-interview-experience.mp4`,
            fallbackUrl: "/videos/google-honest-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/google-honest-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/google-honest-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "A complete, authentic breakdown of getting selected at Google: coding rounds, technical interviews, Googliness/behavioral scenarios, and preparation roadmaps.",
            highlights: [
              "Coding Rounds Breakdown & LeetCode Strategy",
              "System Design & Scale Expectations",
              "Googliness & Behavioral Evaluation Criteria",
              "Tips for Cracking Google Hiring Committees"
            ]
          },
          { 
            id: "g1", 
            title: "L5 Distributed Systems Design", 
            type: "System Design", 
            duration: "45 mins",
            description: "Deep dive into architecting resilient global microservices, sharding, and consensus algorithms under high QPS.",
            highlights: ["Distributed Caching", "Data Sharding", "Fault Tolerance"]
          },
          { 
            id: "g2", 
            title: "Advanced Algorithms & Graphs", 
            type: "Coding", 
            duration: "60 mins",
            description: "Complex graph traversal, dynamic programming optimizations, and time/space complexity analysis.",
            highlights: ["Graph Algorithms", "Dynamic Programming", "Edge Case Handling"]
          }
        ]
      },
      {
        name: "Meta",
        brand: "bg-[#0668E1]/10 text-[#0668E1] border-[#0668E1]/20",
        interviews: [
          {
            id: "meta-experience-2025",
            title: "Meta Interview Experience 2025 | Software Engineer",
            type: "Interview Experience & Strategy",
            duration: "14 mins",
            videoUrl: `${SUPABASE_BASE}/meta-interview-experience.mp4`,
            fallbackUrl: "/videos/meta-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/meta-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/meta-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "Full breakdown of Meta's E4/E5 Software Engineering interview loop: Coding speed tests, Product Architecture round, and Behavioral signals.",
            highlights: [
              "Meta Coding Screen Speed & Accuracy Tips",
              "System Design Architecture Expectations",
              "Behavioral & Cross-Functional Collaboration"
            ]
          },
          { id: "m1", title: "E5 Product Architecture", type: "System Design", duration: "45 mins", description: "Design a real-time notification service scaling to billions of daily active users." },
          { id: "m2", title: "React Component Deep Dive", type: "Frontend Engineering", duration: "45 mins", description: "State management architecture and performance profiling in complex React applications." }
        ]
      },
      {
        name: "Amazon",
        brand: "bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20",
        interviews: [
          {
            id: "amazon-sde-experience",
            title: "How I got an SDE Offer from AMAZON | Off-Campus Experience",
            type: "Interview Experience & Strategy",
            duration: "12 mins",
            videoUrl: `${SUPABASE_BASE}/amazon-interview-experience.mp4`,
            fallbackUrl: "/videos/amazon-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/amazon-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/amazon-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "Unfiltered journey to cracking Amazon SDE: OA assessment tricks, live technical rounds, and mastering the 16 Leadership Principles (LPs).",
            highlights: [
              "Amazon Online Assessment (OA) Patterns",
              "Live DSA & Problem Solving Walkthrough",
              "STAR Method for Leadership Principles"
            ]
          },
          { id: "a1", title: "Leadership Principles (LP)", type: "Behavioral", duration: "30 mins", description: "STAR method responses for Customer Obsession, Ownership, and Bias for Action." },
          { id: "a2", title: "Scalable E-Commerce Cart Design", type: "Systems", duration: "60 mins", description: "High-concurrency transactional design with eventual consistency guarantees." }
        ]
      },
      {
        name: "Uber",
        brand: "bg-white/10 text-white border-white/20",
        interviews: [
          {
            id: "uber-swe-experience",
            title: "I Survived the Uber Interview | Here's What Happened",
            type: "Interview Experience & Strategy",
            duration: "16 mins",
            videoUrl: `${SUPABASE_BASE}/uber-interview-experience.mp4`,
            fallbackUrl: "/videos/uber-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/uber-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/uber-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "Raw firsthand experience of Uber's rigorous engineering interview loop: System Design at massive scale, live coding under pressure, and behavioral rounds.",
            highlights: [
              "Uber Live Coding & Data Structures Depth",
              "Real-time Geo-Distributed System Design",
              "Uber Engineering Bar & Cultural Principles"
            ]
          }
        ]
      },
      {
        name: "Stripe",
        brand: "bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20",
        interviews: [
          {
            id: "stripe-sde2-experience",
            title: "Stripe SDE2 Interview Experience | 1 Crore+ CTC Rounds & Prep",
            type: "Interview Experience & Strategy",
            duration: "14 mins",
            videoUrl: `${SUPABASE_BASE}/stripe-interview-experience.mp4`,
            fallbackUrl: "/videos/stripe-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/stripe-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/stripe-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "Complete preparation roadmap for Stripe SDE2: Integration & Bug Hunting rounds, System Architecture, and Practical Coding evaluations.",
            highlights: [
              "Stripe Bug Squash & Code Reading Round",
              "High-Reliability Financial Systems Design",
              "Practical Production Coding Workflows"
            ]
          }
        ]
      },
      {
        name: "Atlassian",
        brand: "bg-[#0052CC]/10 text-[#0052CC] border-[#0052CC]/20",
        interviews: [
          {
            id: "atlassian-remote-experience",
            title: "How I Cracked 80+ LPA Remote Offer | Atlassian Interview Experience",
            type: "Interview Experience & Strategy",
            duration: "12 mins",
            videoUrl: `${SUPABASE_BASE}/atlassian-interview-experience.mp4`,
            fallbackUrl: "/videos/atlassian-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/atlassian-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/atlassian-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "How to ace Atlassian's global remote software engineering interviews: Craft Design round, Code Design, and Values (Play as One Team).",
            highlights: [
              "Atlassian Craft Design & Clean Code Round",
              "System Architecture & API Design",
              "Atlassian 5 Core Values & Behavioral Fit"
            ]
          }
        ]
      },
      {
        name: "Netflix",
        brand: "bg-[#E50914]/10 text-[#E50914] border-[#E50914]/20",
        interviews: [
          {
            id: "netflix-swe-culture",
            title: "2026 Netflix SWE Culture Fit Interview | What They Look For",
            type: "Culture Fit & System Design",
            duration: "10 mins",
            videoUrl: `${SUPABASE_BASE}/netflix-interview-experience.mp4`,
            fallbackUrl: "/videos/netflix-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/netflix-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/netflix-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "An insider look into Netflix's unique engineering culture: High Performance & Freedom and Responsibility memo, senior-only bar, and compensation.",
            highlights: [
              "Context Not Control Principle",
              "Senior Engineering Autonomy & Impact",
              "High-Availability Streaming Architecture"
            ]
          },
          { id: "n1", title: "High-Availability Streaming Arch", type: "System Design", duration: "60 mins", description: "Multi-region CDN caching and adaptive bitrate video delivery architecture." }
        ]
      },
      {
        name: "Apple",
        brand: "bg-white/10 text-white border-white/20",
        interviews: [
          {
            id: "apple-placement-journey",
            title: "How He Cracked Apple | Placement Journey",
            type: "Interview Experience & Strategy",
            duration: "18 mins",
            videoUrl: `${SUPABASE_BASE}/apple-interview-experience.mp4`,
            fallbackUrl: "/videos/apple-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/apple-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/apple-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "Inspiring journey of cracking Apple Software Engineering: deep OS concepts, domain-specific coding, and technical curiosity.",
            highlights: [
              "Low-Level Systems & C/C++ Fundamentals",
              "Apple Team-Matching & Interview Loop",
              "Handling Ambiguous Engineering Problems"
            ]
          },
          { id: "ap1", title: "Core OS Performance Optimization", type: "Low-Level Systems", duration: "45 mins", description: "Memory management, concurrent kernel threading, and latency profiling." },
          { id: "ap2", title: "Privacy-First API Design", type: "Architecture", duration: "45 mins", description: "Cryptographic handshakes and privacy preservation in client-server protocols." }
        ]
      },
      {
        name: "Microsoft",
        brand: "bg-[#00A4EF]/10 text-[#00A4EF] border-[#00A4EF]/20",
        interviews: [
          {
            id: "microsoft-interview-journey",
            title: "Microsoft Interview Experience | My Journey, Tips & Lessons",
            type: "Interview Experience & Strategy",
            duration: "13 mins",
            videoUrl: `${SUPABASE_BASE}/microsoft-interview-experience.mp4`,
            fallbackUrl: "/videos/microsoft-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/microsoft-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/microsoft-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "Step-by-step breakdown of Microsoft's SDE interview rounds: Online Assessment, Technical Screening, As-Appropriate (AA) interview, and culture.",
            highlights: [
              "Microsoft Codility Assessment Tips",
              "Data Structures & Tree/Graph Traversal",
              "As-Appropriate (AA) Partner Director Round"
            ]
          },
          { id: "ms1", title: "Azure Cloud Scalability Architecture", type: "System Design", duration: "60 mins", description: "Enterprise multi-tenant cloud infrastructure and disaster recovery." }
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
        name: "Google",
        brand: "bg-[#db4437]/10 text-[#db4437] border-[#db4437]/20",
        interviews: [
          {
            id: "g-honest-exp-pm",
            title: "My HONEST Google Interview Experience | Selected",
            type: "Interview Experience & Strategy",
            duration: "15 mins",
            videoUrl: `${SUPABASE_BASE}/google-honest-interview-experience.mp4`,
            fallbackUrl: "/videos/google-honest-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/google-honest-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/google-honest-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "Authentic Google interview breakdown covering expectations, questions, culture fit, and scoring strategies.",
            highlights: ["Google Interview Stages", "Behavioral & Cultural Expectations", "Preparation Tips"]
          },
          { id: "gpm1", title: "Design a better alarm clock", type: "Product Sense", duration: "45 mins", description: "User segmentation, pain points prioritization, and product roadmap definition." }
        ]
      },
      {
        name: "Uber",
        brand: "bg-white/10 text-white border-white/20",
        interviews: [
          {
            id: "ub-pm-exp",
            title: "I Survived the Uber Interview | Here's What Happened",
            type: "Interview Experience & Strategy",
            duration: "16 mins",
            videoUrl: `${SUPABASE_BASE}/uber-interview-experience.mp4`,
            fallbackUrl: "/videos/uber-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/uber-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/uber-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "Firsthand look into Uber product, execution, and analytical evaluation standards.",
            highlights: ["Uber Metric Decomposition", "Execution & Strategy", "On-Demand Marketplace Dynamics"]
          },
          { id: "ub1", title: "Uber Eats metrics dropped 15%", type: "Execution", duration: "45 mins", description: "Root-cause diagnostics, metric decomposition, and mitigation action plan." }
        ]
      },
      {
        name: "Stripe",
        brand: "bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20",
        interviews: [
          {
            id: "st-pm-exp",
            title: "Stripe SDE2 Interview Experience | 1 Crore+ CTC Rounds & Prep",
            type: "Interview Experience & Strategy",
            duration: "14 mins",
            videoUrl: `${SUPABASE_BASE}/stripe-interview-experience.mp4`,
            fallbackUrl: "/videos/stripe-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/stripe-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/stripe-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "Deep dive into Stripe's product and engineering rigor.",
            highlights: ["Stripe Product Craft", "Developer-First Philosophy", "Global Payments Strategy"]
          },
          { id: "st1", title: "GTM Strategy for Stripe Billing", type: "Strategy", duration: "60 mins", description: "Pricing models, developer acquisition channels, and partner ecosystem." }
        ]
      },
      {
        name: "Atlassian",
        brand: "bg-[#0052CC]/10 text-[#0052CC] border-[#0052CC]/20",
        interviews: [
          {
            id: "at-pm-exp",
            title: "How I Cracked 80+ LPA Remote Offer | Atlassian Interview Experience",
            type: "Interview Experience & Strategy",
            duration: "12 mins",
            videoUrl: `${SUPABASE_BASE}/atlassian-interview-experience.mp4`,
            fallbackUrl: "/videos/atlassian-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/atlassian-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/atlassian-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "Cracking global remote roles at Atlassian: growth mechanics and collaborative product leadership.",
            highlights: ["Product Growth & Onboarding", "Cross-Functional Collaboration", "Remote Work Culture"]
          },
          { id: "at1", title: "Improving Jira Onboarding", type: "Growth", duration: "30 mins", description: "Activation rate optimization and self-serve user funnel mechanics." }
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
      {
        name: "Stripe",
        brand: "bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20",
        interviews: [
          {
            id: "cto-stripe-exp",
            title: "Stripe SDE2 Interview Experience | 1 Crore+ CTC Rounds & Prep",
            type: "Interview Experience & Strategy",
            duration: "14 mins",
            videoUrl: `${SUPABASE_BASE}/stripe-interview-experience.mp4`,
            fallbackUrl: "/videos/stripe-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/stripe-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/stripe-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "High-level architectural standards and technical leadership at Stripe.",
            highlights: ["Global Financial Infrastructure", "Reliability at 99.999%", "Team Leadership & Bar Raising"]
          },
          { id: "cto1", title: "Global Expansion Architecture", type: "Vision", duration: "60 mins" }
        ]
      }
    ]
  },
  "data-scientist": {
    title: "Data Scientist",
    color: "var(--color-primary-fixed)",
    icon: "science",
    description: "Evaluate your statistical knowledge, machine learning models, and ability to extract insights.",
    domain: "Engineering",
    companies: [
      {
        name: "OpenAI",
        brand: "bg-[#000000]/30 text-white border-white/20",
        interviews: [
          {
            id: "openai-ds-experience",
            title: "OpenAI Interview Experience | $500K+ Compensation, Process & System Design",
            type: "Interview Experience & Strategy",
            duration: "15 mins",
            videoUrl: `${SUPABASE_BASE}/openai-interview-experience.mp4`,
            fallbackUrl: "/videos/openai-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/openai-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/openai-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "Deep dive into OpenAI's elite AI/ML research and engineering hiring loops: LLM alignment, distributed training, and system design.",
            highlights: [
              "OpenAI Applied AI & Research Standards",
              "LLM Fine-Tuning & Alignment Evaluation",
              "Distributed Training Infrastructure & Scale"
            ]
          },
          { id: "ds1", title: "LLM Alignment Strategies", type: "Machine Learning", duration: "60 mins" }
        ]
      },
      {
        name: "Databricks",
        brand: "bg-[#FF3621]/10 text-[#FF3621] border-[#FF3621]/20",
        interviews: [
          {
            id: "databricks-ds-experience",
            title: "Databricks Interview Experience | $600K+ Compensation, System Design & Prep",
            type: "Interview Experience & Strategy",
            duration: "18 mins",
            videoUrl: `${SUPABASE_BASE}/databricks-interview-experience.mp4`,
            fallbackUrl: "/videos/databricks-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/databricks-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/databricks-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "Cracking Databricks for high-comp data science & distributed systems roles: Apache Spark internals, Delta Lake, and query engines.",
            highlights: [
              "Databricks Coding & Concurrency Rigor",
              "Distributed Big Data Architecture",
              "Optimizing Large-Scale Query Engines"
            ]
          },
          { id: "ds2", title: "Distributed Big Data Systems", type: "Architecture", duration: "45 mins" }
        ]
      }
    ]
  },
  "ux-design-lead": {
    title: "UX Design Lead",
    color: "var(--color-secondary)",
    icon: "palette",
    description: "Demonstrate your design thinking, user-centric methodologies, and leadership.",
    domain: "Design",
    companies: [
      {
        name: "Enterprise Design & Consultancies",
        brand: "bg-[#0ACF83]/10 text-[#0ACF83] border-[#0ACF83]/20",
        interviews: [
          {
            id: "uiux-design-experience",
            title: "UI/UX Design Real Interview Questions & Answers | 0-5 Yrs Experience",
            type: "Design Interview Masterclass",
            duration: "20 mins",
            videoUrl: `${SUPABASE_BASE}/ui-ux-design-interview-experience.mp4`,
            fallbackUrl: "/videos/ui-ux-design-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/ui-ux-design-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/ui-ux-design-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "Complete walkthrough of real design interview questions asked at top tech enterprises: Design thinking, wireframing, usability heuristics, and portfolio presentations.",
            highlights: [
              "Design Thinking & User Empathy Frameworks",
              "Portfolio Presentation & Case Study Defense",
              "Design Systems & Usability Heuristics"
            ]
          },
          { id: "ux1", title: "Whiteboarding Collaborative Tools", type: "Design", duration: "60 mins" }
        ]
      },
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
      {
        name: "Goldman Sachs",
        brand: "bg-[#7399C6]/10 text-[#7399C6] border-[#7399C6]/20",
        interviews: [
          {
            id: "goldman-sachs-experience",
            title: "Goldman Sachs Interview Experience | Complete Hiring Process & Total Rounds",
            type: "Interview Experience & Strategy",
            duration: "14 mins",
            videoUrl: `${SUPABASE_BASE}/goldman-sachs-interview-experience.mp4`,
            fallbackUrl: "/videos/goldman-sachs-interview-experience.mp4",
            thumbnailUrl: `${SUPABASE_BASE}/goldman-sachs-interview-experience-thumb.jpg`,
            fallbackThumbnailUrl: "/thumbnails/goldman-sachs-interview-experience-thumb.jpg",
            isFeatured: true,
            description: "Authentic breakdown of Goldman Sachs engineering and analytical hiring loops: Hackerrank assessment, Math/DSA rounds, and Superday partner interviews.",
            highlights: [
              "Goldman Sachs Aptitude & Math/DSA Screens",
              "Systems & Real-Time Financial Engineering",
              "Superday Technical & Executive Fit Rounds"
            ]
          },
          { id: "ia1", title: "LBO Model Walkthrough", type: "Modeling", duration: "90 mins" }
        ]
      }
    ]
  }
};

export default async function RoleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const roleData = catalogDatabase[resolvedParams.slug];

  if (!roleData) {
    notFound();
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 pb-24">
      {/* Header and Back Link */}
      <div>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Catalog
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[var(--color-surface-container)] ghost-border shadow-lg">
              <span className="material-symbols-outlined text-4xl" style={{ color: roleData.color }}>
                {roleData.icon}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest font-label">
                {roleData.domain}
              </span>
              <h1 className="text-4xl md:text-5xl font-headline font-black mt-1 leading-tight text-white">
                {roleData.title}
              </h1>
            </div>
          </div>
        </div>
        <p className="mt-6 text-lg text-[var(--color-on-surface-variant)] max-w-3xl leading-relaxed">
          {roleData.description}
        </p>
      </div>

      <hr className="border-t border-white/5" />

      {/* Interactive Companies & Video Interviews Grid */}
      <RoleInterviewCatalogClient companies={roleData.companies} />
    </div>
  );
}
