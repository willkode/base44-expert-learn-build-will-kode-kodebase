import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

export default function BlueprintProgress({ steps }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6">
      <h3 className="font-sora font-semibold text-lg mb-4">Blueprint progress</h3>
      <ul className="space-y-3">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-3">
            {s.done ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
            )}
            <span className={`text-sm ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}