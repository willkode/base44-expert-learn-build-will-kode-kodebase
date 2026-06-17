import React from "react";
import { PLATFORM_MAP } from "@/components/admin/social/socialConfig";
import { ChartCard, EngagementOverTime, ComparisonBars } from "./AnalyticsCharts";
import TopPostsTable from "./TopPostsTable";
import {
  compactNumber, totalEngagement, totalImpressions, rowEngagement, buildTimeSeries,
  platformLabel,
} from "./analyticsConfig";

export default function CampaignTab({
  rows, jobs, postsById, campaignsById, selectedCampaign, onSelectPost,
}) {
  // jobs = all ScheduledPost records (for published/failed/upcoming counts).
  const campaignJobs = selectedCampaign === "all"
    ? jobs
    : jobs.filter((j) => j.campaign_id === selectedCampaign);

  const published = campaignJobs.filter((j) => j.status === "published");
  const failed = campaignJobs.filter((j) => j.status === "failed");
  const upcoming = campaignJobs.filter((j) => ["queued", "processing"].includes(j.status));

  const series = buildTimeSeries(rows, (r) => r.collected_at);

  // Engagement by platform within the campaign scope.
  const byPlatform = {};
  for (const r of rows) byPlatform[r.platform] = (byPlatform[r.platform] || 0) + rowEngagement(r);
  const platformBars = Object.entries(byPlatform)
    .map(([key, value]) => ({ key, label: platformLabel(key), value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Stat label="Posts published" value={compactNumber(published.length)} />
        <Stat label="Impressions" value={compactNumber(totalImpressions(rows))} />
        <Stat label="Engagement" value={compactNumber(totalEngagement(rows))} />
        <Stat label="Failed posts" value={compactNumber(failed.length)} tone="danger" />
        <Stat label="Upcoming posts" value={compactNumber(upcoming.length)} tone="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Campaign performance over time" subtitle="Daily engagement">
          <EngagementOverTime data={series} />
        </ChartCard>
        <ChartCard title="Engagement by platform" subtitle="Within the selected campaign scope">
          <ComparisonBars data={platformBars} colorByPlatform />
        </ChartCard>
      </div>

      <ChartCard title="Top posts" subtitle="Best performing posts in scope">
        <TopPostsTable rows={rows} postsById={postsById} onSelect={onSelectPost} />
      </ChartCard>

      {(failed.length > 0 || upcoming.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {failed.length > 0 && (
            <ChartCard title="Failed posts" subtitle="Need attention">
              <JobList jobs={failed} postsById={postsById} tone="danger" />
            </ChartCard>
          )}
          {upcoming.length > 0 && (
            <ChartCard title="Upcoming posts" subtitle="Scheduled and queued">
              <JobList jobs={upcoming} postsById={postsById} tone="info" />
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }) {
  const toneCls = tone === "danger" ? "text-red-400" : tone === "info" ? "text-blue-400" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-5">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className={`font-sora font-bold text-2xl ${toneCls}`}>{value}</div>
    </div>
  );
}

function JobList({ jobs, postsById, tone }) {
  const dot = tone === "danger" ? "bg-red-400" : "bg-blue-400";
  return (
    <div className="space-y-2">
      {jobs.slice(0, 8).map((j) => {
        const Icon = PLATFORM_MAP[j.platform]?.icon;
        const post = postsById[j.social_post_id];
        return (
          <div key={j.id} className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm">
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
            <span className="line-clamp-1 flex-1">
              {post?.title_internal || post?.content?.slice(0, 50) || j.platform_post_id || "Post"}
            </span>
            {tone === "danger" && j.error_message && (
              <span className="text-xs text-red-400/80 line-clamp-1 max-w-[40%]">{j.error_message}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}