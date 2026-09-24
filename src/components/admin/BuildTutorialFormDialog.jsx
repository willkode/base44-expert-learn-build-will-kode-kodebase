import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Sparkles, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DIFFICULTIES, slugify, sourceNameFromUrl } from "@/lib/buildGuides";

const EMPTY = {
  title: "", slug: "", url: "", category: "", languages: "", sourceName: "",
  description: "", difficulty: "", timeEstimate: "", writeup: "",
  isVideo: false, featured: false, published: true,
};

const NO_DIFFICULTY = "none";

export default function BuildTutorialFormDialog({ open, onOpenChange, tutorial, categories = [], onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setForm(tutorial
      ? { ...EMPTY, ...tutorial, languages: (tutorial.languages || []).join(", ") }
      : EMPTY);
  }, [tutorial, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (form.writeup && !confirm("Replace the current summary and write-up with a new AI draft?")) return;
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateBuildGuideWriteup", { id: tutorial.id, overwrite: true });
      const g = res.data?.guide;
      if (!g) throw new Error(res.data?.error || "No write-up returned");
      setForm((f) => ({ ...f, description: g.description || "", difficulty: g.difficulty || "", timeEstimate: g.timeEstimate || "", writeup: g.writeup || "" }));
      toast.success("Write-up generated and saved");
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Generation failed");
    }
    setGenerating(false);
  };

  const save = async () => {
    const title = form.title.trim();
    const url = form.url.trim();
    const category = form.category.trim() || "Uncategorized";
    const slug = slugify(form.slug || title);
    if (!title) return toast.error("Title is required");
    if (!/^https?:\/\//i.test(url)) return toast.error("Link must start with http:// or https://");
    if (!slug) return toast.error("Slug must contain letters or numbers");

    setSaving(true);
    try {
      const others = (rows) => rows.filter((t) => t.id !== tutorial?.id);
      const [urlDupes, slugDupes] = await Promise.all([
        base44.entities.BuildTutorial.filter({ url }).then(others),
        base44.entities.BuildTutorial.filter({ slug }).then(others),
      ]);
      if (urlDupes.length > 0) {
        setSaving(false);
        return toast.error(`That link is already listed as "${urlDupes[0].title}"`);
      }
      if (slugDupes.length > 0) {
        setSaving(false);
        return toast.error(`Slug "${slug}" is already used by "${slugDupes[0].title}"`);
      }
      const data = {
        title,
        slug,
        url,
        category,
        languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean),
        sourceName: form.sourceName.trim() || sourceNameFromUrl(url),
        description: form.description.trim(),
        difficulty: form.difficulty || "",
        timeEstimate: form.timeEstimate.trim(),
        writeup: form.writeup,
        isVideo: !!form.isVideo,
        featured: !!form.featured,
        published: !!form.published,
      };
      if (tutorial?.id) await base44.entities.BuildTutorial.update(tutorial.id, data);
      else await base44.entities.BuildTutorial.create({ ...data, source: "manual" });
      toast.success(tutorial ? "Guide updated" : "Guide added");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.message || "Failed to save guide");
    }
    setSaving(false);
  };

  const busy = saving || generating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tutorial ? "Edit guide" : "Add guide"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Title</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Write your own Git in Python" />
            </div>
            <div>
              <Label className="mb-1.5 block">URL slug</Label>
              <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder={slugify(form.title) || "auto from title"} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Original guide link</Label>
              <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label className="mb-1.5 block">Credit to <span className="text-muted-foreground">(original author/site)</span></Label>
              <Input value={form.sourceName} onChange={(e) => set("sourceName", e.target.value)} placeholder={sourceNameFromUrl(form.url) || "e.g. Jane Doe"} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Category</Label>
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Database" list="build-tutorial-categories" />
              <datalist id="build-tutorial-categories">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <Label className="mb-1.5 block">Languages <span className="text-muted-foreground">(comma separated)</span></Label>
              <Input value={form.languages} onChange={(e) => set("languages", e.target.value)} placeholder="Python, Rust" />
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-sora font-semibold text-sm">KodeBase breakdown</p>
                <p className="text-xs text-muted-foreground">Original write-up shown on the guide page. Markdown supported.</p>
              </div>
              {tutorial?.id ? (
                <Button type="button" variant="outline" size="sm" onClick={generate} disabled={busy} className="gap-2 shrink-0">
                  {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? "Writing..." : form.writeup ? "Regenerate with AI" : "Generate with AI"}
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Save first to generate with AI</span>
              )}
            </div>
            <div>
              <Label className="mb-1.5 block">Summary <span className="text-muted-foreground">(cards + top of page)</span></Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="h-16" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Difficulty</Label>
                <Select value={form.difficulty || NO_DIFFICULTY} onValueChange={(v) => set("difficulty", v === NO_DIFFICULTY ? "" : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_DIFFICULTY}>Not set</SelectItem>
                    {DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Time estimate</Label>
                <Input value={form.timeEstimate} onChange={(e) => set("timeEstimate", e.target.value)} placeholder="e.g. 3–5 hours" />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Write-up</Label>
              <Textarea value={form.writeup} onChange={(e) => set("writeup", e.target.value)} className="h-72 font-mono text-xs" placeholder="## What you'll build&#10;..." />
            </div>
          </div>

          {[
            ["isVideo", "Video guide", "Shows a video badge and embeds YouTube links on the page."],
            ["featured", "Featured", "Pinned to the top of its category."],
            ["published", "Published", "Visible in the Build Your Own library."],
          ].map(([key, label, hint]) => (
            <div key={key} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label>{label}</Label>
                <p className="text-xs text-muted-foreground">{hint}</p>
              </div>
              <Switch checked={!!form[key]} onCheckedChange={(v) => set(key, v)} />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{saving ? "Saving..." : tutorial ? "Save changes" : "Add guide"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
