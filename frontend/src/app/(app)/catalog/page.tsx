"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { useState } from "react";

// metadata cannot be exported in a client component, removing or restructuring if needed.
// if asked, we can use a server component wrapper, but for simplicity here we just use client.

const categories = ["All", "Engineering", "Product", "Leadership", "Finance", "Design"];

const catalog = [
  { role: "Senior Software Engineer", company: "FAANG-style",    diff: "Director", sessions: 1240, icon: "code",        color: "var(--color-primary)",  category: "Engineering" },
  { role: "Product Manager",          company: "Startup",        diff: "Senior",   sessions: 890,  icon: "inventory",   color: "var(--color-secondary)", category: "Product" },
  { role: "CTO Panel",                company: "Enterprise",     diff: "Director", sessions: 340,  icon: "corporate_fare", color: "var(--color-tertiary)", category: "Leadership" },
  { role: "Data Scientist",           company: "Research Lab",   diff: "Senior",   sessions: 670,  icon: "science",     color: "var(--color-primary-fixed)", category: "Engineering" },
  { role: "UX Design Lead",           company: "Agency",         diff: "Senior",   sessions: 450,  icon: "palette",     color: "var(--color-secondary)", category: "Design" },
  { role: "VP of Engineering",        company: "Scale-up",       diff: "Director", sessions: 210,  icon: "engineering", color: "var(--color-primary)", category: "Leadership" },
  { role: "Investment Analyst",       company: "Hedge Fund",     diff: "Mid-Level", sessions: 110, icon: "payments",    color: "var(--color-primary)", category: "Finance" },
];

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredCatalog = catalog.filter((item) => 
    activeCategory === "All" ? true : item.category === activeCategory
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-label text-[var(--color-on-surface-variant)] mb-1">Browse</p>
        <h1 className="text-4xl font-headline font-black">Interview Catalog</h1>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] text-xl">
            search
          </span>
          <input
            id="catalog-search"
            type="search"
            placeholder="Search roles, companies, skills..."
            className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface-container-low)] ghost-border rounded-xl text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`catalog-filter-${cat.toLowerCase()}`}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-headline font-medium transition-all ${
              activeCategory === cat
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
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
          <div className="col-span-full py-12 text-center text-[var(--color-on-surface-variant)] text-sm">
            No mock interviews found for {activeCategory}.
          </div>
        ) : (
          filteredCatalog.map((item) => {
            const slug = item.role.toLowerCase().replace(/\s+/g, "-");
            return (
            <Link
              href={`/catalog/${slug}`}
              key={item.role}
              className="group bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-400 cursor-pointer block"
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className="material-symbols-outlined text-3xl"
                  style={{ color: item.color }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[10px] font-label px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${item.color} 15%, transparent)`,
                    color: item.color,
                  }}
                >
                  {item.diff}
                </span>
              </div>
              <h3 className="font-headline font-bold text-lg mb-1 text-[var(--color-on-surface)]">
                {item.role}
              </h3>
              <p className="text-xs text-[var(--color-on-surface-variant)] mb-4">{item.company}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-label text-[var(--color-on-surface-variant)]">
                  {item.sessions.toLocaleString()} sessions completed
                </span>
                <span className="text-xs font-headline font-bold text-[var(--color-primary)] opacity-0 group-hover:opacity-100 group-hover:underline transition-opacity">
                  View Details →
                </span>
              </div>
            </Link>
          )})
        )}
      </div>
    </div>
  );
}
