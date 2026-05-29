import React from "react";
import { Lightbulb } from "lucide-react";
import { HELP } from "@/lib/base44Help";

// Inline explanatory card. Pass a HELP key or a custom title/text.
export default function InfoCard({ topic, title, text, icon: Icon = Lightbulb, className = "" }) {
  const help = topic ? HELP[topic] : null;
  const heading = title || help?.title;
  const body = text || help?.text;
  if (!body) return null;

  return (
    <div className={`rounded-xl border border-border bg-secondary/40 p-4 flex gap-3 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        {heading && <p className="font-sora font-semibold text-sm mb-1">{heading}</p>}
        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </div>
  );
}