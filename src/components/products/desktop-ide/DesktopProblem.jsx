import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { PAIN_POINTS } from "@/components/products/desktop-ide/desktopIdeData";

const IMAGES = [
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/defcc0865_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/033e8fb4a_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/b417ad7ba_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c58f5ff0e_generated_image.png",
];

export default function DesktopProblem() {
  return (
    <DesktopSection
      eyebrow="Base44 Development Gets Complicated Fast"
      headline="Your app may live in Base44, but your workflow is scattered everywhere else."
      copy="Building a serious Base44 application often means switching between the Base44 editor, local files, GitHub, the CLI, documentation, API dashboards, testing tools, notes, spreadsheets, and browser tabs. That scattered workflow makes it harder to understand what changed, what is broken, what is secure, and whether the application is ready to launch. Base44 Desktop brings those workflows together."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PAIN_POINTS.map((p, i) => (
          <div key={p.title} className="rounded-2xl border border-border bg-card/60 overflow-hidden">
            <img src={IMAGES[i]} alt={p.title} className="w-full aspect-video object-cover" />
            <div className="p-6">
              <h3 className="font-sora font-semibold text-lg mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.body}</p>
            </div>
          </div>
        ))}
      </div>
    </DesktopSection>
  );
}