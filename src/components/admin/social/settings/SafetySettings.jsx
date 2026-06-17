import React from "react";
import { ShieldCheck } from "lucide-react";
import { SettingsSection, ToggleRow } from "./settingsPrimitives";

export default function SafetySettings({ safety, update }) {
  return (
    <SettingsSection icon={ShieldCheck} title="Safety settings" description="Guardrails that block risky or off-brand posts.">
      <ToggleRow label="Block auto-posting without approval" checked={safety.blockAutoPostingWithoutApproval} onChange={(v) => update("blockAutoPostingWithoutApproval", v)} />
      <ToggleRow label="Block duplicate posts" checked={safety.blockDuplicatePosts} onChange={(v) => update("blockDuplicatePosts", v)} />
      <ToggleRow label="Block posts with missing landing page if campaign requires one" checked={safety.blockMissingLandingPageWhenRequired} onChange={(v) => update("blockMissingLandingPageWhenRequired", v)} />
      <ToggleRow label="Block Reddit promotional posts unless confirmed" checked={safety.blockRedditPromotionalUnlessConfirmed} onChange={(v) => update("blockRedditPromotionalUnlessConfirmed", v)} />
      <ToggleRow label="Block Facebook engagement-bait posts unless confirmed" checked={safety.blockFacebookEngagementBaitUnlessConfirmed} onChange={(v) => update("blockFacebookEngagementBaitUnlessConfirmed", v)} />
      <ToggleRow label="Block Instagram text-only posts" checked={safety.blockInstagramTextOnly} onChange={(v) => update("blockInstagramTextOnly", v)} />
      <ToggleRow label="Block posting when account token is expired" checked={safety.blockPostingWhenTokenExpired} onChange={(v) => update("blockPostingWhenTokenExpired", v)} />
      <ToggleRow label="Pause campaign after repeated failures" checked={safety.pauseCampaignAfterRepeatedFailures} onChange={(v) => update("pauseCampaignAfterRepeatedFailures", v)} />
      <ToggleRow label="Notify user after failed publishing" checked={safety.notifyAfterFailedPublishing} onChange={(v) => update("notifyAfterFailedPublishing", v)} />
    </SettingsSection>
  );
}