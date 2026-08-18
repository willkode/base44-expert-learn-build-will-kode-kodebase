import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { SECURITY } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopSecurity() {
  return (
    <DesktopSection eyebrow="Security" headline="The boundary is the feature">
      <div className="max-w-3xl mx-auto space-y-5">
        {SECURITY.map((p, i) => (
          <p key={i} className="text-muted-foreground">{p}</p>
        ))}
      </div>
    </DesktopSection>
  );
}