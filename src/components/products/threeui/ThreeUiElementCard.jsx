import React, { useState } from "react";
import { Lock, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export default function ThreeUiElementCard({ element, locked, onUnlock }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(element.prompt);
    setCopied(true);
    trackEvent("three_ui_prompt_copy", { element: element.id });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-3">
        <Badge variant="secondary" className="text-[10px]">{element.category}</Badge>
        {locked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
      </div>
      <h3 className="font-sora font-semibold text-base mb-1.5">{element.name}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{element.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(element.tags || []).map((t) => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{t}</span>
        ))}
      </div>

      <div className="mt-auto">
        {locked ? (
          <Button variant="outline" size="sm" className="w-full" onClick={onUnlock}>
            <Lock className="w-3.5 h-3.5" /> Unlock prompt
          </Button>
        ) : (
          <>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={copyPrompt}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy prompt"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
                {open ? "Hide" : "View"}
              </Button>
            </div>
            {open && (
              <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl bg-background border border-border p-3 text-xs text-muted-foreground leading-relaxed">
                {element.prompt}
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  );
}