import React from "react";
import { MessageSquare, Cpu, ListChecks, Copy } from "lucide-react";

const STEPS = [
  { icon: MessageSquare, title: "Describe your app idea", desc: "Answer a short intake about features, users, and goals." },
  { icon: Cpu, title: "AI architect generates the blueprint", desc: "A full Base44 architecture is planned for you." },
  { icon: ListChecks, title: "Review the plan", desc: "Entities, pages, permissions, and workflows — all laid out." },
  { icon: Copy, title: "Copy the build prompts into Base44", desc: "Paste ready-made prompts and build your app fast." },
];

export default function HowItWorks() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STEPS.map((s, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card/70 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <s.icon className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">Step {i + 1}</span>
          </div>
          <h4 className="font-sora font-semibold text-sm mb-1">{s.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}