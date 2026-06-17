import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Lock, ChevronDown, ChevronUp } from "lucide-react";
import Markdown from "@/components/blueprint/Markdown";
import { trackEvent } from "@/lib/analytics";

const COMPLEXITY_STYLES = {
  low: "bg-green-500/15 text-green-400 border-green-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  high: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function PromptCard({ prompt, index }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const locked = prompt.locked;

  const copy = async () => {
    if (locked || !prompt.prompt_body) return;
    await navigator.clipboard.writeText(prompt.prompt_body);
    setCopied(true);
    trackEvent("prompt_engine_copy_prompt", { category: prompt.category });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-xs font-sora font-bold shrink-0 mt-0.5">
          {index}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-sora font-semibold text-sm">{prompt.title}</h3>
            <Badge variant="secondary" className="text-xs">{prompt.category}</Badge>
            <Badge className={`text-xs border ${COMPLEXITY_STYLES[prompt.estimated_complexity] || ""}`}>
              {prompt.estimated_complexity}
            </Badge>
          </div>
          {prompt.objective && <p className="text-sm text-muted-foreground mt-1.5">{prompt.objective}</p>}
        </div>
        {!locked && (
          <Button variant="ghost" size="icon" onClick={copy} className="shrink-0" title="Copy prompt">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {locked ? (
        <div className="border-t border-border px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30">
          <Lock className="w-3.5 h-3.5" /> Unlock the pack to reveal this prompt.
        </div>
      ) : (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full border-t border-border px-4 py-2.5 flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{expanded ? "Hide prompt" : "View prompt"}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expanded && (
            <div className="px-4 pb-4 space-y-4">
              <div className="rounded-lg bg-secondary/50 p-4">
                <Markdown content={prompt.prompt_body} />
              </div>
              {prompt.acceptance_criteria && (
                <div>
                  <p className="text-xs font-sora font-semibold text-primary mb-1">Acceptance criteria</p>
                  <p className="text-sm text-foreground/80">{prompt.acceptance_criteria}</p>
                </div>
              )}
              {prompt.dependencies && (
                <div>
                  <p className="text-xs font-sora font-semibold text-primary mb-1">Dependencies</p>
                  <p className="text-sm text-foreground/80">{prompt.dependencies}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}