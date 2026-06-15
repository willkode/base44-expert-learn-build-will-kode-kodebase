import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { copyToClipboard } from "@/components/admin/security/issues/issueActions";

// Prominent "Copy Fix Prompt" button. On clipboard failure, reveals a selectable textarea.
export default function CopyFixPromptButton({ fixPrompt, className = "", size }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  if (!fixPrompt) return null;

  const handleCopy = async () => {
    const ok = await copyToClipboard(fixPrompt);
    if (ok) {
      setCopied(true);
      toast({ title: "Fix prompt copied" });
      setTimeout(() => setCopied(false), 2000);
    } else {
      setShowFallback(true);
      toast({ title: "Copy not available", description: "Select the text below and copy it manually.", variant: "destructive" });
    }
  };

  return (
    <div className={className}>
      <Button onClick={handleCopy} size={size} className="gap-2">
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied" : "Copy Fix Prompt"}
      </Button>
      {showFallback && (
        <Textarea
          readOnly
          value={fixPrompt}
          onFocus={(e) => e.target.select()}
          className="mt-3 h-48 font-mono text-xs"
        />
      )}
    </div>
  );
}