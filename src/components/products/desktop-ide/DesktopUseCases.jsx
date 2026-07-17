import React from "react";
import { User, Building2, Crown, Users, ShieldQuestion } from "lucide-react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { USE_CASES } from "@/components/products/desktop-ide/desktopIdeData";

const ICONS = [User, Building2, Crown, Users, ShieldQuestion];

export default function DesktopUseCases() {
  return (
    <DesktopSection
      eyebrow="Built for More Than Basic App Creation"
      headline="One desktop app for every stage of your Base44 workflow."
      className="bg-card/30"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {USE_CASES.map((u, i) => {
          const Icon = ICONS[i];
          return (
            <div key={u.title} className="rounded-2xl border border-border bg-card/60 p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-sora font-semibold text-lg mb-2">{u.title}</h3>
              <p className="text-sm text-muted-foreground">{u.body}</p>
            </div>
          );
        })}
      </div>
    </DesktopSection>
  );
}