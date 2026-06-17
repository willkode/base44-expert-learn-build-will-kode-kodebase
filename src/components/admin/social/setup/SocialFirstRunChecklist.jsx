import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { FIRST_RUN_STEPS } from "./socialSetupConfig";

export default function SocialFirstRunChecklist({ checklist }) {
  return (
    <div className="space-y-2">
      {FIRST_RUN_STEPS.map((step) => {
        const done = !!checklist[step.key];
        return (
          <Link
            key={step.key}
            to={step.to}
            className="group flex items-start gap-3 rounded-xl border border-border bg-card/40 p-3.5 hover:border-primary/40 transition-colors"
          >
            {done ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${done ? "text-muted-foreground line-through" : ""}`}>
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.hint}</p>
            </div>
            {!done && (
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </Link>
        );
      })}
    </div>
  );
}