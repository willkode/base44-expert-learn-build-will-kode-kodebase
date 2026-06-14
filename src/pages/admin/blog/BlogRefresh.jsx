import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCcw, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import RecommendationCard from "@/components/admin/blog/refresh/RecommendationCard";
import { STATUS_FILTERS } from "@/components/admin/blog/refresh/refreshConfig";

export default function BlogRefresh() {
  const { toast } = useToast();
  const [recs, setRecs] = useState([]);
  const [postsById, setPostsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("open");

  const load = useCallback(async () => {
    setLoading(true);
    const [recRows, postRows] = await Promise.all([
      base44.entities.BlogContentRefreshRecommendation.list("-created_date", 500),
      base44.entities.BlogPost.list("-created_date", 1000),
    ]);
    const map = {};
    postRows.forEach((p) => { map[p.id] = p; });
    setPostsById(map);
    setRecs(recRows);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await base44.functions.invoke("generateBlogRefreshRecommendations", {});
      const created = res.data?.created ?? 0;
      toast({ title: "Scan complete", description: `${created} new recommendation${created === 1 ? "" : "s"} created.` });
      await load();
    } catch (err) {
      toast({ variant: "destructive", title: "Scan failed", description: err?.response?.data?.error || "Please try again." });
    } finally {
      setScanning(false);
    }
  };

  const fixWithAI = async (rec) => {
    setBusyId(rec.id);
    try {
      const res = await base44.functions.invoke("applyBlogRefreshRecommendationWithAI", { recommendation_id: rec.id });
      const manual = res.data?.manual;
      toast({
        title: manual ? "Marked in progress" : "AI refresh applied",
        description: manual
          ? "This recommendation needs manual review."
          : "A draft revision was saved and the post moved to Needs review.",
      });
      await load();
    } catch (err) {
      toast({ variant: "destructive", title: "Couldn't apply", description: err?.response?.data?.error || "Please try again." });
    } finally {
      setBusyId(null);
    }
  };

  const updateStatus = async (rec, status) => {
    setBusyId(rec.id);
    try {
      await base44.entities.BlogContentRefreshRecommendation.update(rec.id, { status });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const visible = recs.filter((r) => filter === "all" || r.status === filter);

  return (
    <div>
      <PageHeader
        title="Content Refresh"
        description="AI-flagged posts that need updates based on traffic, SEO, and engagement signals."
        actions={
          <Button onClick={runScan} disabled={scanning} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {scanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
            Scan posts
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          {STATUS_FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>{f.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <LoadingState label="Loading recommendations..." />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={filter === "open" ? Sparkles : CheckCircle2}
          title={filter === "open" ? "No open recommendations" : "Nothing here"}
          description={filter === "open" ? "Run a scan to surface posts that could be improved." : "No recommendations match this filter."}
        />
      ) : (
        <div className="space-y-4">
          {visible.map((rec) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              post={postsById[rec.blogPostId]}
              metrics={rec.metrics}
              busy={busyId === rec.id}
              onFixWithAI={fixWithAI}
              onMarkInProgress={(r) => updateStatus(r, "in_progress")}
              onDismiss={(r) => updateStatus(r, "dismissed")}
            />
          ))}
        </div>
      )}
    </div>
  );
}