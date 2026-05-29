import React, { useState } from "react";
import { Copy, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import Markdown from "@/components/blueprint/Markdown";

const STATUS_STYLES = {
  not_used: "bg-secondary text-muted-foreground",
  copied: "bg-chart-2/15 text-chart-2",
  completed: "bg-green-500/15 text-green-400",
};

const CATEGORY_STYLES = {
  "UI Redesign": "bg-primary/15 text-primary",
  "Sales Copy": "bg-chart-2/15 text-chart-2",
  "SEO": "bg-chart-4/15 text-chart-4",
  "Conversion": "bg-chart-5/15 text-chart-5",
  "Performance": "bg-secondary text-muted-foreground",
};

export default function OptimizationPromptCard({ prompt, onUpdate }) {
  const [copied, setCopied] = useState(false);

  const setStatus = async (status) => {
    await base44.entities.OptimizationPrompt.update(prompt.id, { status });
    onUpdate();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.promptText || "");
    setCopied(true);
    toast.success("Prompt copied");
    setTimeout(() => setCopied(false), 1500);
    if (prompt.status === "not_used") setStatus("copied");
  };

  return (
    <div className="rounded-2xl border border-border bg-card/70 overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-5 border-b border-border">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-sora font-semibold text-base">{prompt.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_STYLES[prompt.category] || CATEGORY_STYLES["UI Redesign"]}`}>
              {prompt.category}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[prompt.status] || STATUS_STYLES.not_used}`}>
              {prompt.status?.replace("_", " ")}
            </span>
          </div>
          {prompt.targetArea && <p className="text-xs text-muted-foreground mt-1">Target: {prompt.targetArea}</p>}
          {prompt.purpose && <p className="text-sm text-muted-foreground mt-1">{prompt.purpose}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />} Copy prompt
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStatus("completed")}>
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark as done
          </Button>
        </div>
      </div>

      <div className="p-5">
        <div className="rounded-xl bg-background/50 border border-border p-4 max-h-80 overflow-y-auto">
          <Markdown content={prompt.promptText} />
        </div>
      </div>
    </div>
  );
}