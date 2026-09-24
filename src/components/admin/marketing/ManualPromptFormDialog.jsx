import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PenLine, RefreshCw, Upload, X } from "lucide-react";
import PromptMedia from "@/components/learn/PromptMedia";

// Manual create/edit for LibraryPrompt — saves exactly what the admin types,
// no AI rewrite. Mirrors the fields rendered on /learn/prompt-library.
const CATEGORIES = [
  "App Building", "Workflow", "Marketing", "Architecture", "Database",
  "Security", "UI Design", "Backend", "QA & Testing", "Optimization",
  "Debugging", "SEO & Marketing", "General",
];

const EMPTY = {
  title: "", slug: "", category: "General", tags: "",
  description: "", guide: "", promptText: "", imageUrl: "", videoUrl: "",
  seoTitle: "", seoDescription: "", featured: false, order: 0, publishedAt: "",
};

// ISO date-time -> yyyy-mm-dd for the date input
const toDateInput = (iso) => (iso ? String(iso).slice(0, 10) : "");

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export default function ManualPromptFormDialog({ open, onOpenChange, prompt, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null); // field name being uploaded

  useEffect(() => {
    if (prompt) {
      setForm({
        ...EMPTY,
        ...prompt,
        tags: Array.isArray(prompt.tags) ? prompt.tags.join(", ") : "",
        order: prompt.order ?? 0,
        publishedAt: toDateInput(prompt.publishedAt || prompt.created_date),
      });
    } else {
      setForm(EMPTY);
    }
  }, [prompt, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = (field) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(field);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set(field, file_url);
    } catch (err) {
      toast.error(err?.message || "Upload failed");
    }
    setUploading(null);
  };

  const save = async () => {
    const title = form.title.trim();
    if (!title) return toast.error("Title is required");
    if (!form.promptText.trim()) return toast.error("Prompt text is required");

    const slug = slugify(form.slug || title);
    if (!slug) return toast.error("Slug must contain letters or numbers");

    setSaving(true);
    try {
      const clash = (await base44.entities.LibraryPrompt.filter({ slug }))
        .filter((p) => p.id !== prompt?.id);
      if (clash.length > 0) {
        setSaving(false);
        return toast.error(`Slug "${slug}" is already used by "${clash[0].title}"`);
      }

      const order = Number(form.order);
      const data = {
        title,
        slug,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        description: form.description.trim(),
        guide: form.guide,
        promptText: form.promptText,
        imageUrl: form.imageUrl.trim(),
        videoUrl: form.videoUrl.trim(),
        seoTitle: form.seoTitle.trim(),
        seoDescription: form.seoDescription.trim(),
        featured: !!form.featured,
        order: Number.isFinite(order) ? order : 0,
        publishedAt: form.publishedAt ? new Date(`${form.publishedAt}T12:00:00Z`).toISOString() : new Date().toISOString(),
      };

      if (prompt?.id) {
        await base44.entities.LibraryPrompt.update(prompt.id, data);
      } else {
        await base44.entities.LibraryPrompt.create(data);
      }
      toast.success(prompt ? "Prompt updated" : "Prompt added");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.message || "Failed to save prompt");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-primary" />
            {prompt ? "Edit prompt" : "Add prompt manually"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Title</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Generate a secure entity schema" />
            </div>
            <div>
              <Label className="mb-1.5 block">URL slug <span className="text-muted-foreground">(optional)</span></Label>
              <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder={slugify(form.title) || "auto from title"} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Tags <span className="text-muted-foreground">(comma separated)</span></Label>
              <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="security, schema, rls" />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block">Short description <span className="text-muted-foreground">(shown on the card)</span></Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="h-16" placeholder="One sentence on what this prompt does." />
          </div>

          <div>
            <Label className="mb-1.5 block">The prompt</Label>
            <Textarea value={form.promptText} onChange={(e) => set("promptText", e.target.value)} className="h-40 font-mono text-xs" placeholder="Paste the full prompt here..." />
          </div>

          <div>
            <Label className="mb-1.5 block">Guide <span className="text-muted-foreground">(markdown, shown on the post page)</span></Label>
            <Textarea value={form.guide} onChange={(e) => set("guide", e.target.value)} className="h-40 font-mono text-xs" placeholder="## When to use this prompt&#10;..." />
          </div>

          <div>
            <Label className="mb-1.5 block">Featured image</Label>
            <div className="flex gap-2">
              <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://... (blank uses the category image)" />
              <Button type="button" variant="outline" className="gap-2 shrink-0" disabled={uploading} asChild>
                <label className="cursor-pointer">
                  {uploading === "imageUrl" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload("imageUrl")} disabled={!!uploading} />
                </label>
              </Button>
            </div>
            {form.imageUrl && (
              <div className="relative mt-2 w-40">
                <img src={form.imageUrl} alt="" className="w-40 h-24 rounded object-cover border border-border" />
                <button type="button" onClick={() => set("imageUrl", "")} className="absolute -top-2 -right-2 rounded-full bg-background border border-border p-0.5" title="Remove image">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block">Featured video <span className="text-muted-foreground">(optional — replaces the image)</span></Label>
            <div className="flex gap-2">
              <Input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="YouTube link, or upload a video file" />
              <Button type="button" variant="outline" className="gap-2 shrink-0" disabled={!!uploading} asChild>
                <label className="cursor-pointer">
                  {uploading === "videoUrl" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleUpload("videoUrl")} disabled={!!uploading} />
                </label>
              </Button>
            </div>
            {form.videoUrl && (
              <div className="relative mt-2 w-64">
                <div className="relative aspect-video rounded overflow-hidden border border-border bg-black">
                  <PromptMedia prompt={{ title: form.title, videoUrl: form.videoUrl, imageUrl: form.imageUrl }} variant="card" className="w-full h-full object-cover" />
                </div>
                <button type="button" onClick={() => set("videoUrl", "")} className="absolute -top-2 -right-2 rounded-full bg-background border border-border p-0.5" title="Remove video">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1.5">Uploaded videos autoplay muted on cards; YouTube shows a thumbnail. The featured image is still used for social share previews.</p>
          </div>

          <div>
            <Label className="mb-1.5 block">SEO title <span className="text-muted-foreground">(optional)</span></Label>
            <Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder={form.title ? `${form.title} | KodeBase` : ""} />
          </div>

          <div>
            <Label className="mb-1.5 block">SEO description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} className="h-16" />
          </div>

          <div>
            <Label className="mb-1.5 block">Published date <span className="text-muted-foreground">(blank = today)</span></Label>
            <Input type="date" value={form.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} className="w-48" />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label>Featured</Label>
              <p className="text-xs text-muted-foreground">Highlight this prompt in the library.</p>
            </div>
            <Switch checked={!!form.featured} onCheckedChange={(v) => set("featured", v)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving || uploading} className="gap-2">
            {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : prompt ? "Save changes" : "Add prompt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}