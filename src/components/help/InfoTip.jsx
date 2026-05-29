import React from "react";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { HELP } from "@/lib/base44Help";

// Small inline help icon with a tooltip. Pass a HELP key or a custom title/text.
export default function InfoTip({ topic, title, text, className = "" }) {
  const help = topic ? HELP[topic] : null;
  const heading = title || help?.title;
  const body = text || help?.text;
  if (!body) return null;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className={`inline-flex text-muted-foreground hover:text-primary transition-colors ${className}`} aria-label={heading}>
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-card text-card-foreground border border-border shadow-lg">
          {heading && <p className="font-semibold mb-1">{heading}</p>}
          <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}