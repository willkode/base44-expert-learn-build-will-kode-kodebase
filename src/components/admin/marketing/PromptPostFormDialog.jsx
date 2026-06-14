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
import { Sparkles, RefreshCw } from "lucide-react";

const CATEGORIES = [
  "App Building", "Workflow", "Marketing", "Architecture", "Database",
  "Security", "UI Design", "Backend", "QA & Testing", "Optimization",
  "Debugging", "SEO & Marketing", "General",
];

const EMPTY = {
  title: "", slug: "", category: "General", tags: "",
  guide: "", promptText: "", featured: false,
};

export default function PromptPostFormDialog({ open, onOpenChange, prompt, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [regenImage, setRegenImage] = useState(false);

  useEffect(() => {
    if (prompt) {
      setForm({
        ...EMPTY,
        ...prompt,
        tags: Array.isArray(prompt.tags) ? prompt.tags.join(", ") : "",
      });
    } else {
      setForm(EMPTY);
    }
    setRegenImage(false);
  }, [prompt, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.promptText.trim()) return toast.error("Prompt text is required");
    setSaving(true);
    const res = await base44.functions.invoke("generatePromptPost", {
      id: prompt?.id || null,
      title: form.title,
      slug: form.slug,
      category: form.category,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      guide: form.guide,
      promptText: form.promptText,
      featured: form.featured,
      regenerateImage: regenImage,
    });
    setSaving(false);
    if (res.data?.error) return toast.error(res.data.error);
    toast.success(prompt ? "Prompt post updated" : "Prompt post created with AI");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {prompt ? "Edit prompt post" : "New AI prompt post"}
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
              <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto from title" />
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
            <Label className="mb-1.5 block">Prompt guide <span className="text-muted-foreground">(optional — AI will refine & expand)</span></Label>
            <Textarea value={form.guide} onChange={(e) => set("guide", e.target.value)} className="h-24" placeholder="A few notes on when and how to use this prompt..." />
          </div>

          <div>
            <Label className="mb-1.5 block">The prompt</Label>
            <Textarea value={form.promptText} onChange={(e) => set("promptText", e.target.value)} className="h-40 font-mono text-xs" placeholder="Paste the full prompt here..." />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label>Featured</Label>
              <p className="text-xs text-muted-foreground">Highlight this prompt in the library.</p>
            </div>
            <Switch checked={!!form.featured} onCheckedChange={(v) => set("featured", v)} />
          </div>

          {prompt && (
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Regenerate featured image</Label>
                <p className="text-xs text-muted-foreground">Create a fresh AI image on save.</p>
              </div>
              <Switch checked={regenImage} onCheckedChange={setRegenImage} />
            </div>
          )}

          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            AI auto-generates the description, SEO meta, formatted guide{!prompt ? " and featured image" : ""} on save.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> {prompt ? "Save changes" : "Create with AI"}</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}