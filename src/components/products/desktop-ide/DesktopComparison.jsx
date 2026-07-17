import React from "react";
import { X, Check } from "lucide-react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { COMPARISON } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopComparison() {
  return (
    <DesktopSection headline="Replace the scattered Base44 workflow.">
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="grid grid-cols-2 bg-secondary/50 text-sm font-sora font-semibold">
          <div className="px-5 py-3.5 border-r border-border">Without Base44 Desktop</div>
          <div className="px-5 py-3.5 text-gradient-orange">With Base44 Desktop</div>
        </div>
        {COMPARISON.map(([without, withIt], i) => (
          <div key={i} className={`grid grid-cols-2 text-sm ${i % 2 ? "bg-card/40" : "bg-card/70"}`}>
            <div className="px-5 py-3.5 border-r border-t border-border flex items-start gap-2 text-muted-foreground">
              <X className="w-4 h-4 text-destructive mt-0.5 shrink-0" /> {without}
            </div>
            <div className="px-5 py-3.5 border-t border-border flex items-start gap-2">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {withIt}
            </div>
          </div>
        ))}
      </div>
    </DesktopSection>
  );
}