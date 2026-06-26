import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ClipboardPaste, X, Bot, Check } from "lucide-react";

const CATEGORIES = [
  "Development", "Business", "SEO", "Marketing", "AI & Prompting",
  "Productivity", "Sales", "Content", "Design", "Security", "Automation", "Other"
];

export default function BulkPasteSkillsDialog({ open, onOpenChange, onImported }) {
  const [pasteText, setPasteText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsed, setParsed] = useState([]); // array of skill drafts

  const reset = () => { setPasteText(""); setParsed([]); };

  const parse = async () => {
    if (!pasteText.trim()) {
      toast.error("Paste one or more skills first");
      return;
    }
    setParsing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a parser that extracts MULTIPLE "agent skills" from a single block of text. The text may contain several skills separated by blank lines, numbering, headings, "---", or other delimiters. Identify each distinct skill and extract its fields. If only one skill is present, return an array with one item.

For each skill extract:
- title: a concise skill title (max 12 words)
- description: a one-sentence explanation of what the skill does (max 25 words)
- category: pick exactly one from: ${CATEGORIES.join(", ")}
- tags: an array of 3–6 relevant lowercase keyword tags
- prompt_body: the full prompt that builds the skill (keep it complete and verbatim if present)
- recommended_model: the AI model named for that skill, or "" if none

Source text:
"""
${pasteText}
"""

Return only the JSON object with a "skills" array.`,
        response_json_schema: {
          type: "object",
          properties: {
            skills: {
              type: "array",
              items: {
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
            },
          },
        },
      });
      const skills = (result.skills || [])
        .filter((s) => s && (s.title || s.prompt_body))
        .map((s) => ({
          title: s.title || "",
          description: s.description || "",
          category: CATEGORIES.includes(s.category) ? s.category : "Other",
          tags: Array.isArray(s.tags) ? s.tags : [],
          prompt_body: s.prompt_body || "",
          recommended_model: s.recommended_model || "",
        }));
      if (skills.length === 0) {
        toast.error("No skills could be detected in that text");
      } else {
        setParsed(skills);
        toast.success(`Detected ${skills.length} skill${skills.length !== 1 ? "s" : ""} — review before importing`);
      }
    } catch (err) {
      toast.error("Could not parse the pasted text");
    } finally {
      setParsing(false);
    }
  };

  const removeDraft = (i) => setParsed((p) => p.filter((_, idx) => idx !== i));

  const importAll = async () => {
    const valid = parsed.filter((s) => s.title.trim() && s.prompt_body.trim());
    if (valid.length === 0) {
      toast.error("No valid skills to import (each needs a title and a prompt)");
      return;
    }
    setSaving(true);
    try {
      await base44.entities.AgentSkill.bulkCreate(
        valid.map((s, i) => ({ ...s, order: i, published: true }))
      );
      toast.success(`Imported ${valid.length} skill${valid.length !== 1 ? "s" : ""}`);
      onImported?.();
      onOpenChange(false);
      reset();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = (o) => {
    onOpenChange(o);
    if (!o) reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-sora font-bold flex items-center gap-2">
            <ClipboardPaste className="w-4 h-4 text-primary" /> Bulk import skills
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Paste one or many skills in a single block — separated by blank lines, numbers, headings, or "---". AI will split them into individual skills you can review, then import all at once.
          </p>

          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={"Skill 1: Automated Code Review Agent\nCategory: Development\nModel: Claude 3.5 Sonnet\nPrompt: You are a senior engineer...\n\n---\n\nSkill 2: SEO Brief Generator\n..."}
            rows={8}
            className="text-sm resize-y"
          />

          <div className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={parse} disabled={parsing || !pasteText.trim()} className="gap-1.5">
              {parsing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {parsing ? "Detecting skills…" : parsed.length ? "Re-detect skills" : "Detect skills"}
            </Button>
            {parsed.length > 0 && (
              <span className="text-xs text-muted-foreground">{parsed.length} detected</span>
            )}
          </div>

          {/* Preview list */}
          {parsed.length > 0 && (
            <div className="space-y-3">
              {parsed.map((s, i) => (
                <div key={i} className="rounded-lg border border-border bg-background/50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm truncate">{s.title || <span className="text-destructive">Untitled</span>}</span>
                        <Badge variant="secondary" className="text-[10px]">{s.category}</Badge>
                        {s.recommended_model && (
                          <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                            <Bot className="w-2.5 h-2.5 mr-1" />{s.recommended_model}
                          </Badge>
                        )}
                      </div>
                      {s.description && <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(s.tags || []).map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
                        ))}
                      </div>
                      {!s.prompt_body.trim() && (
                        <p className="text-[10px] text-destructive mt-1">⚠ No prompt detected — will be skipped</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeDraft(i)} title="Remove">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleClose(false)} disabled={saving}>Cancel</Button>
          <Button onClick={importAll} disabled={saving || parsed.length === 0} className="gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Importing…" : `Import ${parsed.filter((s) => s.title.trim() && s.prompt_body.trim()).length || ""} skill${parsed.filter((s) => s.title.trim() && s.prompt_body.trim()).length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}