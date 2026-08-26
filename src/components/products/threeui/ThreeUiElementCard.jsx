import React, { useState } from "react";
import { Lock, Copy, Check, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ThreeUiPreviewDialog from "@/components/products/threeui/ThreeUiPreviewDialog";
import { trackEvent } from "@/lib/analytics";

export default function ThreeUiElementCard({ element, locked, onUnlock }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(element.prompt);
    setCopied(true);
    trackEvent("three_ui_prompt_copy", { element: element.id, location: "card" });
    setTimeout(() => setCopied(false), 2000);
  };

  const openPreview = () => {
    trackEvent("three_ui_preview_open", { element: element.id, locked: !!locked });
    setOpen(true);
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

      <div className="mt-auto flex gap-2">
        <Button size="sm" variant={locked ? "default" : "outline"} className="flex-1" onClick={openPreview}>
          <Eye className="w-3.5 h-3.5" /> Preview
        </Button>
        {!locked && (
          <Button size="sm" className="flex-1" onClick={copyPrompt}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy prompt"}
          </Button>
        )}
      </div>

      <ThreeUiPreviewDialog
        element={element}
        locked={locked}
        open={open}
        onOpenChange={setOpen}
        onUnlock={onUnlock}
      />
    </div>
  );
}