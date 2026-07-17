import React from "react";
import { Check, ShieldCheck } from "lucide-react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { WHY_DESKTOP, SAFETY } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopWhy() {
  return (
    <>
      <DesktopSection
        eyebrow="Why a Desktop Application?"
        headline="Because serious development requires more than another browser tab."
        copy="A desktop application can securely coordinate the local and cloud tools involved in Base44 development. Base44 Desktop can work with your local project files, Base44 CLI, Git repository, secure operating-system credential storage, testing browsers, and development runtimes without exposing unrestricted access to a web page."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_DESKTOP.map((b) => (
            <div key={b.title} className="rounded-2xl border border-border bg-card/60 p-6">
              <Check className="w-5 h-5 text-primary mb-3" />
              <h3 className="font-sora font-semibold text-base mb-1.5">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </DesktopSection>

      <DesktopSection
        eyebrow="Built for Safe Development"
        headline="Powerful enough to manage production projects. Careful enough to protect them."
        copy="Base44 Desktop is designed around explicit permissions, least-privilege access, reviewable changes, and clear confirmation before risky operations."
        className="bg-card/30"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAFETY.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card/60 p-6">
              <ShieldCheck className="w-5 h-5 text-primary mb-3" />
              <h3 className="font-sora font-semibold text-base mb-1.5">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </DesktopSection>
    </>
  );
}