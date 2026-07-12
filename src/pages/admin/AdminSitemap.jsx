import React, { useState, useMemo } from "react";
import { Network, AlertTriangle, Search, Layout as LayoutIcon, Lock, Shield, FileCode, Globe } from "lucide-react";
import Seo from "@/components/seo/Seo";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { trackEvent } from "@/lib/analytics";
import { sitemapTree, brokenNavLinks, typeStyles, countPages } from "@/lib/sitemapData";
import SitemapNode from "@/components/admin/SitemapNode";

const typeFilters = [
  { value: "all", label: "All", icon: Network },
  { value: "public", label: "Public", icon: Globe },
  { value: "auth", label: "Auth Required", icon: Lock },
  { value: "admin", label: "Admin Only", icon: Shield },
  { value: "dynamic", label: "Dynamic", icon: FileCode },
];

function filterTree(nodes, query, typeFilter) {
  const result = [];
  for (const node of nodes) {
    const matchesQuery =
      !query ||
      node.label?.toLowerCase().includes(query.toLowerCase()) ||
      node.path?.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === "all" || node.type === typeFilter;

    if (node.type === "layout" && node.children) {
      const filteredChildren = filterTree(node.children, query, typeFilter);
      if (filteredChildren.length > 0) {
        result.push({ ...node, children: filteredChildren });
      }
    } else if (matchesQuery && matchesType) {
      result.push(node);
    }
  }
  return result;
}

export default function AdminSitemap() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  React.useEffect(() => {
    trackEvent("view_admin_sitemap", { page_path: "/admin/sitemap" });
  }, []);

  const stats = useMemo(() => countPages(), []);
  const filteredTree = useMemo(() => filterTree(sitemapTree, query, typeFilter), [query, typeFilter]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <Seo title="Visual Sitemap — Admin | KodeBase" path="/admin/sitemap" noindex />

      <PageHeader
        title="Visual Sitemap"
        description="Complete overview of every page, route hierarchy, and navigation linkage."
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={Network} label="Total Pages" value={stats.total} />
        <StatCard icon={Globe} label="Public" value={stats.publicCount} />
        <StatCard icon={Lock} label="Auth Required" value={stats.authCount} />
        <StatCard icon={Shield} label="Admin Only" value={stats.adminCount} />
        <StatCard icon={FileCode} label="Dynamic Routes" value={stats.dynamicCount} />
      </div>

      {brokenNavLinks.length > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="font-sora font-bold text-sm text-rose-300">Broken Nav Links — Linked but No Route Exists</h3>
          </div>
          <div className="space-y-2">
            {brokenNavLinks.map((link, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm bg-rose-500/5 border border-rose-500/20 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="min-w-0">
                  <span className="font-medium text-foreground">{link.label}</span>
                  <code className="ml-2 text-xs text-muted-foreground font-mono">{link.path}</code>
                  <span className="block text-xs text-muted-foreground mt-0.5">Linked from: {link.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages or routes..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <f.icon className="w-3.5 h-3.5" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/40 p-4 space-y-1">
        {filteredTree.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No pages match your search.
          </div>
        ) : (
          filteredTree.map((node, idx) => (
            <SitemapNode key={idx} node={node} />
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        {Object.entries(typeStyles).map(([key, style]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
            <span className="text-xs text-muted-foreground">{style.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}