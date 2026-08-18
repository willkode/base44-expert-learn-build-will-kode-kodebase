import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import DesktopShot from "@/components/products/desktop-ide/DesktopShot";
import { SHOTS } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopPromptLibrary() {
  return (
    <DesktopSection eyebrow="Prompt library" headline="The instructions you keep retyping">
      <DesktopShot
        src={SHOTS.prompt}
        alt="The Prompt menu open, showing saved prompts ready to send into the editor chat"
        caption="Saved prompts fire straight into any app's editor chat, from the Prompt menu."
      />
      <p className="text-muted-foreground max-w-3xl mx-auto mt-12 text-center">
        Save prompts once and fire them into any app's chat from the Prompt menu. The app ships with a starter set —
        polish the current UI, find and fix bugs, improve the mobile experience — and your own are stored locally,
        titled and described, available across every app you own.
      </p>
    </DesktopSection>
  );
}