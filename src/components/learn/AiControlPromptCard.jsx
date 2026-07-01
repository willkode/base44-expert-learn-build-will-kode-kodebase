import React, { useState } from "react";
import { Copy, Check, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export default function AiControlPromptCard({ item }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    trackEvent("copy_ai_control_prompt", { prompt_id: item.id, page_path: "/learn/ai-controls" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <h3 className="font-sora font-semibold text-sm leading-snug">{item.title}</h3>
        </div>
        <Badge variant="secondary" className="shrink-0 text-[10px]">{item.category}</Badge>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{item.description}</p>
      <pre className="flex-1 text-xs text-muted-foreground bg-secondary/50 border border-border rounded-lg p-3 whitespace-pre-wrap font-inter leading-relaxed max-h-44 overflow-y-auto mb-3">
        {item.prompt}
      </pre>
      <Button size="sm" onClick={copy} className="w-full">
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied!" : "Copy Prompt"}
      </Button>
    </div>
  );
}