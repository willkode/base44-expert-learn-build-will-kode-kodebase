import React from "react";
import { Layers, ShieldCheck, ClipboardCheck, ListOrdered, Lock, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: ListOrdered,
    title: "Ordered build sequence",
    desc: "Prompts are sequenced foundation-first: data and permissions before features, so your app never gets built out of order.",
  },
  {
    icon: Layers,
    title: "Complete blueprint",
    desc: "Roles, entities, pages, features, and workflows — captured in a structured plan before a single prompt runs.",
  },
  {
    icon: ClipboardCheck,
    title: "Build, QA & security prompts",
    desc: "Every pack includes quality-assurance and security review prompts, not just build steps.",
  },
  {
    icon: ShieldCheck,
    title: "Acceptance criteria included",
    desc: "Each prompt ships with clear acceptance criteria, dependencies, and a complexity estimate.",
  },
  {
    icon: Lock,
    title: "Yours forever",
    desc: "Unlock once for $10 and your full pack is saved to your account — come back and copy it anytime.",
  },
  {
    icon: Sparkles,
    title: "Built for Base44",
    desc: "Copy-paste-ready prompts written specifically for the Base44 builder workflow.",
  },
];

export default function PromptEngineFeatures() {
  return (
    <section className="relative py-24 px-6 bg-card/30 border-y border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">
            Everything in <span className="text-gradient-orange">your prompt pack</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Not a single mega-prompt — a structured, ordered pack that builds your app the right way.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-sora font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}