import React from "react";
import { Eye, Activity, MousePointerClick, FileText, Trophy, Megaphone, Star } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import { PLATFORM_MAP } from "@/components/admin/social/socialConfig";
import { ChartCard, EngagementOverTime, PostsByPlatform } from "./AnalyticsCharts";
import TopPostsTable from "./TopPostsTable";
import {
  compactNumber, totalEngagement, totalImpressions, sumBy, engagementRate,
  rowEngagement, buildTimeSeries, platformLabel,
} from "./analyticsConfig";

export default function OverviewTab({ rows, postsById, campaignsById, onSelectPost }) {
  const posts = rows.length;
  const impressions = totalImpressions(rows);
  const engagement = totalEngagement(rows);
  const clicks = sumBy(rows, "clicks");
  const rate = engagementRate(rows);

  // Best platform by engagement.
  const platformAgg = {};
  for (const r of rows) {
    const a = platformAgg[r.platform] || { engagement: 0, posts: 0 };
    a.engagement += rowEngagement(r);
    a.posts += 1;
    platformAgg[r.platform] = a;
  }
  const bestPlatform = Object.entries(platformAgg).sort((a, b) => b[1].engagement - a[1].engagement)[0];

  // Best campaign by engagement.
  const campaignAgg = {};
  for (const r of rows) {
    if (!r.campaign_id) continue;
    campaignAgg[r.campaign_id] = (campaignAgg[r.campaign_id] || 0) + rowEngagement(r);
  }
  const bestCampaign = Object.entries(campaignAgg).sort((a, b) => b[1] - a[1])[0];

  // Best single post.
  const bestPost = [...rows].sort((a, b) => rowEngagement(b) - rowEngagement(a))[0];

  const series = buildTimeSeries(rows, (r) => r.collected_at);
  const byPlatform = Object.entries(platformAgg)
    .map(([key, v]) => ({ key, label: platformLabel(key), posts: v.posts }))
    .sort((a, b) => b.posts - a.posts);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={FileText} label="Posts measured" value={compactNumber(posts)} />
        <StatCard icon={Eye} label="Impressions" value={compactNumber(impressions)} />
        <StatCard icon={Activity} label="Engagement" value={compactNumber(engagement)} />
        <StatCard icon={MousePointerClick} label="Clicks" value={compactNumber(clicks)} />
        <StatCard icon={Activity} label="Engagement rate" value={`${rate}%`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BestCard
          icon={Trophy}
          label="Best platform"
          value={bestPlatform ? platformLabel(bestPlatform[0]) : "—"}
          hint={bestPlatform ? `${compactNumber(bestPlatform[1].engagement)} engagement` : "No data"}
        />
        <BestCard
          icon={Megaphone}
          label="Best campaign"
          value={bestCampaign ? (campaignsById[bestCampaign[0]]?.name || "Campaign") : "—"}
          hint={bestCampaign ? `${compactNumber(bestCampaign[1])} engagement` : "No campaign data"}
        />
        <BestCard
          icon={Star}
          label="Best post"
          value={bestPost ? (postsById[bestPost.social_post_id]?.title_internal || (PLATFORM_MAP[bestPost.platform]?.label + " post")) : "—"}
          hint={bestPost ? `${compactNumber(rowEngagement(bestPost))} engagement` : "No data"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Engagement over time" subtitle="Daily engagement across all selected posts">
          <EngagementOverTime data={series} />
        </ChartCard>
        <ChartCard title="Posts by platform" subtitle="Volume of measured posts per platform">
          <PostsByPlatform data={byPlatform} />
        </ChartCard>
      </div>

      <ChartCard title="Top posts" subtitle="Ranked by total engagement">
        <TopPostsTable rows={rows} postsById={postsById} onSelect={onSelectPost} />
      </ChartCard>
    </div>
  );
}

function BestCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Icon className="w-4 h-4 text-primary" /> {label}
      </div>
      <div className="font-sora font-semibold text-lg line-clamp-1">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}