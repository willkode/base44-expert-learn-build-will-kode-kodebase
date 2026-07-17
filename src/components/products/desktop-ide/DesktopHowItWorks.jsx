import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { STEPS, WORKFLOW } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopHowItWorks() {
  return (
    <>
      <DesktopSection
        eyebrow="From Connection to Production"
        headline="Start working in three simple steps."
        className="bg-card/30"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card/60 p-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] flex items-center justify-center font-sora font-bold text-[#0a0f1e] mb-4">
                {i + 1}
              </div>
              <h3 className="font-sora font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </DesktopSection>

      <DesktopSection headline="Go from scattered development to a repeatable production workflow.">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {WORKFLOW.map((w, i) => (
            <div key={w.title} className="rounded-xl border border-border bg-card/60 p-4 text-center">
              <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Step {i + 1}</span>
              <h3 className="font-sora font-semibold text-sm mt-1 mb-2">{w.title}</h3>
              <p className="text-xs text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>
      </DesktopSection>
    </>
  );
}