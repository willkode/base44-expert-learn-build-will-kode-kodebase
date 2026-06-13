import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Search, Loader2, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { clearOverrideCache } from "@/lib/seoOverrides";

// Public-facing routes admins can tune. Defaults live in each page's <Seo>;
// these overrides win when set.
const PAGES = [
  { path: "/", label: "Home" },
  { path: "/features", label: "Features" },
  { path: "/pricing", label: "Pricing" },
  { path: "/products", label: "Products" },
  { path: "/contact", label: "Contact" },
  { path: "/learn/blog", label: "Blog" },
  { path: "/learn/prompt-library", label: "Prompt Library" },
  { path: "/learn/videos", label: "Videos" },
  { path: "/learn/superagent", label: "SuperAgent" },
  { path: "/learn/llm-guide", label: "LLM Guide" },
  { path: "/learn/agent-skills", label: "Agent Skills" },
];

const blank = (path, label) => ({
  path,
  pageLabel: label,
  title: "",
  description: "",
  ogImage: "",
  noindex: false,
  enabled: true,
});

export default function SeoSettingsManager() {
  const [rows, setRows] = useState({});
  const [recordIds, setRecordIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingPath, setSavingPath] = useState(null);

  useEffect(() => {
    base44.entities.SeoSetting.list("-created_date", 200).then((existing) => {
      const byPath = {};
      const ids = {};
      existing.forEach((r) => {
        if (r.path && !byPath[r.path]) { byPath[r.path] = r; ids[r.path] = r.id; }
      });
      const merged = {};
      PAGES.forEach((p) => {
        merged[p.path] = byPath[p.path]
          ? { ...blank(p.path, p.label), ...byPath[p.path] }
          : blank(p.path, p.label);
      });
      setRows(merged);
      setRecordIds(ids);
      setLoading(false);
    });
  }, []);

  const set = (path, k, v) =>
    setRows((r) => ({ ...r, [path]: { ...r[path], [k]: v } }));

  const save = async (path) => {
    setSavingPath(path);
    const data = { ...rows[path] };
    delete data.id;
    if (recordIds[path]) {
      await base44.entities.SeoSetting.update(recordIds[path], data);
    } else {
      const created = await base44.entities.SeoSetting.create(data);
      setRecordIds((ids) => ({ ...ids, [path]: created.id }));
    }
    clearOverrideCache();
    setSavingPath(null);
    toast.success(`SEO saved for ${rows[path].pageLabel}`);
  };

  const reset = async (path) => {
    const id = recordIds[path];
    const label = rows[path].pageLabel;
    setSavingPath(path);
    if (id) await base44.entities.SeoSetting.delete(id);
    setRecordIds((ids) => { const n = { ...ids }; delete n[path]; return n; });
    setRows((r) => ({ ...r, [path]: blank(path, label) }));
    clearOverrideCache();
    setSavingPath(null);
    toast.success(`Reset ${label} to page defaults`);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card/60 p-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading SEO settings...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-4.5 h-4.5 text-primary" />
        <h3 className="font-sora font-semibold">Per-page SEO</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Override the title, meta description, and social share image for each public page.
        Leave a field blank to keep that page's built-in default.
      </p>

      <div className="space-y-3">
        {PAGES.map((p) => {
          const row = rows[p.path];
          const isSaving = savingPath === p.path;
          const hasOverride = !!recordIds[p.path];
          return (
            <details key={p.path} className="group rounded-xl border border-border bg-background/40">
              <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-4">
                <div className="min-w-0">
                  <span className="font-medium text-sm">{p.label}</span>
                  <code className="block text-xs text-muted-foreground truncate">{p.path}</code>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {hasOverride && (
                    <span className="text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 bg-primary/15 text-primary">
                      Custom
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground group-open:hidden">Edit</span>
                </div>
              </summary>

              <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                <div>
                  <Label className="mb-1.5 block text-sm">Title</Label>
                  <Input
                    value={row.title}
                    onChange={(e) => set(p.path, "title", e.target.value)}
                    placeholder="Page default title"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">{(row.title || "").length} chars · aim for 50–60</p>
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm">Meta description</Label>
                  <Textarea
                    value={row.description}
                    onChange={(e) => set(p.path, "description", e.target.value)}
                    placeholder="Page default description"
                    rows={3}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">{(row.description || "").length} chars · aim for 140–160</p>
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm">Social share image (og:image) URL</Label>
                  <Input
                    value={row.ogImage}
                    onChange={(e) => set(p.path, "ogImage", e.target.value)}
                    placeholder="https://... (1200×630 recommended)"
                  />
                  {row.ogImage && (
                    <img src={row.ogImage} alt="OG preview" className="mt-2 rounded-lg border border-border max-h-28 object-cover" />
                  )}
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <Label className="text-sm">Hide from search engines</Label>
                    <p className="text-xs text-muted-foreground">Adds noindex — use for thin or private pages.</p>
                  </div>
                  <Switch checked={!!row.noindex} onCheckedChange={(v) => set(p.path, "noindex", v)} />
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => save(p.path)} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </Button>
                  {hasOverride && (
                    <Button size="sm" variant="outline" onClick={() => reset(p.path)} disabled={isSaving}>
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset to default
                    </Button>
                  )}
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}