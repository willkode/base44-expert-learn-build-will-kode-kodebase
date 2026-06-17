import React from "react";
import { MessageSquare, FileText, Wand2, Copy } from "lucide-react";

const STEPS = [
  {
    icon: MessageSquare,
    title: "Describe your idea",
    desc: "Tell the engine what you want to build. It asks a few smart, grouped questions to fill in roles, data, and permissions.",
  },
  {
    icon: FileText,
    title: "Review your blueprint",
    desc: "Get a complete app blueprint — roles, entities, pages, features, and workflows — with assumptions made explicit.",
  },
  {
    icon: Wand2,
    title: "Generate the prompt pack",
    desc: "Approve the blueprint and the engine compiles an ordered set of build, QA, and security prompts.",
  },
  {
    icon: Copy,
    title: "Build with confidence",
    desc: "Unlock once and copy each prompt straight into Base44 — sequenced so nothing gets built out of order.",
  },
];

export default function PromptEngineHowItWorks() {
  return (
    <section id="how" className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">
            From idea to prompts in <span className="text-gradient-orange">four steps</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            A guided flow that turns a rough concept into a precise, buildable plan.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <div key={i} className="relative rounded-2xl border border-border bg-card p-6">
              <div className="absolute top-5 right-5 font-sora font-bold text-4xl text-secondary/80 select-none">
                {i + 1}
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-sora font-semibold text-base mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}