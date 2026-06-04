import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import SectionHeading from "@/components/learn/superagent/SectionHeading";
import { PATTERNS, LOW_RISK, HIGH_RISK } from "@/components/learn/superagent/data";

function RiskList({ title, items, tone }) {
  const isLow = tone === "low";
  const Icon = isLow ? CheckCircle2 : AlertTriangle;
  return (
    <div className={`rounded-2xl border p-6 ${isLow ? "border-primary/30 bg-primary/5" : "border-amber-500/30 bg-amber-500/5"}`}>
      <div className={`flex items-center gap-2 font-sora font-bold text-lg mb-4 ${isLow ? "text-primary" : "text-amber-400"}`}>
        <Icon className="w-5 h-5" /> {title}
      </div>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isLow ? "text-primary" : "text-amber-400"}`} />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Patterns() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeading label="Strong Patterns" title="Five Repeatable Patterns" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
        {PATTERNS.map((p) => (
          <div key={p.name} className="rounded-2xl border border-border bg-card/70 p-5">
            <h3 className="font-sora font-bold text-sm text-primary mb-3 leading-snug">{p.name}</h3>
            <ul className="space-y-1.5">
              {p.items.map((i) => (
                <li key={i} className="text-sm text-muted-foreground">{i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <RiskList title="Start Here — Low Risk" items={LOW_RISK} tone="low" />
        <RiskList title="Handle Carefully — Higher Risk" items={HIGH_RISK} tone="high" />
      </div>
    </section>
  );
}