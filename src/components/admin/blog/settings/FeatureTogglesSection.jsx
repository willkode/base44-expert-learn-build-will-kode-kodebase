import React from "react";
import { ToggleLeft } from "lucide-react";
import { SettingsCard, ToggleRow } from "./SettingsField";

// Master on/off switches for the whole blog system.
export default function FeatureTogglesSection({ s, set }) {
  return (
    <SettingsCard icon={ToggleLeft} title="Feature Toggles" description="Turn major blog capabilities on or off.">
      <div className="space-y-3">
        <ToggleRow label="Enable blog" hint="Master switch for the entire blog system." checked={s.blogEnabled} onChange={(v) => set("blogEnabled", v)} />
        <ToggleRow label="Enable public blog pages" hint="Show the public-facing blog to visitors." checked={s.enablePublicBlogPages} onChange={(v) => set("enablePublicBlogPages", v)} />
        <ToggleRow label="Enable AI generation" hint="Allow AI to draft blog posts." checked={s.enableAiGeneration} onChange={(v) => set("enableAiGeneration", v)} />
        <ToggleRow label="Enable AI image generation" hint="Allow AI to create featured images." checked={s.enableAiImageGeneration} onChange={(v) => set("enableAiImageGeneration", v)} />
        <ToggleRow label="Enable scheduled publishing" hint="Allow posts to be queued for a future date." checked={s.enableScheduledPublishing} onChange={(v) => set("enableScheduledPublishing", v)} />
        <ToggleRow label="Enable auto-publishing" hint="Publish scheduled posts automatically when due." checked={s.enableAutoPublishing} onChange={(v) => set("enableAutoPublishing", v)} />
        <ToggleRow label="Enable SEO scoring" hint="Score posts for SEO quality." checked={s.enableSeoScoring} onChange={(v) => set("enableSeoScoring", v)} />
        <ToggleRow label="Enable internal linking" hint="Suggest internal links between posts." checked={s.enableInternalLinking} onChange={(v) => set("enableInternalLinking", v)} />
        <ToggleRow label="Enable analytics tracking" hint="Record first-party views, clicks, and scroll depth." checked={s.enableAnalyticsTracking} onChange={(v) => set("enableAnalyticsTracking", v)} />
        <ToggleRow label="Enable content refresh recommendations" hint="Flag old or decaying posts that need updates." checked={s.enableContentRefreshRecommendations} onChange={(v) => set("enableContentRefreshRecommendations", v)} />
        <ToggleRow label="Enable blog repurposing" hint="Allow AI to repurpose posts into other formats." checked={s.enableBlogRepurposing} onChange={(v) => set("enableBlogRepurposing", v)} />
      </div>
    </SettingsCard>
  );
}