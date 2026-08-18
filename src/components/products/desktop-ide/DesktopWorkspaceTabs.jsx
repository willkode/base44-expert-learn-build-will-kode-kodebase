import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import DesktopShot from "@/components/products/desktop-ide/DesktopShot";
import { SHOTS, TABS } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopWorkspaceTabs() {
  return (
    <DesktopSection id="features" eyebrow="The workspace" headline="Five tabs around one app">
      <DesktopShot
        src={SHOTS.editor}
        alt="The genuine Base44 editor embedded inside the Base44 BaaS Desktop window"
        caption="The Editor tab: the genuine Base44 editor running inside the window, with its own persistent session."
      />
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        {TABS.map((t) => (
          <div key={t.name} className="rounded-2xl border border-border bg-card/60 p-6">
            <h3 className="font-sora font-semibold text-lg mb-2">{t.name}</h3>
            <p className="text-sm text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </div>
    </DesktopSection>
  );
}