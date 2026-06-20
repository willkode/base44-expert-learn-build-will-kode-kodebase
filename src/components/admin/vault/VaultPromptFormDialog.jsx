import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";

const CATEGORIES = [
  "Development", "Business", "SEO", "Marketing", "AI & Prompting",
  "Productivity", "Sales", "Content", "Design", "Security", "Other"
];

const blank = { title: "", prompt_body: "", category: "Development", description: "", tags: [], order: 0, published: true };

export default function VaultPromptFormDialog({ open, onOpenChange, prompt, onSaved }) {
  const [form, setForm] = useState(blank);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prompt) {
      setForm({ ...blank, ...prompt });
    } else {
      setForm(blank);
    }
    setTagInput("");
  }, [prompt, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,$/, "");
      if (tag && !form.tags.includes(tag)) {
        set("tags", [...form.tags, tag]);
      }
      setTagInput("");
    }
  };
  const removeTag = (t) => set("tags", form.tags.filter((x) => x !== t));

  const save = async () => {
    if (!form.title.trim() || !form.prompt_body.trim()) {
      toast.error("Title and prompt body are required");
      return;
    }
    setSaving(true);
    try {
      if (prompt?.id) {
        await base44.entities.VaultPrompt.update(prompt.id, form);
        toast.success("Prompt updated");
      } else {
        await base44.entities.VaultPrompt.create(form);
        toast.success("Prompt created");
      }
      onSaved?.();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-sora font-bold">
            {prompt ? "Edit Vault Prompt" : "New Vault Prompt"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Advanced SEO Content Brief Generator"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Short Description</Label>
            <Input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What does this prompt do? (shown in the vault listing)"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags <span className="text-muted-foreground text-xs">(press Enter or comma to add)</span></Label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-md border border-input bg-background min-h-10">
              {form.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-medium">
                  {t}
                  <button onClick={() => removeTag(t)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder={form.tags.length === 0 ? "Type a tag and press Enter…" : ""}
                className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Prompt body */}
          <div className="space-y-1.5">
            <Label>Prompt Body <span className="text-destructive">*</span></Label>
            <Textarea
              value={form.prompt_body}
              onChange={(e) => set("prompt_body", e.target.value)}
              placeholder="Paste or write the full prompt here…"
              rows={10}
              className="font-mono text-sm resize-y"
            />
          </div>

          {/* Order & Published */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 space-y-0">
              <Switch
                checked={form.published}
                onCheckedChange={(v) => set("published", v)}
                id="published"
              />
              <Label htmlFor="published" className="cursor-pointer">Published (visible to users with access)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap text-sm text-muted-foreground">Sort order</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => set("order", Number(e.target.value))}
                className="w-20 h-8 text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : prompt ? "Save Changes" : "Create Prompt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}