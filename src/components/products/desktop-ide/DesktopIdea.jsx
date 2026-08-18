import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { IDEA } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopIdea() {
  return (
    <DesktopSection eyebrow="The idea" headline="Your Base44 account, on your machine" className="bg-card/30">
      <div className="max-w-3xl mx-auto space-y-5">
        {IDEA.map((p, i) => (
          <p key={i} className={`text-muted-foreground ${i === 0 ? "text-lg" : ""}`}>{p}</p>
        ))}
      </div>
    </DesktopSection>
  );
}