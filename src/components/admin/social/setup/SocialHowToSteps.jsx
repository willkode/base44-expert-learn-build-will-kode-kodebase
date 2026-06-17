import React from "react";
import { HOW_TO_STEPS } from "./socialSetupConfig";

export default function SocialHowToSteps() {
  return (
    <ol className="space-y-2.5">
      {HOW_TO_STEPS.map((step, i) => (
        <li key={step.title} className="flex items-start gap-3 rounded-xl border border-border bg-card/40 p-3.5">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] text-xs font-bold flex items-center justify-center shrink-0">
            {i + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium">{step.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}