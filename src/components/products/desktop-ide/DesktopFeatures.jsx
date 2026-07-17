import React from "react";
import { LayoutDashboard, Boxes, FileCode2, Vault, FlaskConical, ShieldCheck, Bot, Plug, Network, ScrollText, StickyNote } from "lucide-react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { FEATURES } from "@/components/products/desktop-ide/desktopIdeData";

const ICONS = [LayoutDashboard, Boxes, FileCode2, Vault, FlaskConical, ShieldCheck, Bot, Plug, Network, ScrollText, StickyNote];

export default function DesktopFeatures() {
  return (
    <div id="features">
      <DesktopSection
        eyebrow="A Complete Base44 Development Environment"
        headline="Built around the way serious Base44 projects are actually managed."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = ICONS[i];
            return (
              <div key={f.name} className="rounded-2xl border border-border bg-card/60 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#0a0f1e]" />
                  </div>
                  <div>
                    <h3 className="font-sora font-semibold text-base leading-tight">{f.name}</h3>
                    <p className="text-xs text-primary">{f.tagline}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{f.body}</p>
                <div className="flex flex-wrap gap-1.5">
                  {f.items.map((item) => (
                    <span key={item} className="text-[11px] rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-muted-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DesktopSection>
    </div>
  );
}