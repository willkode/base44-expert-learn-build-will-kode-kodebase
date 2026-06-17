import React from "react";
import { Gauge } from "lucide-react";
import { SettingsSection, NumberRow } from "./settingsPrimitives";

export default function UsageLimitSettings({ limits, update }) {
  return (
    <SettingsSection icon={Gauge} title="Usage limits" description="Caps to control cost and volume.">
      <NumberRow label="Max campaigns" value={limits.maxCampaigns} onChange={(v) => update("maxCampaigns", v)} min={0} max={1000} />
      <NumberRow label="Max generated posts per day" value={limits.maxGeneratedPostsPerDay} onChange={(v) => update("maxGeneratedPostsPerDay", v)} min={0} max={1000} />
      <NumberRow label="Max scheduled posts" value={limits.maxScheduledPosts} onChange={(v) => update("maxScheduledPosts", v)} min={0} max={10000} />
      <NumberRow label="Max connected accounts" value={limits.maxConnectedAccounts} onChange={(v) => update("maxConnectedAccounts", v)} min={0} max={100} />
      <NumberRow label="Max AI images per month" value={limits.maxAiImagesPerMonth} onChange={(v) => update("maxAiImagesPerMonth", v)} min={0} max={5000} />
      <NumberRow label="Max Facebook Pages" value={limits.maxFacebookPages} onChange={(v) => update("maxFacebookPages", v)} min={0} max={100} />
      <NumberRow label="Max Instagram accounts" value={limits.maxInstagramAccounts} onChange={(v) => update("maxInstagramAccounts", v)} min={0} max={100} />
      <NumberRow label="Max Instagram media posts per day" value={limits.maxInstagramMediaPostsPerDay} onChange={(v) => update("maxInstagramMediaPostsPerDay", v)} min={0} max={100} />
    </SettingsSection>
  );
}