import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { CRAFT } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopCraft() {
  return (
    <DesktopSection eyebrow="Craft" headline="Built like a tool, not a demo" className="bg-card/30">
      <div className="grid md:grid-cols-2 gap-6">
        {CRAFT.map((c) => (
          <div key={c.title} className="rounded-2xl border border-border bg-card/60 p-6">
            <h3 className="font-sora font-semibold text-lg mb-2">{c.title}</h3>
            <p className="text-sm text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>
    </DesktopSection>
  );
}