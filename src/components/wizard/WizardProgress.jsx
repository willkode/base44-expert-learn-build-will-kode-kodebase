import React from "react";
import { Check } from "lucide-react";

export default function WizardProgress({ steps, current }) {
  return (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                done ? "bg-primary text-primary-foreground" : active ? "bg-primary/20 text-primary border border-primary" : "bg-secondary text-muted-foreground"
              }`}
            >
              {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${active ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
          </div>
        );
      })}
    </div>
  );
}