import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import DesktopFeatureCard from "@/components/products/desktop-ide/DesktopFeatureCard";
import { PROOF } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopProof() {
  return (
    <DesktopSection
      eyebrow="Proof"
      headline="Evidence, not assurances"
      copy="A migrated app that looks fine and fails at sign-in a week later is worse than one that fails immediately. So the app checks its own work from the running copy's real origin."
    >
      <div className="grid md:grid-cols-2 gap-6">
        {PROOF.map((p) => (
          <DesktopFeatureCard key={p.title} image={p.image} alt={p.title}>
            <h3 className="font-sora font-semibold text-lg mb-2">{p.title}</h3>
            <p className="text-sm text-muted-foreground">{p.body}</p>
          </DesktopFeatureCard>
        ))}
      </div>
    </DesktopSection>
  );
}