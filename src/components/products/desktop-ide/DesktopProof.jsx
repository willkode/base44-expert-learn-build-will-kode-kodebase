import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
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
          <div key={p.title} className="rounded-2xl border border-border bg-card/60 p-6">
            <h3 className="font-sora font-semibold text-lg mb-2">{p.title}</h3>
            <p className="text-sm text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>
    </DesktopSection>
  );
}