import React from "react";
import { ShieldAlert } from "lucide-react";
import { SAFETY_WARNINGS } from "./socialSetupConfig";

export default function SocialSafetyWarnings() {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-semibold">Before you publish</h3>
      </div>
      <ul className="space-y-2">
        {SAFETY_WARNINGS.map((w, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>{w}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}