import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart3, RefreshCw } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { trackEvent } from "@/lib/analytics";

import AnalyticsFilters from "@/components/admin/social/analytics/AnalyticsFilters";
import AnalyticsWarning from "@/components/admin/social/analytics/AnalyticsWarning";
import OverviewTab from "@/components/admin/social/analytics/OverviewTab";
import CampaignTab from "@/components/admin/social/analytics/CampaignTab";
import PlatformTab from "@/components/admin/social/analytics/PlatformTab";
import InsightsTab from "@/components/admin/social/analytics/InsightsTab";
import AIInsightsCard from "@/components/admin/social/analytics/AIInsightsCard";
import PostDetailDrawer from "@/components/admin/social/analytics/PostDetailDrawer";
import { latestPerPost, jobContentType } from "@/components/admin/social/analytics/analyticsConfig";

const DEFAULT_FILTERS = {
  range: "30", platform: "all", campaign: "all", status: "all", account: "all", contentType: "all",
};

export default function SocialAnalytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [analytics, setAnalytics] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [tab, setTab] = useState("overview");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [detail, setDetail] = useState({ open: false, row: null });

  async function load() {
    const [an, jb, po, cam, acc] = await Promise.all([
      base44.entities.SocialPostAnalytics.list("-collected_at", 3000),
      base44.entities.ScheduledPost.list("-scheduled_at", 2000),
      base44.entities.SocialPost.list("-created_date", 2000),
      base44.entities.SocialCampaign.list("-created_date", 200),
      base44.entities.SocialAccount.list("-last_connected_at", 100),
    ]);
    setAnalytics(an); setJobs(jb); setPosts(po); setCampaigns(cam); setAccounts(acc);
    setLoading(false);
  }

  useEffect(() => { trackEvent("admin_social_analytics_view"); load(); }, []);

  const postsById = useMemo(() => Object.fromEntries(posts.map((p) => [p.id, p])), [posts]);
  const jobsById = useMemo(() => Object.fromEntries(jobs.map((j) => [j.id, j])), [jobs]);
  const campaignsById = useMemo(() => Object.fromEntries(campaigns.map((c) => [c.id, c])), [campaigns]);

  // Filtered, de-duped analytics rows (latest snapshot per post).
  const rows = useMemo(() => {
    const cutoff = filters.range === "all" ? null : new Date(Date.now() - parseInt(filters.range) * 86400000);
    const filtered = analytics.filter((a) => {
      if (filters.platform !== "all" && a.platform !== filters.platform) return false;
      if (filters.campaign !== "all" && a.campaign_id !== filters.campaign) return false;
      if (cutoff && a.collected_at && new Date(a.collected_at) < cutoff) return false;
      if (filters.account !== "all") {
        const job = jobsById[a.scheduled_post_id];
        if (!job || job.social_account_id !== filters.account) return false;
      }
      if (filters.contentType !== "all") {
        const job = jobsById[a.scheduled_post_id];
        if (!job || jobContentType(job, postsById[a.social_post_id]) !== filters.contentType) return false;
      }
      return true;
    });
    return latestPerPost(filtered);
  }, [analytics, filters, jobsById, postsById]);

  async function handleSync() {
    setSyncing(true);
    trackEvent("admin_social_analytics_sync_now");
    try {
      const res = await base44.functions.invoke("syncSocialPostAnalytics", { limit: 60 });
      const d = res?.data || {};
      toast({ title: "Analytics sync complete", description: `${d.synced || 0} synced, ${d.skipped || 0} skipped, ${d.failed || 0} failed.` });
      await load();
    } catch (e) {
      toast({ title: "Sync failed", description: e.message || "Could not sync analytics.", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  }

  function openPost(row) {
    setDetail({ open: true, row });
    setTab((t) => t);
  }

  if (loading) return <LoadingState label="Loading analytics..." />;

  const detailJob = detail.row ? jobsById[detail.row.scheduled_post_id] : null;
  const detailPost = detail.row ? postsById[detail.row.social_post_id] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Analytics"
        description="Performance across X, Reddit, LinkedIn, Facebook, and Instagram."
        actions={
          <Button onClick={handleSync} disabled={syncing} variant="outline">
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync now"}
          </Button>
        }
      />

      <AnalyticsWarning />

      {analytics.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics data yet"
          description="Once posts are published, metrics are collected automatically every few hours. You can also run a sync now."
          actionLabel="Sync now"
          onAction={handleSync}
        />
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaign">Campaign</TabsTrigger>
            <TabsTrigger value="platform">Platform</TabsTrigger>
            <TabsTrigger value="insights">Content insights</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>

          <div className="mt-5 space-y-5">
            <AnalyticsFilters
              filters={filters}
              setFilters={setFilters}
              campaigns={campaigns}
              accounts={accounts}
              show={{
                status: tab === "campaign",
                account: true,
                contentType: tab === "insights" || tab === "overview",
              }}
            />

            <TabsContent value="overview" className="mt-0">
              <OverviewTab rows={rows} postsById={postsById} campaignsById={campaignsById} onSelectPost={openPost} />
            </TabsContent>
            <TabsContent value="campaign" className="mt-0">
              <CampaignTab
                rows={rows}
                jobs={jobs}
                postsById={postsById}
                campaignsById={campaignsById}
                selectedCampaign={filters.campaign}
                onSelectPost={openPost}
              />
            </TabsContent>
            <TabsContent value="platform" className="mt-0">
              <PlatformTab rows={rows} />
            </TabsContent>
            <TabsContent value="insights" className="mt-0">
              <InsightsTab rows={rows} jobsById={jobsById} postsById={postsById} />
            </TabsContent>
            <TabsContent value="ai" className="mt-0">
              <AIInsightsCard
                range={filters.range}
                platform={filters.platform}
                campaign={filters.campaign}
                campaigns={campaigns}
              />
            </TabsContent>
          </div>
        </Tabs>
      )}

      <PostDetailDrawer
        open={detail.open}
        onOpenChange={(open) => setDetail((d) => ({ ...d, open }))}
        row={detail.row}
        post={detailPost}
        job={detailJob}
      />
    </div>
  );
}