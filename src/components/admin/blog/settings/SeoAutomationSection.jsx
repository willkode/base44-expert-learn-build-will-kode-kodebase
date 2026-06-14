import React from "react";
import { Gauge } from "lucide-react";
import { SettingsCard, ToggleRow } from "./SettingsField";

export default function SeoAutomationSection({ s, set }) {
  return (
    <SettingsCard icon={Gauge} title="SEO Automation" description="Automated SEO assistance across the blog.">
      <div className="space-y-3">
        <ToggleRow label="Enable SEO scoring" hint="Score posts for SEO quality." checked={s.enableSeoScoring} onChange={(v) => set("enableSeoScoring", v)} />
        <ToggleRow label="Enable internal linking suggestions" hint="Suggest internal links between posts." checked={s.enableInternalLinking} onChange={(v) => set("enableInternalLinking", v)} />
        <ToggleRow label="Enable content refresh recommendations" hint="Flag posts that need updates." checked={s.enableContentRefreshRecommendations} onChange={(v) => set("enableContentRefreshRecommendations", v)} />
        <ToggleRow label="Enable keyword tracking" hint="Track target keywords across posts." checked={s.enableKeywordTracking} onChange={(v) => set("enableKeywordTracking", v)} />
        <ToggleRow label="Enable sitemap updates" hint="Keep the sitemap updated as posts change." checked={s.enableSitemapUpdates} onChange={(v) => set("enableSitemapUpdates", v)} />
      </div>
    </SettingsCard>
  );
}