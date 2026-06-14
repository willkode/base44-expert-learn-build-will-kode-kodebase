import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Sparkles, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { trackEvent } from "@/lib/analytics";
import RecommendationCard from "@/components/admin/blog/refresh/RecommendationCard";
import { STATUS_FILTERS } from "@/components/admin/blog/refresh/refreshConfig";

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };

// Derive the small metric summary shown on a card from a post's analytics + SC rows.
function buildMetrics(post, analytics, scPages) {
  let pageviews = 0, conversions = 0, maxScroll = 0;
  for (const a of analytics) {
    pageviews += a.pageviews || 0;
    conversions += a.conversions || 0;
    maxScroll = Math.max(maxScroll, a.scrollDepth || 0);
  }
  let scImpr = 0, scClicks = 0, posSum = 0, posN = 0;
  for (const r of scPages) { scImpr += r.impressions || 0; scClicks += r.clicks || 0; if (r.position) { posSum += r.position; posN += 1; } }
  return {
    pageviews, conversions, maxScroll,
    scImpr, scClicks,
    scCtr: scImpr ? Number(((scClicks / scImpr) * 100).toFixed(1)) : 0,
    avgPosition: posN ? Number((posSum / posN).toFixed(1)) : 0,
  };
}

export default function BlogRefresh() {
  const { toast } = useToast();
  const [recs, setRecs] = useState([]);
  const [postsById, setPostsById] = useState({});
  const [metricsByPost, setMetricsByPost] = useState({});
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("open");

  const load = useCallback(async () => {
    const [recRows, posts, analytics, scPages] = await Promise.all([
      base44.entities.BlogContentRefreshRecommendation.list("-created_date", 500),
      base44.entities.BlogPost.list("-publishedAt", 1000),
      base44.entities.BlogPostAnalytics.list("-date", 5000),
      base44.entities.SearchConsolePageData.list("-date", 5000).catch(() => []),
    ]);

    const pMap = {};
    posts.forEach((p) => { pMap[p.id] = p; });

    const anaByPost = {}, scByPost = {};
    analytics.forEach((a) => { (anaByPost[a.blogPostId] ||= []).push(a); });
    scPages.forEach((r) => { if (r.blogPostId) (scByPost[r.blogPostId] ||= []).push(r); });

    const mMap = {};
    Object.keys(pMap).forEach((id) => {
      mMap[id] = buildMetrics(pMap[id], anaByPost[id] || [], scByPost[id] || []);
    });

    setPostsById(pMap);
    setMetricsByPost(mMap);
    setRecs(recRows);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    trackEvent("admin_view_blog_refresh", {});
  }, [load]);

  const handleScan = async () => {
    setScanning(true);
    trackEvent("admin_scan_blog_refresh", {});
    const res = await base44.functions.invoke("generateBlogRefreshRecommendations", {
      include_search_console_data: true,
      include_internal_analytics: true,
    });
    const d = res.data || {};
    if (d.success) {
      toast({ title: "Scan complete", description: `${d.created} new recommendation${d.created === 1 ? "" : "s"} across ${d.evaluated} published posts.` });
      await load();
    } else {
      toast({ title: "Scan failed", description: d.error || "Could not run scan.", variant: "destructive" });
    }
    setScanning(false);
  };

  const handleFixWithAI = async (rec) => {
    setBusyId(rec.id);
    trackEvent("admin_refresh_fix_with_ai", { type: rec.recommendationType });
    const res = await base44.functions.invoke("applyBlogRefreshRecommendationWithAI", { recommendation_id: rec.id });
    const d = res.data || {};
    if (d.success) {
      toast({
        title: d.applied ? "AI refresh applied" : "Marked in progress",
        description: d.applied ? "Saved as a draft revision — review and re-publish from the editor." : (d.message || "Needs manual review."),
      });
      await load();
    } else {
      toast({ title: "Could not apply", description: d.error || "AI refresh failed.", variant: "destructive" });
    }
    setBusyId(null);
  };

  const updateStatus = async (rec, status, eventName) => {
    setBusyId(rec.id);
    trackEvent(eventName, { type: rec.recommendationType });
    await base44.entities.BlogContentRefreshRecommendation.update(rec.id, { status });
    await load();
    setBusyId(null);
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Content Refresh" description="Recommended updates to keep old or underperforming posts ranking." />
        <LoadingState label="Loading recommendations..." />
      </div>
    );
  }

  const filtered = recs
    .filter((r) => statusFilter === "all" || (r.status || "open") === statusFilter)
    .sort((a, b) => (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0));

  return (
    <div>
      <PageHeader
        title="Content Refresh"
        description="AI-detected updates to keep old, weak, or decaying posts ranking. Changes are saved as drafts — never auto-published."
        actions={
          <Button onClick={handleScan} disabled={scanning} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {scanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {scanning ? "Scanning..." : "Scan for recommendations"}
          </Button>
        }
      />

      <div className="flex items-center justify-between gap-3 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} recommendation{filtered.length === 1 ? "" : "s"}</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={RefreshCw}
          title={statusFilter === "open" ? "No open recommendations" : "Nothing here"}
          description="Run a scan to analyze your published posts for SEO gaps, decaying traffic, and ranking opportunities."
          actionLabel="Scan for recommendations"
          onAction={handleScan}
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((rec) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              post={postsById[rec.blogPostId]}
              metrics={metricsByPost[rec.blogPostId]}
              busy={busyId === rec.id}
              onFixWithAI={handleFixWithAI}
              onMarkInProgress={(r) => updateStatus(r, "in_progress", "admin_refresh_mark_in_progress")}
              onDismiss={(r) => updateStatus(r, "dismissed", "admin_refresh_dismiss")}
            />
          ))}
        </div>
      )}
    </div>
  );
}