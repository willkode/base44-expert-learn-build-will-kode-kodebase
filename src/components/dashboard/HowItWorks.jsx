import React from "react";
import { PenLine, Bot, ListChecks, Copy } from "lucide-react";

const steps = [
  { icon: PenLine, title: "Describe your app idea", desc: "Tell us what you want to build and who it's for." },
  { icon: Bot, title: "AI generates the blueprint", desc: "The AI architect designs a full Base44 architecture." },
  { icon: ListChecks, title: "Review the plan", desc: "Entities, pages, permissions, and workflows — all mapped." },
  { icon: Copy, title: "Copy the build prompts", desc: "Paste the Base44-ready prompts straight into Base44." },
];

export default function HowItWorks() {
  return (
    <div className="mb-10">
      <h2 className="font-sora font-semibold text-lg mb-4">How it works</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card/70 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-sora font-bold text-2xl text-muted-foreground/30">{i + 1}</span>
            </div>
            <h3 className="font-sora font-semibold text-sm mb-1">{s.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}