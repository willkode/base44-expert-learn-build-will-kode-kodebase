import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, Clock, Calendar } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { PLATFORM_MAP } from "@/components/admin/social/socialConfig";
import {
  compactNumber, rowEngagement, rowImpressions, formatDay, num,
} from "./analyticsConfig";
import { formatDateTime } from "@/components/admin/social/socialConfig";

const AXIS = { stroke: "hsl(215 20% 65%)", fontSize: 11 };
const GRID = "hsl(222 40% 18%)";

// Platform-specific metric rows for the detail view.
const DETAIL_METRICS = {
  twitter: [["likes", "Likes"], ["comments", "Replies"], ["reposts", "Reposts/Quotes"], ["impressions", "Impressions"], ["clicks", "Clicks"]],
  reddit: [["score", "Score"], ["upvotes", "Upvotes"], ["downvotes", "Downvotes"], ["comments", "Comments"]],
  linkedin: [["reactions", "Reactions"], ["comments", "Comments"], ["shares", "Reposts"], ["impressions", "Impressions"], ["clicks", "Clicks"]],
  facebook: [["facebook_reactions", "Reactions"], ["facebook_comments", "Comments"], ["facebook_shares", "Shares"], ["facebook_clicks", "Clicks"], ["facebook_impressions", "Impressions"], ["facebook_reach", "Reach"], ["facebook_video_views", "Video views"], ["facebook_post_engaged_users", "Engaged users"]],
  instagram: [["instagram_likes", "Likes"], ["instagram_comments", "Comments"], ["instagram_saves", "Saves"], ["instagram_shares", "Shares"], ["instagram_reach", "Reach"], ["instagram_impressions", "Impressions"], ["instagram_reel_plays", "Reel plays"], ["instagram_profile_visits", "Profile visits"], ["instagram_follows", "Follows"]],
};

export default function PostDetailDrawer({ open, onOpenChange, row, post, job }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !row) return;
    setLoading(true);
    base44.entities.SocialPostAnalytics
      .filter({ scheduled_post_id: row.scheduled_post_id }, "collected_at", 200)
      .then((rows) => setHistory(rows))
      .finally(() => setLoading(false));
  }, [open, row]);

  if (!row) return null;
  const meta = PLATFORM_MAP[row.platform];
  const Icon = meta?.icon;
  const metrics = DETAIL_METRICS[row.platform] || [];

  const timeline = history.map((h) => ({
    label: formatDay(h.collected_at),
    engagement: rowEngagement(h),
    impressions: rowImpressions(h),
  }));

  const image = post?.image_url;
  const content = post?.content
    || post?.platform_variants?.[`${row.platform}_text`]
    || post?.platform_variants?.instagram_caption
    || post?.platform_variants?.reddit_body
    || "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-primary" />}
            {post?.title_internal || `${meta?.label || row.platform} post`}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          {/* Meta row */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {job?.scheduled_at ? formatDateTime(job.scheduled_at) : "—"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Updated {row.collected_at ? formatDateTime(row.collected_at) : "—"}
            </span>
          </div>

          {image && (
            <img src={image} alt={post?.image_alt_text || "Post media"} className="w-full rounded-xl border border-border object-cover max-h-64" />
          )}

          {content && (
            <div className="rounded-xl border border-border bg-background/40 p-3">
              <div className="text-xs text-muted-foreground mb-1">Original content</div>
              <p className="text-sm whitespace-pre-wrap line-clamp-[12]">{content}</p>
            </div>
          )}

          {/* Platform-specific metrics */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">Platform metrics</div>
            <div className="grid grid-cols-3 gap-2.5">
              {metrics.map(([key, label]) => (
                <div key={key} className="rounded-lg border border-border bg-background/40 px-3 py-2">
                  <div className="text-[11px] text-muted-foreground">{label}</div>
                  <div className="font-sora font-semibold text-sm">{compactNumber(num(row[key]))}</div>
                </div>
              ))}
              <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
                <div className="text-[11px] text-muted-foreground">Eng. rate</div>
                <div className="font-sora font-semibold text-sm">{row.engagement_rate || 0}%</div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">Metric timeline</div>
            {loading ? (
              <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading…
              </div>
            ) : timeline.length > 1 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={timeline} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
                  <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={compactNumber} width={42} />
                  <Tooltip contentStyle={{ background: "hsl(224 47% 11%)", border: "1px solid hsl(222 40% 18%)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="engagement" stroke="#fb923c" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="impressions" stroke="#60a5fa" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-4">A timeline appears after a few sync runs.</p>
            )}
          </div>

          {row.platform_post_url && (
            <Button asChild variant="outline" className="w-full">
              <a href={row.platform_post_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" /> View published post
              </a>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}