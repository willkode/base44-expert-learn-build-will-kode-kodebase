import React from "react";
import SectionHeading from "@/components/learn/superagent/SectionHeading";
import { RULES } from "@/components/learn/superagent/data";

export default function Rules() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <SectionHeading label="Operating Rules" title="10 Rules for Developers" />
      <div className="grid sm:grid-cols-2 gap-4">
        {RULES.map((r, i) => (
          <div key={r} className="flex items-start gap-4 rounded-2xl border border-border bg-card/70 p-5">
            <span className="font-sora font-extrabold text-lg text-gradient-orange shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{r}</p>
          </div>
        ))}
      </div>
    </section>
  );
}