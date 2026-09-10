"use client";

import Link from "next/link";
import { useState } from "react";

const categories = ["All", "Engineering", "Product", "Leadership", "Finance", "Design"];

interface CatalogItem {
  role: string;
  company: string;
  diff: string;
  sessions: number;
  icon: string;
  color: string;
  category: string;
  companies: string[];
}

const catalog: CatalogItem[] = [
  { 
    role: "Senior Software Engineer", 
    company: "FAANG-style",    
    diff: "Director", 
    sessions: 1240, 
    icon: "code",        
    color: "var(--color-primary)",  
    category: "Engineering",
    companies: ["Google", "Meta", "Amazon", "Uber", "Stripe", "Atlassian", "Netflix", "Apple", "Microsoft"]
  },
  { 
    role: "Product Manager",          
    company: "Startup",        
    diff: "Senior",   
    sessions: 890,  
    icon: "inventory",   
    color: "var(--color-secondary)", 
    category: "Product",
    companies: ["Google", "Uber", "Stripe", "Atlassian"]
  },
  { 
    role: "CTO Panel",                
    company: "Enterprise",     
    diff: "Director", 
    sessions: 340,  
    icon: "corporate_fare", 
    color: "var(--color-tertiary)", 
    category: "Leadership",
    companies: ["Stripe", "Enterprise"]
  },
  { 
    role: "Data Scientist",           
    company: "Research Lab",   
    diff: "Senior",   
    sessions: 670,  
    icon: "science",     
    color: "var(--color-primary-fixed)", 
    category: "Engineering",
    companies: ["OpenAI", "Databricks", "Google"]
  },
  { 
    role: "UX Design Lead",           
    company: "Agency",         
    diff: "Senior",   
    sessions: 450,  
    icon: "palette",     
    color: "var(--color-secondary)", 
    category: "Design",
    companies: ["Figma", "Apple", "Google"]
  },
  { 
    role: "VP of Engineering",        
    company: "Scale-up",       
    diff: "Director", 
    sessions: 210,  
    icon: "engineering", 
    color: "var(--color-primary)", 
    category: "Leadership",
    companies: ["Snowflake", "Scale-up"]
  },
  { 
    role: "Investment Analyst",       
    company: "Hedge Fund",     
    diff: "Mid-Level", 
    sessions: 110, 
    icon: "payments",    
    color: "var(--color-primary)", 
    category: "Finance",
    companies: ["Goldman Sachs", "Hedge Fund"]
  },
];

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCatalog = catalog.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesSearch =
      item.role.toLowerCase().includes(query) ||
      item.company.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.companies.some((c) => c.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-label text-[var(--color-on-surface-variant)] mb-1">Browse</p>
        <h1 className="text-4xl font-headline font-black text-white">Interview Catalog</h1>
        <p className="text-sm text-[var(--color-on-surface-variant)] mt-2">
          Explore real public interview recordings, technical breakdowns, and candidate experiences from top tech companies.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] text-xl">
            search
          </span>
          <input
            id="catalog-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles, companies (e.g. Google, Meta, Stripe)..."
            className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface-container-low)] ghost-border rounded-xl text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary)] transition-colors text-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`catalog-filter-${cat.toLowerCase()}`}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-headline font-medium transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-[var(--color-primary)] text-[#004145] font-bold shadow-[0_0_20px_rgba(153,247,255,0.3)]"
                : "bg-[var(--color-surface-container)] ghost-border text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCatalog.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[var(--color-on-surface-variant)] text-sm bg-[var(--color-surface-container-low)] rounded-2xl border border-white/5">
            <span className="material-symbols-outlined text-4xl mb-2 block text-zinc-600">search_off</span>
            No mock interviews found for &ldquo;{searchQuery || activeCategory}&rdquo;.
          </div>
        ) : (
          filteredCatalog.map((item) => {
            const slug = item.role.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link
                href={`/catalog/${slug}`}
                key={item.role}
                className="group bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-400 cursor-pointer flex flex-col border hover:border-[var(--color-primary)]/40"
              >
                <div className="flex items-start justify-between mb-4">
                  <span
                    className="material-symbols-outlined text-3xl"
                    style={{ color: item.color }}
                  >
                    {item.icon}
                  </span>
                  <span
                    className="text-[10px] font-label px-2 py-1 rounded-full font-bold"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${item.color} 15%, transparent)`,
                      color: item.color,
                    }}
                  >
                    {item.diff}
                  </span>
                </div>

                <h3 className="font-headline font-bold text-lg mb-1 text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
                  {item.role}
                </h3>
                <p className="text-xs text-[var(--color-on-surface-variant)] mb-3">{item.company}</p>

                {/* Company Badges */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {item.companies.slice(0, 4).map((c) => (
                    <span
                      key={c}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                        c === "Google"
                          ? "bg-[#db4437]/15 text-[#ff796c] border border-[#db4437]/30 font-bold"
                          : "bg-white/5 text-zinc-400 border border-white/5"
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                  {item.companies.length > 4 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-zinc-500 font-mono">
                      +{item.companies.length - 4}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                  <span className="text-xs font-label text-[var(--color-on-surface-variant)]">
                    {item.sessions.toLocaleString()} sessions
                  </span>
                  <span className="text-xs font-headline font-bold text-[var(--color-primary)] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    View Catalog →
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
