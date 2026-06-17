import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart3, Eye, Users, Heart, MousePointerClick, Share2, Bookmark } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import StatCard from "@/components/shared/StatCard";
import { PLATFORMS, PLATFORM_MAP } from "@/components/admin/social/socialConfig";
import { trackEvent } from "@/lib/analytics";

const RANGES = [
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
  { key: "all", label: "All time" },
];

export default function SocialAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [range, setRange] = useState("30");
  const [platform, setPlatform] = useState("all");
  const [campaign, setCampaign] = useState("all");

  useEffect(() => {
    trackEvent("admin_social_analytics_view");
    Promise.all([
      base44.entities.SocialPostAnalytics.list("-collected_at", 2000),
      base44.entities.SocialCampaign.list("-created_date", 200),
    ]).then(([an, cam]) => {
      setAnalytics(an);
      setCampaigns(cam);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState label="Loading analytics..." />;

  const cutoff = range === "all" ? null : new Date(Date.now() - parseInt(range) * 24 * 60 * 60 * 1000);
  const rows = analytics.filter((a) => {
    if (platform !== "all" && a.platform !== platform) return false;
    if (campaign !== "all" && a.campaign_id !== campaign) return false;
    if (cutoff && a.collected_at && new Date(a.collected_at) < cutoff) return false;
    return true;
  });

  const sum = (k) => rows.reduce((acc, r) => acc + (r[k] || 0), 0);
  const totals = {
    impressions: sum("impressions"),
    reach: sum("reach"),
    likes: sum("likes"),
    comments: sum("comments"),
    shares: sum("shares") + sum("reposts"),
    clicks: sum("clicks"),
    saves: sum("saves"),
    upvotes: sum("upvotes"),
  };

  const byPlatform = PLATFORMS.map((p) => {
    const pr = rows.filter((r) => r.platform === p.key);
    return {
      ...p,
      posts: pr.length,
      engagement: pr.reduce((a, r) => a + (r.likes || 0) + (r.comments || 0) + (r.shares || 0) + (r.reposts || 0) + (r.saves || 0) + (r.upvotes || 0), 0),
      impressions: pr.reduce((a, r) => a + (r.impressions || 0), 0),
    };
  }).filter((p) => p.posts > 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Social Analytics" description="Track engagement, reach, clicks and growth across platforms and campaigns." />

      <div className="flex flex-wrap gap-3">
        <select value={range} onChange={(e) => setRange(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
          {RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="all">All platforms</option>
          {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="all">All campaigns</option>
          {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {analytics.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics data yet"
          description="Once posts are published, performance metrics will be collected and shown here."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard icon={Eye} label="Impressions" value={totals.impressions.toLocaleString()} />
            <StatCard icon={Users} label="Reach" value={totals.reach.toLocaleString()} />
            <StatCard icon={Heart} label="Likes" value={totals.likes.toLocaleString()} />
            <StatCard icon={MousePointerClick} label="Clicks" value={totals.clicks.toLocaleString()} />
            <StatCard icon={Share2} label="Shares / Reposts" value={totals.shares.toLocaleString()} />
            <StatCard icon={Heart} label="Comments" value={totals.comments.toLocaleString()} />
            <StatCard icon={Bookmark} label="Saves" value={totals.saves.toLocaleString()} />
            <StatCard icon={BarChart3} label="Upvotes" value={totals.upvotes.toLocaleString()} />
          </div>

          <section className="rounded-2xl border border-border bg-card/60 p-5">
            <h2 className="font-sora font-semibold mb-4">By Platform</h2>
            <div className="space-y-2">
              {byPlatform.map((p) => (
                <div key={p.key} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <p.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{p.label}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>{p.posts} posts</span>
                    <span>{p.impressions.toLocaleString()} impressions</span>
                    <span className="text-foreground font-medium">{p.engagement.toLocaleString()} engagement</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}