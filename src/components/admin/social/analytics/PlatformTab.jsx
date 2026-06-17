import React from "react";
import { PLATFORMS, PLATFORM_MAP } from "@/components/admin/social/socialConfig";
import { ChartCard, ComparisonBars } from "./AnalyticsCharts";
import {
  compactNumber, rowEngagement, rowImpressions, sumBy, totalEngagement, totalImpressions,
  engagementRate, platformLabel,
} from "./analyticsConfig";

// Per-platform metric definitions surfaced in the breakdown grid.
const PLATFORM_METRICS = {
  twitter: [["likes", "Likes"], ["comments", "Replies"], ["reposts", "Reposts/Quotes"], ["impressions", "Impressions"], ["clicks", "Clicks"]],
  reddit: [["score", "Score"], ["upvotes", "Upvotes"], ["downvotes", "Downvotes"], ["comments", "Comments"]],
  linkedin: [["reactions", "Reactions"], ["comments", "Comments"], ["shares", "Reposts"], ["impressions", "Impressions"], ["clicks", "Clicks"]],
  facebook: [["facebook_reactions", "Reactions"], ["facebook_comments", "Comments"], ["facebook_shares", "Shares"], ["facebook_clicks", "Clicks"], ["facebook_impressions", "Impressions"], ["facebook_reach", "Reach"], ["facebook_video_views", "Video views"], ["facebook_post_engaged_users", "Engaged users"]],
  instagram: [["instagram_likes", "Likes"], ["instagram_comments", "Comments"], ["instagram_saves", "Saves"], ["instagram_shares", "Shares"], ["instagram_reach", "Reach"], ["instagram_impressions", "Impressions"], ["instagram_reel_plays", "Reel plays"], ["instagram_profile_visits", "Profile visits"], ["instagram_follows", "Follows"]],
};

function PlatformCard({ platformKey, rows }) {
  const meta = PLATFORM_MAP[platformKey];
  const Icon = meta?.icon;
  const metrics = PLATFORM_METRICS[platformKey] || [];
  const hasData = rows.length > 0;
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          <h3 className="font-sora font-semibold text-sm">{meta?.label || platformKey}</h3>
        </div>
        <span className="text-xs text-muted-foreground">{rows.length} posts</span>
      </div>
      {hasData ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {metrics.map(([key, label]) => (
            <div key={key} className="rounded-lg border border-border bg-background/40 px-3 py-2">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="font-sora font-semibold">{compactNumber(sumBy(rows, key))}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No measured posts for this platform yet.</p>
      )}
    </section>
  );
}

export default function PlatformTab({ rows }) {
  const byPlatform = {};
  for (const r of rows) (byPlatform[r.platform] = byPlatform[r.platform] || []).push(r);

  // Platform comparison: engagement rate per platform.
  const comparison = PLATFORMS
    .map((p) => {
      const pr = byPlatform[p.key] || [];
      return { key: p.key, label: p.label, value: engagementRate(pr), posts: pr.length };
    })
    .filter((p) => p.posts > 0)
    .sort((a, b) => b.value - a.value);

  // Meta combined (Facebook + Instagram).
  const metaRows = [...(byPlatform.facebook || []), ...(byPlatform.instagram || [])];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {PLATFORMS.map((p) => (
          <PlatformCard key={p.key} platformKey={p.key} rows={byPlatform[p.key] || []} />
        ))}
        <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <h3 className="font-sora font-semibold text-sm mb-4">Meta combined (Facebook + Instagram)</h3>
          {metaRows.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Metric label="Posts" value={compactNumber(metaRows.length)} />
              <Metric label="Impressions" value={compactNumber(totalImpressions(metaRows))} />
              <Metric label="Engagement" value={compactNumber(totalEngagement(metaRows))} />
              <Metric label="Reach" value={compactNumber(sumBy(metaRows, "reach"))} />
              <Metric label="Clicks" value={compactNumber(sumBy(metaRows, "clicks"))} />
              <Metric label="Eng. rate" value={`${engagementRate(metaRows)}%`} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No Meta posts measured yet.</p>
          )}
        </section>
      </div>

      <ChartCard title="Compare platforms" subtitle="Engagement rate by platform (%)">
        <ComparisonBars data={comparison} colorByPlatform formatter={(v) => `${v}%`} />
      </ChartCard>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-sora font-semibold">{value}</div>
    </div>
  );
}