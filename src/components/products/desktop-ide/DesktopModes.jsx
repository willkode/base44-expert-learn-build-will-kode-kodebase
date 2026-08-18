import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { MODES } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopModes() {
  return (
    <DesktopSection eyebrow="Who it is for" headline="Two people, one app">
      <div className="grid md:grid-cols-2 gap-6">
        {MODES.map((m) => (
          <div key={m.title} className="rounded-2xl border border-border bg-card/60 p-7">
            <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
              {m.badge}
            </span>
            <h3 className="font-sora font-semibold text-xl mt-4 mb-3">{m.title}</h3>
            <p className="text-sm text-muted-foreground">{m.body}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl mx-auto mt-8 text-center">
        The split is deliberate. Every capability is present in both modes — advanced mode changes how much is on
        screen, not what the app can do. Turning it off never strands you on a screen you can no longer reach.
      </p>
    </DesktopSection>
  );
}