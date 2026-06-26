import React, { useState } from "react";
import { Copy, Check, Bot, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

export default function AgentSkillCard({ skill }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(skill.prompt_body || "");
    setCopied(true);
    trackEvent("agent_skill_copied", { skillId: skill.id, title: skill.title });
    toast.success("Skill prompt copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card/50 hover:border-primary/30 transition-colors">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {skill.category && <Badge variant="secondary" className="text-[10px]">{skill.category}</Badge>}
            {skill.recommended_model && (
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                <Bot className="w-2.5 h-2.5 mr-1" />{skill.recommended_model}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={copy} title="Copy prompt">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
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

        <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
          {expanded ? <>Hide prompt <ChevronUp className="w-3 h-3" /></> : <>View build prompt <ChevronDown className="w-3 h-3" /></>}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed bg-background/60 rounded-lg p-4 max-h-64 overflow-y-auto">
            {skill.prompt_body}
          </pre>
          <Button onClick={copy} size="sm" className="mt-3 gap-2 w-full" variant="outline">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            Copy prompt
          </Button>
        </div>
      )}
    </div>
  );
}