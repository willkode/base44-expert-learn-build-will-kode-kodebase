import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Cog, Save } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const TOGGLES = [
  { key: "blogEnabled", label: "Blog enabled", hint: "Show the public blog." },
  { key: "requireApprovalBeforePublish", label: "Require approval before publish", hint: "Posts must be approved before going live." },
  { key: "enableAiGeneration", label: "AI generation", hint: "Allow AI to draft blog posts." },
  { key: "enableAiImageGeneration", label: "AI featured images", hint: "Auto-generate featured images." },
  { key: "enableAutoPublishing", label: "Auto-publishing", hint: "Publish scheduled posts automatically." },
  { key: "enableSeoScoring", label: "SEO scoring", hint: "Score posts for SEO quality." },
  { key: "enableInternalLinking", label: "Internal linking", hint: "Suggest internal links between posts." },
  { key: "enableContentRefreshRecommendations", label: "Content refresh recommendations", hint: "Flag posts that need updates." },
  { key: "showAuthorBox", label: "Show author box", hint: "Display author info on posts." },
  { key: "showRelatedPosts", label: "Show related posts", hint: "Display related posts in the sidebar." },
  { key: "showTableOfContents", label: "Show table of contents", hint: "Render a TOC on long posts." },
];

export default function BlogSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.BlogSettings.filter({ key: "global" }, "-created_date", 1).then((rows) => {
      setSettings(rows[0] || { key: "global" });
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    const { id, created_date, updated_date, created_by_id, created_by, ...data } = settings;
    if (id) {
      await base44.entities.BlogSettings.update(id, data);
    } else {
      const created = await base44.entities.BlogSettings.create({ ...data, key: "global" });
      setSettings(created);
    }
    setSaving(false);
    toast.success("Blog settings saved");
  };

  if (loading) return <LoadingState label="Loading blog settings..." />;

  return (
    <div>
      <PageHeader
        title="Blog Settings"
        description="Configure authors, SEO defaults, approval, publishing, and public blog behavior."
        actions={
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
          </Button>
        }
      />

      <div className="space-y-6 max-w-3xl">
        <section className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
          <h2 className="font-sora font-semibold text-base flex items-center gap-2"><Cog className="w-4 h-4 text-primary" /> General</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Blog name</Label>
              <Input value={settings.blogName || ""} onChange={(e) => set("blogName", e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Default author name</Label>
              <Input value={settings.defaultAuthorName || ""} onChange={(e) => set("defaultAuthorName", e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Blog description</Label>
            <Textarea value={settings.blogDescription || ""} onChange={(e) => set("blogDescription", e.target.value)} className="h-20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Meta title template</Label>
              <Input value={settings.defaultMetaTitleTemplate || ""} onChange={(e) => set("defaultMetaTitleTemplate", e.target.value)} placeholder="{{title}} | KodeBase" />
            </div>
            <div>
              <Label className="mb-1.5 block">Posts per page</Label>
              <Input type="number" value={settings.postsPerPage ?? 12} onChange={(e) => set("postsPerPage", Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Featured image style</Label>
            <Textarea value={settings.defaultFeaturedImageStyle || ""} onChange={(e) => set("defaultFeaturedImageStyle", e.target.value)} className="h-20" />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card/60 p-6 space-y-3">
          <h2 className="font-sora font-semibold text-base mb-2">Behavior</h2>
          {TOGGLES.map(({ key, label, hint }) => (
            <div key={key} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label>{label}</Label>
                <p className="text-xs text-muted-foreground">{hint}</p>
              </div>
              <Switch checked={!!settings[key]} onCheckedChange={(v) => set(key, v)} />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}