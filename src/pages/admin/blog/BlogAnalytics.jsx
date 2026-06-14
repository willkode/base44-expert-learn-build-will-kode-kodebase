import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart3 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AnalyticsFilters from "@/components/admin/blog/analytics/AnalyticsFilters";
import OverviewTab from "@/components/admin/blog/analytics/OverviewTab";
import PostsTab from "@/components/admin/blog/analytics/PostsTab";
import PerformanceTab from "@/components/admin/blog/analytics/PerformanceTab";
import { trackEvent } from "@/lib/analytics";

const DEFAULT_FILTERS = { range: "30", category: "", tag: "", author: "", status: "", source: "" };

// Convert the range filter into startDate/endDate (UTC, YYYY-MM-DD).
function rangeToDates(range) {
  if (range === "all") return {};
  const days = parseInt(range, 10) || 30;
  const end = new Date();
  const start = new Date(Date.now() - days * 86400000);
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
}

export default function BlogAnalytics() {
  const [posts, setPosts] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [overview, setOverview] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BlogPost.list("-created_date", 2000).then(setPosts);
    trackEvent("admin_view_blog_analytics", {});
  }, []);

  const dateRange = useMemo(() => rangeToDates(filters.range), [filters.range]);

  const queryPayload = useMemo(() => ({
    ...dateRange,
    category: filters.category || undefined,
    tag: filters.tag || undefined,
    author: filters.author || undefined,
    status: filters.status || undefined,
    source: filters.source || undefined,
  }), [dateRange, filters]);

  const load = useCallback(async () => {
    setLoading(true);
    const [ov, perf] = await Promise.all([
      base44.functions.invoke("getBlogAnalyticsOverview", queryPayload),
      base44.functions.invoke("getBlogConversionAnalytics", dateRange),
    ]);
    setOverview(ov.data?.success ? ov.data : null);
    setPerformance(perf.data?.success ? perf.data : null);
    setLoading(false);
  }, [queryPayload, dateRange]);

  useEffect(() => { load(); }, [load]);

  // Filter option lists derived from posts.
  const categories = useMemo(() => [...new Set(posts.map((p) => p.category).filter(Boolean))].sort(), [posts]);
  const tags = useMemo(() => [...new Set(posts.flatMap((p) => p.tags || []))].sort(), [posts]);
  const authors = useMemo(() => [...new Set(posts.map((p) => p.author).filter(Boolean))].sort(), [posts]);

  return (
    <div>
      <PageHeader
        title="Blog Analytics"
        description="Post performance, traffic sources, engagement, and conversions."
      />

      <AnalyticsFilters
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        tags={tags}
        authors={authors}
      />

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Post analytics</TabsTrigger>
          <TabsTrigger value="performance">Content performance</TabsTrigger>
        </TabsList>

        {loading ? (
          <LoadingState label="Loading analytics..." />
        ) : (
          <>
            <TabsContent value="overview"><OverviewTab data={overview} /></TabsContent>
            <TabsContent value="posts"><PostsTab posts={posts} dateRange={dateRange} /></TabsContent>
            <TabsContent value="performance"><PerformanceTab data={performance} /></TabsContent>
          </>
        )}
      </Tabs>

      {!loading && !overview && (
        <div className="text-center py-16 text-muted-foreground">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No analytics data yet. Metrics appear as published posts get traffic.</p>
        </div>
      )}
    </div>
  );
}