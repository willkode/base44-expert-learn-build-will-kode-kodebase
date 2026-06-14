import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Eye, Users, Clock, ArrowDownWideNarrow, MousePointerClick, Link2, Sparkles, CalendarDays } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import SourceBreakdown from "./SourceBreakdown";
import LoadingState from "@/components/shared/LoadingState";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

const fmtTime = (s) => {
  if (!s) return "0s";
  const m = Math.floor(s / 60);
  return m ? `${m}m ${s % 60}s` : `${s}s`;
};

export default function PostsTab({ posts, dateRange }) {
  const published = posts.filter((p) => p.status === "published");
  const [selectedId, setSelectedId] = useState(published[0]?.id || "");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    base44.functions
      .invoke("getBlogPostAnalytics", { blogPostId: selectedId, ...dateRange })
      .then((res) => setDetail(res.data?.success ? res.data : null))
      .finally(() => setLoading(false));
  }, [selectedId, dateRange]);

  if (published.length === 0) {
    return <p className="text-sm text-muted-foreground">Publish a post to see per-post analytics.</p>;
  }

  const m = detail?.metrics || {};
  const post = detail?.post;

  return (
    <div className="space-y-6">
      <div className="max-w-md">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger><SelectValue placeholder="Select a post" /></SelectTrigger>
          <SelectContent>
            {published.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingState label="Loading post analytics..." />
      ) : detail ? (
        <>
          {post && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {post.publishedAt && (
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Published {post.publishedAt}</span>
              )}
              {post.seoScore != null && (
                <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> SEO score {post.seoScore}</span>
              )}
              {post.category && <span>{post.category}</span>}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Eye} label="Pageviews" value={(m.pageviews || 0).toLocaleString()} />
            <StatCard icon={Users} label="Unique visitors" value={(m.uniqueVisitors || 0).toLocaleString()} />
            <StatCard icon={Clock} label="Avg. time on page" value={fmtTime(m.avgTimeOnPage)} />
            <StatCard icon={ArrowDownWideNarrow} label="Scroll depth" value={`${m.scrollDepth || 0}%`} />
            <StatCard icon={MousePointerClick} label="CTA clicks" value={(m.ctaClicks || 0).toLocaleString()} />
            <StatCard icon={Link2} label="Internal link clicks" value={(m.internalLinkClicks || 0).toLocaleString()} />
            <StatCard icon={Link2} label="Related post clicks" value={(m.relatedPostClicks || 0).toLocaleString()} />
            <StatCard icon={MousePointerClick} label="Conversions" value={(m.conversions || 0).toLocaleString()} />
          </div>
          <SourceBreakdown sources={detail.sources} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No analytics recorded for this post yet.</p>
      )}
    </div>
  );
}