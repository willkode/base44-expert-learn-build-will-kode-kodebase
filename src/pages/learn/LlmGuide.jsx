import React from "react";
import { Settings2, Info } from "lucide-react";
import Seo from "@/components/seo/Seo";
import ModelCard from "@/components/learn/ModelCard";
import LlmQuickReference from "@/components/learn/LlmQuickReference";
import { MODELS } from "@/components/learn/llmModels";

export default function LlmGuide() {
  return (
    <>
      <Seo
        title="Best AI Models for Vibe Coding — LLM Guide | KodeBase"
        description="A practical breakdown of the top AI models for vibe coding — what each one's best at, and exactly when to reach for it."
        path="/learn/llm-guide"
      />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-6xl mx-auto px-6 py-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-7">
              <Settings2 className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">AI LLM Guide</p>
            <h1 className="font-sora font-extrabold text-4xl md:text-5xl tracking-tight mb-5">
              Pick the <span className="text-gradient-orange">Right AI Model</span> for the Job
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A practical breakdown of the top AI models for vibe coding — what each one's best at,
              and exactly when to reach for it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {MODELS.map((m, i) => (
              <ModelCard key={m.name} model={m} index={i} />
            ))}
          </div>

          <div className="mb-12">
            <h2 className="font-sora font-bold text-2xl md:text-3xl mb-6 text-center">Quick Reference</h2>
            <LlmQuickReference />
          </div>

          <div className="flex items-start gap-3 max-w-3xl mx-auto rounded-xl border border-primary/30 bg-primary/10 px-5 py-4">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Model behavior changes over time. Always test each model on your specific task — the
              "best" model is the one that gets your job done with the fewest retries.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}