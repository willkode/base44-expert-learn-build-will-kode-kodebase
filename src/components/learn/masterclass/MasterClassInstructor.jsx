import React from "react";

export default function MasterClassInstructor() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20 border-t border-border">
      <div className="rounded-2xl border border-border bg-card/50 p-8 md:p-10">
        <h2 className="font-sora font-extrabold text-2xl tracking-tight">
          Taught by <span className="text-gradient-orange">Will Kode</span>
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          A full-stack developer since 1997. This program teaches the development experience,
          judgment, systems, and business practices behind successful vibe coding — not merely a
          collection of prompts. You'll learn to think like a developer, manage AI like an
          engineering team, build reliable products, attract customers, and create a sustainable
          software or agency business.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          KodeBase is an independent service and is not affiliated with, endorsed by, or sponsored
          by Base44 or Anthropic.
        </p>
      </div>
    </section>
  );
}