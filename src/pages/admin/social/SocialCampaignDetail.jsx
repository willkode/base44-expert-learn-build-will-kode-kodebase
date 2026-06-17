import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Pencil, Eye, Users, MousePointerClick, Activity,
  Facebook, Instagram, AlertTriangle, ListChecks, CalendarClock, Send,
} from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/admin/social/StatusBadge";
import { Button } from "@/components/ui/button";
import { PLATFORMS, PLATFORM_MAP, CAMPAIGN_STATUS_STYLES, prettyLabel, formatDateTime } from "@/components/admin/social/socialConfig";
import { GOAL_LABELS, NON_PUBLISHING_STATUSES } from "@/components/admin/social/campaign/campaignConfig";
import {
  summarizeAnalytics, platformBreakdown, facebookPerformance, instagramPerformance,
} from "@/components/admin/social/campaign/campaignMetrics";
import PostQueueList from "@/components/admin/social/campaign/PostQueueList";
import CampaignFormDialog from "@/components/admin/social/campaign/CampaignFormDialog";
import { trackEvent } from "@/lib/analytics";

const CARD = "rounded-2xl border border-border bg-card/60 p-5";

export default function SocialCampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [posts, setPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [editOpen, setEditOpen] = useState(false);

  const load = () => {
    Promise.all([
      base44.entities.SocialCampaign.list("-created_date", 300),
      base44.entities.SocialPost.filter({ campaign_id: id }, "-created_date", 500),
      base44.entities.ScheduledPost.filter({ campaign_id: id }, "-scheduled_at", 500),
      base44.entities.SocialPostAnalytics.filter({ campaign_id: id }, "-collected_at", 1000),
    ]).then(([cams, p, j, a]) => {
      setCampaign(cams.find((c) => c.id === id) || null);
      setPosts(p);
      setJobs(j);
      setAnalytics(a);
      setLoading(false);
    });
  };

  useEffect(() => {
    trackEvent("admin_social_campaign_detail_view");
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingState label="Loading campaign..." />;
  if (!campaign) {
    return (
      <div className="space-y-4">
        <ErrorState
          title="Campaign not found"
          description="This campaign may have been removed."
          onRetry={() => navigate("/admin/marketing/social/campaigns")}
        />
        <div className="text-center">
          <Link to="/admin/marketing/social/campaigns" className="text-sm text-primary hover:underline">
            Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  const queue = posts.filter((p) => ["draft", "needs_review", "revision_requested"].includes(p.approval_status));
  const scheduled = jobs.filter((j) => j.status === "queued");
  const published = jobs.filter((j) => j.status === "published");
  const failed = jobs.filter((j) => j.status === "failed");

  const totals = summarizeAnalytics(analytics);
  const byPlatform = platformBreakdown(analytics, PLATFORMS);
  const fb = facebookPerformance(analytics);
  const ig = instagramPerformance(analytics);

  const notPublishing = NON_PUBLISHING_STATUSES.includes(campaign.status);

  return (
    <div className="space-y-6">
      <Link to="/admin/marketing/social/campaigns" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> All campaigns
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-sora font-bold text-2xl md:text-3xl tracking-tight">{campaign.name}</h1>
            <StatusBadge value={campaign.status} styleMap={CAMPAIGN_STATUS_STYLES} />
          </div>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {GOAL_LABELS[campaign.goal] || prettyLabel(campaign.goal)}
            {campaign.start_date ? ` • ${formatDateTime(campaign.start_date)}` : ""}
            {campaign.end_date ? ` → ${formatDateTime(campaign.end_date)}` : ""}
          </p>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="w-4 h-4 mr-1.5" /> Edit campaign
        </Button>
      </div>

      {notPublishing && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-200">
            This campaign is <span className="font-medium">{prettyLabel(campaign.status)}</span> — its posts will not be
            published while in this status. Set it to <span className="font-medium">Active</span> to resume publishing.
          </p>
        </div>
      )}

      {/* Overview */}
      {(campaign.description || campaign.key_message || campaign.target_audience || campaign.landing_page_url || (campaign.content_themes || []).length > 0) && (
        <section className={CARD}>
          <h2 className="font-sora font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {campaign.description && <Detail label="Description" value={campaign.description} />}
            {campaign.key_message && <Detail label="Key message" value={campaign.key_message} />}
            {campaign.target_audience && <Detail label="Target audience" value={campaign.target_audience} />}
            {campaign.offer_details && <Detail label="Offer / product" value={campaign.offer_details} />}
            {campaign.landing_page_url && (
              <Detail label="Landing page" value={<a href={campaign.landing_page_url} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">{campaign.landing_page_url}</a>} />
            )}
            <Detail label="Posting frequency" value={prettyLabel(campaign.posting_frequency)} />
            <Detail label="Approval required" value={campaign.approval_required !== false ? "Yes" : "No"} />
            <Detail
              label="Platforms"
              value={
                <span className="inline-flex items-center gap-1.5">
                  {(campaign.default_platforms || []).map((pl) => {
                    const P = PLATFORM_MAP[pl];
                    return P?.icon ? <P.icon key={pl} className="w-4 h-4 text-muted-foreground" /> : null;
                  })}
                </span>
              }
            />
          </div>
          {(campaign.content_themes || []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {campaign.content_themes.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs">{t}</span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Status counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={ListChecks} label="In Queue" value={queue.length} />
        <StatCard icon={CalendarClock} label="Scheduled" value={scheduled.length} />
        <StatCard icon={Send} label="Published" value={published.length} />
        <StatCard icon={AlertTriangle} label="Failed" value={failed.length} />
      </div>

      {/* Analytics summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Impressions" value={totals.impressions.toLocaleString()} />
        <StatCard icon={Users} label="Reach" value={totals.reach.toLocaleString()} />
        <StatCard icon={MousePointerClick} label="Clicks" value={totals.clicks.toLocaleString()} />
        <StatCard icon={Activity} label="Engagement" value={totals.engagement.toLocaleString()} />
      </div>

      {/* Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className={CARD}>
          <h2 className="font-sora font-semibold mb-4">Content Queue</h2>
          <PostQueueList posts={queue} emptyText="No drafts or posts awaiting review." />
        </section>
        <section className={CARD}>
          <h2 className="font-sora font-semibold mb-4">Failed Posts</h2>
          {failed.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No failed posts.</p>
          ) : (
            <ul className="space-y-2">
              {failed.map((j) => {
                const P = PLATFORM_MAP[j.platform];
                return (
                  <li key={j.id} className="flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {P?.icon && <P.icon className="w-4 h-4 text-red-400 shrink-0" />}
                      <span className="text-sm truncate">{j.error_message || "Publishing failed"}</span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(j.last_attempt_at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Platform breakdown */}
      <section className={CARD}>
        <h2 className="font-sora font-semibold mb-4">Platform Breakdown</h2>
        {byPlatform.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No analytics collected yet.</p>
        ) : (
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
        )}
      </section>

      {/* FB + IG performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className={CARD}>
          <div className="flex items-center gap-2 mb-4">
            <Facebook className="w-4 h-4 text-primary" />
            <h2 className="font-sora font-semibold">Facebook Performance</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Metric label="Posts" value={fb.posts} />
            <Metric label="Reach" value={fb.reach} />
            <Metric label="Impressions" value={fb.impressions} />
            <Metric label="Reactions" value={fb.reactions} />
            <Metric label="Comments" value={fb.comments} />
            <Metric label="Shares" value={fb.shares} />
          </div>
        </section>
        <section className={CARD}>
          <div className="flex items-center gap-2 mb-4">
            <Instagram className="w-4 h-4 text-primary" />
            <h2 className="font-sora font-semibold">Instagram Performance</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Metric label="Posts" value={ig.posts} />
            <Metric label="Reach" value={ig.reach} />
            <Metric label="Impressions" value={ig.impressions} />
            <Metric label="Likes" value={ig.likes} />
            <Metric label="Saves" value={ig.saves} />
            <Metric label="Plays" value={ig.plays} />
          </div>
        </section>
      </div>

      <CampaignFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        campaign={campaign}
        onSaved={() => load()}
      />
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <div className="text-foreground">{value}</div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 py-3">
      <div className="font-sora font-bold text-lg">{(value || 0).toLocaleString()}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}