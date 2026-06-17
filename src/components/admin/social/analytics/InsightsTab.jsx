import React from "react";
import { ChartCard, ComparisonBars } from "./AnalyticsCharts";
import {
  compactNumber, rowEngagement, rowImpressions, jobContentType,
} from "./analyticsConfig";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Average engagement per row across a grouped set.
function avgEngagement(rows) {
  if (!rows.length) return 0;
  return Math.round(rows.reduce((a, r) => a + rowEngagement(r), 0) / rows.length);
}

export default function InsightsTab({ rows, jobsById, postsById }) {
  // Map each analytics row to its job for content-type / timing context.
  const enriched = rows.map((r) => {
    const job = jobsById[r.scheduled_post_id];
    const post = postsById[r.social_post_id];
    return { row: r, job, post, contentType: job ? jobContentType(job, post) : "text" };
  });

  // Best posting times — group by hour of scheduled_at.
  const byHour = {};
  for (const e of enriched) {
    const at = e.job?.scheduled_at;
    if (!at) continue;
    const h = new Date(at).getHours();
    if (isNaN(h)) continue;
    (byHour[h] = byHour[h] || []).push(e.row);
  }
  const postingTimes = Object.entries(byHour)
    .map(([h, rs]) => ({ label: `${((+h % 12) || 12)}${+h < 12 ? "am" : "pm"}`, value: avgEngagement(rs) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Best posting days.
  const byDay = {};
  for (const e of enriched) {
    const at = e.job?.scheduled_at;
    if (!at) continue;
    const d = new Date(at).getDay();
    if (isNaN(d)) continue;
    (byDay[d] = byDay[d] || []).push(e.row);
  }
  const postingDays = Object.entries(byDay)
    .map(([d, rs]) => ({ label: DAYS[+d], value: avgEngagement(rs) }))
    .sort((a, b) => b.value - a.value);

  // Engagement by content type.
  const byType = {};
  for (const e of enriched) (byType[e.contentType] = byType[e.contentType] || []).push(e.row);
  const contentTypeBars = Object.entries(byType)
    .map(([t, rs]) => ({ label: t.charAt(0).toUpperCase() + t.slice(1), value: avgEngagement(rs) }))
    .sort((a, b) => b.value - a.value);

  // Best Facebook post type.
  const fbByType = {};
  for (const e of enriched) {
    if (e.job?.platform !== "facebook") continue;
    const t = e.job?.platform_specific_payload?.post_type || "text";
    (fbByType[t] = fbByType[t] || []).push(e.row);
  }
  const fbBars = Object.entries(fbByType)
    .map(([t, rs]) => ({ label: t.charAt(0).toUpperCase() + t.slice(1), value: avgEngagement(rs) }))
    .sort((a, b) => b.value - a.value);

  // Best Instagram media type.
  const igByType = {};
  for (const e of enriched) {
    if (e.job?.platform !== "instagram") continue;
    const t = e.job?.platform_specific_payload?.media_type || "image";
    (igByType[t] = igByType[t] || []).push(e.row);
  }
  const igBars = Object.entries(igByType)
    .map(([t, rs]) => ({ label: t.charAt(0).toUpperCase() + t.slice(1), value: avgEngagement(rs) }))
    .sort((a, b) => b.value - a.value);

  // Best visual content — posts with an image, ranked by engagement.
  const visualPosts = enriched
    .filter((e) => e.post?.image_url)
    .sort((a, b) => rowEngagement(b.row) - rowEngagement(a.row))
    .slice(0, 4);

  // Best caption style — bucket by caption length.
  const captionBuckets = { Short: [], Medium: [], Long: [] };
  for (const e of enriched) {
    const text = e.post?.content || "";
    const len = text.length;
    const bucket = len < 120 ? "Short" : len < 400 ? "Medium" : "Long";
    captionBuckets[bucket].push(e.row);
  }
  const captionBars = Object.entries(captionBuckets)
    .filter(([, rs]) => rs.length)
    .map(([label, rs]) => ({ label: `${label} (${rs.length})`, value: avgEngagement(rs) }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Best posting times" subtitle="Avg engagement by hour of day">
          <ComparisonBars data={postingTimes} />
        </ChartCard>
        <ChartCard title="Best posting days" subtitle="Avg engagement by weekday">
          <ComparisonBars data={postingDays} />
        </ChartCard>
        <ChartCard title="Engagement by content type" subtitle="Avg engagement per format">
          <ComparisonBars data={contentTypeBars} />
        </ChartCard>
        <ChartCard title="Best caption style" subtitle="Avg engagement by caption length">
          <ComparisonBars data={captionBars} />
        </ChartCard>
        <ChartCard title="Best Facebook post type" subtitle="Avg engagement per Facebook format">
          <ComparisonBars data={fbBars} />
        </ChartCard>
        <ChartCard title="Best Instagram media type" subtitle="Avg engagement per Instagram format">
          <ComparisonBars data={igBars} />
        </ChartCard>
      </div>

      <ChartCard title="Best visual content" subtitle="Top image/video posts by engagement">
        {visualPosts.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {visualPosts.map((e) => (
              <div key={e.row.id} className="rounded-xl border border-border bg-background/40 overflow-hidden">
                <img src={e.post.image_url} alt="" className="w-full h-28 object-cover" />
                <div className="px-2.5 py-2">
                  <div className="text-xs text-muted-foreground line-clamp-1">{e.post?.title_internal || e.row.platform}</div>
                  <div className="font-sora font-semibold text-sm">{compactNumber(rowEngagement(e.row))} eng.</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">No visual posts measured yet.</p>
        )}
      </ChartCard>
    </div>
  );
}