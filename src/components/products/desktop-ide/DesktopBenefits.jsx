import React from "react";
import { Check } from "lucide-react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { BENEFITS } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopBenefits() {
  return (
    <DesktopSection
      eyebrow="One Workspace. Complete Control."
      headline="Everything you need to move a Base44 app from idea to production."
      copy="Base44 Desktop gives you a structured development environment around the Base44 platform, helping you build faster, reduce mistakes, and understand exactly what is happening inside every project."
      className="bg-card/30"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BENEFITS.map((b, i) => (
          <div key={b.title} className="rounded-2xl border border-border bg-card/60 p-6 flex flex-col">
            <span className="font-sora font-extrabold text-3xl text-gradient-orange mb-3">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-sora font-semibold text-lg mb-2">{b.title}</h3>
            <p className="text-sm text-muted-foreground flex-1">{b.body}</p>
            <p className="mt-4 flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="font-medium">{b.benefit}</span>
            </p>
          </div>
        ))}
      </div>
    </DesktopSection>
  );
}