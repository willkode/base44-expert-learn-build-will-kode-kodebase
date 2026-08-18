import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import DesktopShot from "@/components/products/desktop-ide/DesktopShot";
import { SHOTS, AUDITS } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopAudits() {
  return (
    <DesktopSection eyebrow="Review" headline="Ten audits, run by the AI that knows your app" className="bg-card/30">
      <DesktopShot
        src={SHOTS.audit}
        alt="The Audit menu open, listing security, code quality, permissions and other reviews"
        caption="The Audit menu: pick one category, or run the full sweep as a single message."
      />
      <div className="max-w-3xl mx-auto space-y-5 mt-12">
        <p className="text-muted-foreground">
          Pick an audit from the menu and the app composes a detailed instruction and sends it straight to your Base44
          editor's chat. The review happens inside Base44, which matters: the model there can read your entities,
          backend functions, permission rules and pages as they actually are — including everything that never appears
          in an exported frontend.
        </p>
        <p className="text-muted-foreground">
          Every prompt asks for findings with severity, exact location, cause and fix, ordered worst first. Every prompt
          also explicitly forbids the model from changing anything. An audit that quietly rewrote your app would be a
          very unpleasant surprise.
        </p>
      </div>
      <div className="mt-10 rounded-2xl border border-border bg-card/60 divide-y divide-border overflow-hidden">
        {AUDITS.map((a) => (
          <div key={a.name} className="p-5 md:flex md:gap-6">
            <p className="font-sora font-semibold text-sm md:w-56 shrink-0">{a.name}</p>
            <p className="text-sm text-muted-foreground mt-1 md:mt-0">{a.body}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl mx-auto mt-8 text-center">
        Choose one category, or run the full sweep as a single message so the model can see that a permissions gap and
        an auth gap are often the same bug from two angles. Whichever model your editor is set to answers.
      </p>
    </DesktopSection>
  );
}