import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CATEGORY_ORDER } from "./base44HubData";

export default function HubSidebar({ sections, query, onQuery, activeSlug, onSelect }) {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? sections.filter(
        (s) => s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q)
      )
    : sections;

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: filtered.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search the cheat sheets..."
          className="pl-9 bg-card"
        />
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground px-1">No topics match "{query}".</p>
      )}
      <nav className="space-y-5">
        {grouped.map(({ cat, items }) => (
          <div key={cat}>
            <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1.5 px-1">
              {cat}
            </p>
            <ul className="space-y-0.5">
              {items.map((s) => (
                <li key={s.slug}>
                  <button
                    onClick={() => onSelect(s)}
                    className={`w-full text-left text-sm rounded-lg px-3 py-1.5 transition-colors ${
                      activeSlug === s.slug
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}