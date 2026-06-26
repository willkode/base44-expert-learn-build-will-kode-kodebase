import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Check, X, Bot, ChevronDown, ChevronUp, Wand2 } from "lucide-react";

const CATEGORIES = [
  "Development", "Business", "SEO", "Marketing", "AI & Prompting",
  "Productivity", "Sales", "Content", "Design", "Security", "Automation", "Other",
];

function PendingCard({ skill, onApprove, onReject, busyId }) {
  const [expanded, setExpanded] = useState(false);
  const busy = busyId === skill.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="rounded-xl border border-primary/30 bg-card/60 p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="text-[10px] bg-primary/15 text-primary border-primary/30">Pending review</Badge>
          {skill.category && <Badge variant="secondary" className="text-[10px]">{skill.category}</Badge>}
          {skill.recommended_model && (
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
              <Bot className="w-2.5 h-2.5 mr-1" />{skill.recommended_model}
            </Badge>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-sm mb-1">{skill.title}</h3>
      {skill.description && <p className="text-xs text-muted-foreground mb-3">{skill.description}</p>}

      {(skill.tags || []).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {skill.tags.map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{t}</span>
          ))}
        </div>
      )}

      <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary hover:underline inline-flex items-center gap-1 mb-3">
        {expanded ? <>Hide prompt <ChevronUp className="w-3 h-3" /></> : <>View build prompt <ChevronDown className="w-3 h-3" /></>}
      </button>

      {expanded && (
        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed bg-background/60 rounded-lg p-4 max-h-64 overflow-y-auto mb-3">
          {skill.prompt_body}
        </pre>
      )}

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onApprove(skill)} disabled={busy} className="gap-1.5 flex-1">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Approve
        </Button>
        <Button size="sm" variant="outline" onClick={() => onReject(skill)} disabled={busy} className="gap-1.5 flex-1 text-destructive border-destructive/40 hover:bg-destructive/10">
          <X className="w-3.5 h-3.5" /> Reject
        </Button>
      </div>
    </motion.div>
  );
}

export default function SkillReviewPanel({ existingTitles = [], onChanged }) {
  const [generating, setGenerating] = useState(false);
  const [pending, setPending] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert at designing reusable "agent skills" — copy-paste build prompts that make AI agents smarter for builders on the Base44 platform.

Recommend exactly 10 NEW, distinct, high-value agent skills. Avoid duplicating any of these existing skill titles:
${existingTitles.length ? existingTitles.map((t) => `- ${t}`).join("\n") : "(none yet)"}

For each skill provide:
- title: concise (max 12 words)
- description: one sentence on what it does (max 25 words)
- category: pick exactly one from: ${CATEGORIES.join(", ")}
- tags: 3–6 lowercase keyword tags
- prompt_body: a complete, production-ready build prompt (detailed, multi-sentence, copy-paste ready)
- recommended_model: a suitable model name (e.g. "Claude 3.5 Sonnet", "GPT-4o")

Return only the JSON object with a "skills" array of 10 items.`,
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

      const drafts = (result.skills || [])
        .filter((s) => s && s.title && s.prompt_body)
        .map((s) => ({
          title: s.title,
          description: s.description || "",
          category: CATEGORIES.includes(s.category) ? s.category : "Other",
          tags: Array.isArray(s.tags) ? s.tags : [],
          prompt_body: s.prompt_body,
          recommended_model: s.recommended_model || "",
          published: false,
        }));

      if (drafts.length === 0) {
        toast.error("AI did not return any skills — try again");
        return;
      }

      const created = await base44.entities.AgentSkill.bulkCreate(drafts);
      setPending((p) => [...created, ...p]);
      toast.success(`${created.length} skills generated — review to approve or reject`);
    } catch (err) {
      toast.error("Could not generate skills");
    } finally {
      setGenerating(false);
    }
  };

  const approve = async (skill) => {
    setBusyId(skill.id);
    try {
      await base44.entities.AgentSkill.update(skill.id, { published: true });
      setPending((p) => p.filter((s) => s.id !== skill.id));
      toast.success("Skill approved & published");
      onChanged?.();
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (skill) => {
    setBusyId(skill.id);
    try {
      await base44.entities.AgentSkill.delete(skill.id);
      setPending((p) => p.filter((s) => s.id !== skill.id));
      toast.success("Skill rejected & deleted");
    } finally {
      setBusyId(null);
    }
  };

  const approveAll = async () => {
    setBulkBusy(true);
    try {
      await base44.entities.AgentSkill.bulkUpdate(pending.map((s) => ({ id: s.id, published: true })));
      toast.success(`${pending.length} skills approved`);
      setPending([]);
      onChanged?.();
    } finally {
      setBulkBusy(false);
    }
  };

  const rejectAll = async () => {
    setBulkBusy(true);
    try {
      for (const s of pending) {
        await base44.entities.AgentSkill.delete(s.id);
      }
      toast.success(`${pending.length} skills rejected`);
      setPending([]);
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-border bg-secondary/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-sora font-semibold text-sm">Generate skills with AI</p>
            <p className="text-xs text-muted-foreground">AI suggests 10 new skills — approve to publish, reject to delete.</p>
          </div>
        </div>
        <Button onClick={generate} disabled={generating || bulkBusy} className="gap-2">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? "Generating…" : "Generate 10 skills"}
        </Button>
      </div>

      {pending.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-sm font-medium">{pending.length} pending review</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={approveAll} disabled={bulkBusy} className="gap-1.5">
                {bulkBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Approve all
              </Button>
              <Button size="sm" variant="outline" onClick={rejectAll} disabled={bulkBusy} className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10">
                <X className="w-3.5 h-3.5" /> Reject all
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {pending.map((s) => (
                <PendingCard key={s.id} skill={s} onApprove={approve} onReject={reject} busyId={busyId} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}