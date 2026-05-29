import React, { useState } from "react";
import { Copy, Check, CheckCircle2, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import Markdown from "./Markdown";

const STATUS_STYLES = {
  not_used: "bg-secondary text-muted-foreground",
  copied: "bg-chart-2/15 text-chart-2",
  completed: "bg-green-500/15 text-green-400",
};

export default function PromptCard({ prompt, onUpdate }) {
  const [copied, setCopied] = useState(false);

  const setStatus = async (status) => {
    await base44.entities.PromptItem.update(prompt.id, { status });
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
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
            {prompt.promptNumber}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-sora font-semibold text-base">{prompt.title}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{prompt.category}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[prompt.status] || STATUS_STYLES.not_used}`}>
                {prompt.status?.replace("_", " ")}
              </span>
            </div>
            {prompt.purpose && <p className="text-sm text-muted-foreground mt-1">{prompt.purpose}</p>}
            {prompt.dependencies && <p className="text-xs text-muted-foreground mt-1">Depends on: {prompt.dependencies}</p>}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="rounded-xl bg-background/50 border border-border p-4 max-h-80 overflow-y-auto">
          <Markdown content={prompt.promptText} />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />} Copy prompt
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStatus("copied")}>
            <ClipboardCheck className="w-4 h-4 mr-1.5" /> Mark as copied
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStatus("completed")}>
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark as completed
          </Button>
        </div>
      </div>
    </div>
  );
}