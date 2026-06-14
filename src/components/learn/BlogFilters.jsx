import React from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

// Search box + category chips + tag chips for the blog index.
export default function BlogFilters({
  search,
  onSearch,
  categories = [],
  tags = [],
  activeCategory,
  activeTag,
  onCategory,
  onTag,
}) {
  return (
    <div className="mb-10 space-y-5">
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search articles..."
          className="pl-10 bg-secondary border-border h-11"
        />
        {search && (
          <button
            onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => onCategory(null)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !activeCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <Link
              key={c}
              to={`/learn/blog/category/${encodeURIComponent(c.toLowerCase().replace(/\s+/g, "-"))}`}
              onClick={(e) => {
                e.preventDefault();
                onCategory(c);
              }}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {tags.slice(0, 16).map((t) => (
            <button
              key={t}
              onClick={() => onTag(activeTag === t ? null : t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeTag === t ? "bg-primary/20 text-primary border border-primary/40" : "bg-card/70 border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}