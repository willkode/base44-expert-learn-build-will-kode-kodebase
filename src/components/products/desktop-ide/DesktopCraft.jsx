import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import DesktopFeatureCard from "@/components/products/desktop-ide/DesktopFeatureCard";
import { CRAFT } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopCraft() {
  return (
    <DesktopSection eyebrow="Craft" headline="Built like a tool, not a demo" className="bg-card/30">
      <div className="grid md:grid-cols-2 gap-6">
        {CRAFT.map((c) => (
          <DesktopFeatureCard key={c.title} image={c.image} alt={c.title}>
            <h3 className="font-sora font-semibold text-lg mb-2">{c.title}</h3>
            <p className="text-sm text-muted-foreground">{c.body}</p>
          </DesktopFeatureCard>
        ))}
      </div>
    </DesktopSection>
  );
}