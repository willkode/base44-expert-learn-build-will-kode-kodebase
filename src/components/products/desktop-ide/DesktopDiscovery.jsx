import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import DesktopShot from "@/components/products/desktop-ide/DesktopShot";
import { SHOTS, SURFACES } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopDiscovery() {
  return (
    <DesktopSection eyebrow="Finding your work" headline="Every app, with its face on" className="bg-card/30">
      <DesktopShot
        src={SHOTS.home}
        alt="Base44 BaaS Desktop home screen showing your apps, superagents and games as tiles"
        caption="Home: your apps, superagents and games as tiles carrying their real artwork — each kind in its own section."
      />
      <div className="max-w-3xl mx-auto space-y-5 mt-12">
        <p className="text-muted-foreground">
          Sign-in uses Base44's own device-code flow: the app shows you a short code, you confirm it in your browser,
          and the credential is held by the Base44 CLI on your machine. Your workspaces load, and every app in them
          appears as a tile carrying its real screenshot or logo.
        </p>
        <p className="text-muted-foreground">
          Base44 returns apps, superagents and games from a single endpoint, which is why most tools show them jumbled
          together. This one reads the app type and gives each its own section, so <em>Your apps</em> means what it
          says. Apps with no artwork fall back to a clean initial rather than an empty frame.
        </p>
      </div>
      <div className="mt-10 max-w-4xl mx-auto rounded-2xl border border-border bg-card/60 divide-y divide-border overflow-hidden">
        {SURFACES.map((s) => (
          <div key={s.name} className="p-5 md:flex md:gap-6">
            <p className="font-sora font-semibold text-sm md:w-40 shrink-0 flex items-center gap-2">
              {s.name}
              {s.advanced && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-primary">Advanced</span>
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-1 md:mt-0">{s.body}</p>
          </div>
        ))}
      </div>
    </DesktopSection>
  );
}