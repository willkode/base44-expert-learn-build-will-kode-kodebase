import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const EMPTY = {
  title: "", url: "", category: "", languages: "", description: "",
  isVideo: false, featured: false, published: true,
};

export default function BuildTutorialFormDialog({ open, onOpenChange, tutorial, categories = [], onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(tutorial
      ? { ...EMPTY, ...tutorial, languages: (tutorial.languages || []).join(", ") }
      : EMPTY);
  }, [tutorial, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    const title = form.title.trim();
    const url = form.url.trim();
    const category = form.category.trim() || "Uncategorized";
    if (!title) return toast.error("Title is required");
    if (!/^https?:\/\//i.test(url)) return toast.error("Link must start with http:// or https://");

    setSaving(true);
    try {
      const dupes = (await base44.entities.BuildTutorial.filter({ url })).filter((t) => t.id !== tutorial?.id);
      if (dupes.length > 0) {
        setSaving(false);
        return toast.error(`That link is already listed as "${dupes[0].title}"`);
      }
      const data = {
        title,
        url,
        category,
        languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean),
        description: form.description.trim(),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tutorial ? "Edit guide" : "Add guide"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1.5 block">Title</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Write your own Git in Python" />
          </div>
          <div>
            <Label className="mb-1.5 block">Link</Label>
            <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://..." />
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
          <div>
            <Label className="mb-1.5 block">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="h-20" />
          </div>
          {[
            ["isVideo", "Video tutorial", "Shows a video badge."],
            ["featured", "Featured", "Pinned to the top of its category."],
            ["published", "Published", "Visible on the public Build Your Own page."],
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : tutorial ? "Save changes" : "Add guide"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
