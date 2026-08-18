import React from "react";
import { Minus } from "lucide-react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { LIMITS } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopLimits() {
  return (
    <DesktopSection eyebrow="Straight answers" headline="What it does not do">
      <div className="max-w-3xl mx-auto">
        <p className="text-muted-foreground mb-8">
          It does not move your backend. Entities, functions, users and data stay on Base44. This tool relocates the
          frontend and keeps it pointed at that backend. If you want off Base44 entirely, this is a first step, not the
          whole journey.
        </p>
        <ul className="space-y-3">
          {LIMITS.map((l) => (
            <li key={l} className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4">
              <Minus className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{l}</span>
            </li>
          ))}
        </ul>
      </div>
    </DesktopSection>
  );
}