import React from "react";
import SectionHeading from "@/components/learn/superagent/SectionHeading";
import { LIMITS } from "@/components/learn/superagent/data";

export default function Limits() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeading label="Execution Limits" title="Know the Runtime Boundaries" />
      <div className="grid md:grid-cols-3 gap-5">
        {LIMITS.map((l) => (
          <div key={l.title} className="rounded-2xl border border-border bg-card/70 p-6 text-center">
            <div className="font-sora font-extrabold text-3xl text-gradient-orange mb-2">{l.stat}</div>
            <h3 className="font-sora font-bold text-base mb-2">{l.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{l.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}