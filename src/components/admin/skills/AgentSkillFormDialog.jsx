import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X, Sparkles, ClipboardPaste, Loader2 } from "lucide-react";

const CATEGORIES = [
  "Development", "Business", "SEO", "Marketing", "AI & Prompting",
  "Productivity", "Sales", "Content", "Design", "Security", "Automation", "Other"
];

const blank = { title: "", category: "Development", description: "", prompt_body: "", recommended_model: "", tags: [], order: 0, published: true };

export default function AgentSkillFormDialog({ open, onOpenChange, skill, onSaved }) {
  const [form, setForm] = useState(blank);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");

  useEffect(() => {
    setForm(skill ? { ...blank, ...skill } : blank);
    setTagInput("");
    setShowPaste(false);
    setPasteText("");
  }, [skill, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,$/, "");
      if (tag && !form.tags.includes(tag)) set("tags", [...form.tags, tag]);
      setTagInput("");
    }
  };
  const removeTag = (t) => set("tags", form.tags.filter((x) => x !== t));

  const parsePaste = async () => {
    if (!pasteText.trim()) {
      toast.error("Paste your skill details first");
      return;
    }
    setParsing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a parser that extracts structured fields from a block of text describing an "agent skill". The text may be loosely formatted, use labels, or be free-form. Extract these fields:
- title: a concise skill title (max 12 words)
- description: a one-sentence explanation of what the skill does (max 25 words)
- category: pick exactly one from: ${CATEGORIES.join(", ")}
- tags: an array of 3–6 relevant lowercase keyword tags
- prompt_body: the full prompt that builds the skill (the main instruction/prompt text — keep it complete and verbatim if present)
- recommended_model: the AI model named in the text, or "" if none is mentioned

Source text:
"""
${pasteText}
"""

Return only the JSON object.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            prompt_body: { type: "string" },
            recommended_model: { type: "string" },
          },
        },
      });
      setForm((f) => ({
        ...f,
        title: result.title || f.title,
        description: result.description || f.description,
        category: CATEGORIES.includes(result.category) ? result.category : f.category,
        tags: Array.isArray(result.tags) && result.tags.length ? result.tags : f.tags,
        prompt_body: result.prompt_body || f.prompt_body,
        recommended_model: result.recommended_model || f.recommended_model,
      }));
      setShowPaste(false);
      setPasteText("");
      toast.success("Fields filled from pasted details — review before saving");
    } catch (err) {
      toast.error("Could not parse the pasted text");
    } finally {
      setParsing(false);
    }
  };

  const generateMetadata = async () => {
    if (!form.prompt_body.trim()) {
      toast.error("Add a prompt first");
      return;
    }
    setParsing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate metadata for this agent skill prompt. Return JSON with:
- title: concise title (max 12 words)
- description: one-sentence explanation (max 25 words)
- category: one of: ${CATEGORIES.join(", ")}
- tags: 3–6 lowercase keyword tags

Prompt:
"""
${form.prompt_body}
"""

Return only the JSON object.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
          },
        },
      });
      setForm((f) => ({
        ...f,
        title: result.title || f.title,
        description: result.description || f.description,
        category: CATEGORIES.includes(result.category) ? result.category : f.category,
        tags: Array.isArray(result.tags) && result.tags.length ? result.tags : f.tags,
      }));
      toast.success("Metadata generated!");
    } catch (err) {
      toast.error("AI generation failed");
    } finally {
      setParsing(false);
    }
  };

  const save = async () => {
    if (!form.title.trim() || !form.prompt_body.trim()) {
      toast.error("Title and prompt are required");
      return;
    }
    setSaving(true);
    try {
      if (skill?.id) {
        await base44.entities.AgentSkill.update(skill.id, form);
        toast.success("Skill updated");
      } else {
        await base44.entities.AgentSkill.create(form);
        toast.success("Skill created");
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
            {skill ? "Edit Agent Skill" : "New Agent Skill"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Paste-to-fill */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Paste all details at once</span>
              </div>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowPaste((s) => !s)}>
                {showPaste ? "Hide" : "Paste details"}
              </Button>
            </div>
            {showPaste && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste a block with the skill title, category, tags, the prompt, and the AI model — formatted however you like. AI will sort it into the fields below."
                  rows={6}
                  className="text-sm resize-y"
                />
                <Button type="button" size="sm" onClick={parsePaste} disabled={parsing || !pasteText.trim()} className="gap-1.5">
                  {parsing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {parsing ? "Parsing…" : "Fill fields from paste"}
                </Button>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Automated Code Review Agent" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Short Description</Label>
            <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What does this skill do? (shown on the listing)" />
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
                  <button onClick={() => removeTag(t)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
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
            <div className="flex items-center justify-between">
              <Label>Prompt to build the skill <span className="text-destructive">*</span></Label>
              <Button
                type="button" variant="ghost" size="sm"
                onClick={generateMetadata}
                disabled={parsing || !form.prompt_body.trim()}
                className="gap-1.5 text-xs text-primary hover:text-primary h-7 px-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {parsing ? "Generating…" : "Generate metadata with AI"}
              </Button>
            </div>
            <Textarea
              value={form.prompt_body}
              onChange={(e) => set("prompt_body", e.target.value)}
              placeholder="Paste or write the full prompt that builds this skill…"
              rows={10}
              className="font-mono text-sm resize-y"
            />
          </div>

          {/* Recommended AI Model */}
          <div className="space-y-1.5">
            <Label>Recommended AI Model</Label>
            <Input value={form.recommended_model} onChange={(e) => set("recommended_model", e.target.value)} placeholder="e.g. GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro" />
          </div>

          {/* Order & Published */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 space-y-0">
              <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} id="skill-published" />
              <Label htmlFor="skill-published" className="cursor-pointer">Published (visible on the public page)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap text-sm text-muted-foreground">Sort order</Label>
              <Input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} className="w-20 h-8 text-sm" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : skill ? "Save Changes" : "Create Skill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}