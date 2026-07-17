import React from "react";
import { Check } from "lucide-react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { OUTCOMES } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopOutcome() {
  return (
    <DesktopSection
      eyebrow="Build With Speed Without Losing Control"
      headline="Spend less time managing your workflow—and more time improving your application."
      copy="With Base44 Desktop, you can:"
      className="bg-card/30"
    >
      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        {OUTCOMES.map((o) => (
          <p key={o} className="flex items-start gap-2.5 text-sm">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {o}
          </p>
        ))}
      </div>
    </DesktopSection>
  );
}