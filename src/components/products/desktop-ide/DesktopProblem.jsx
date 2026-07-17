import React from "react";
import { Unplug, EyeOff, RefreshCcw, AlertTriangle } from "lucide-react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { PAIN_POINTS } from "@/components/products/desktop-ide/desktopIdeData";

const ICONS = [Unplug, EyeOff, RefreshCcw, AlertTriangle];

export default function DesktopProblem() {
  return (
    <DesktopSection
      eyebrow="Base44 Development Gets Complicated Fast"
      headline="Your app may live in Base44, but your workflow is scattered everywhere else."
      copy="Building a serious Base44 application often means switching between the Base44 editor, local files, GitHub, the CLI, documentation, API dashboards, testing tools, notes, spreadsheets, and browser tabs. That scattered workflow makes it harder to understand what changed, what is broken, what is secure, and whether the application is ready to launch. Base44 Desktop brings those workflows together."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PAIN_POINTS.map((p, i) => {
          const Icon = ICONS[i];
          return (
            <div key={p.title} className="rounded-2xl border border-border bg-card/60 p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-sora font-semibold text-lg mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.body}</p>
            </div>
          );
        })}
      </div>
    </DesktopSection>
  );
}