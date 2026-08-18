import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { SPECS } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopSpecs() {
  return (
    <DesktopSection eyebrow="Under the hood" headline="Specifications" className="bg-card/30">
      <div className="max-w-4xl mx-auto rounded-2xl border border-border bg-card/60 divide-y divide-border overflow-hidden">
        {SPECS.map((s) => (
          <div key={s.item} className="p-5 md:flex md:gap-6">
            <p className="font-sora font-semibold text-sm md:w-48 shrink-0">{s.item}</p>
            <p className="text-sm text-muted-foreground mt-1 md:mt-0">{s.detail}</p>
          </div>
        ))}
      </div>
    </DesktopSection>
  );
}