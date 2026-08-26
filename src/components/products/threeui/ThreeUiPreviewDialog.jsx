import React, { useState } from "react";
import { Copy, Check, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThreeUiPreview from "@/components/products/threeui/ThreeUiPreview";
import { trackEvent } from "@/lib/analytics";

export default function ThreeUiPreviewDialog({ element, locked, open, onOpenChange, onUnlock }) {
  const [copied, setCopied] = useState(false);
  if (!element) return null;

  const copyPrompt = () => {
    navigator.clipboard.writeText(element.prompt);
    setCopied(true);
    trackEvent("three_ui_prompt_copy", { element: element.id, location: "preview_dialog" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <Badge variant="secondary" className="text-[10px] w-fit">{element.category}</Badge>
          <DialogTitle className="font-sora">{element.name}</DialogTitle>
          <DialogDescription>{element.description}</DialogDescription>
        </DialogHeader>

        <ThreeUiPreview elementId={element.id} />

        {locked ? (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
            <Lock className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              The full build prompt for this element unlocks with the catalog.
            </p>
            <Button
              onClick={onUnlock}
              className="bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] font-semibold hover:opacity-90"
            >
              Unlock All Prompts — $25
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Build prompt</span>
              <Button size="sm" onClick={copyPrompt}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="whitespace-pre-wrap rounded-xl bg-background border border-border p-4 text-xs text-muted-foreground leading-relaxed">
              {element.prompt}
            </pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}