// Shared helpers + metric math for the Social Analytics views.
import { PLATFORM_MAP } from "@/components/admin/social/socialConfig";

export const DATE_RANGES = [
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "90", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

export const CONTENT_TYPES = [
  { key: "all", label: "All content" },
  { key: "image", label: "Image" },
  { key: "video", label: "Video" },
  { key: "carousel", label: "Carousel" },
  { key: "reel", label: "Reel" },
  { key: "text", label: "Text only" },
  { key: "link", label: "Link" },
];

export const CHART_COLORS = ["#f87171", "#fb923c", "#facc15", "#60a5fa", "#a78bfa"];

export const PLATFORM_COLORS = {
  twitter: "#60a5fa",
  reddit: "#fb923c",
  linkedin: "#38bdf8",
  facebook: "#818cf8",
  instagram: "#f472b6",
};

export function num(v) {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

// Total engagement actions for a single analytics row.
export function rowEngagement(r) {
  return num(r.likes) + num(r.comments) + num(r.shares) + num(r.reposts) +
    num(r.saves) + num(r.upvotes) + num(r.facebook_reactions || 0);
}

export function rowImpressions(r) {
  return num(r.impressions) || num(r.reach);
}

// Keep only the latest snapshot per scheduled_post_id (rows must be sorted by -collected_at).
export function latestPerPost(rows) {
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    const key = r.scheduled_post_id || r.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

export function sumBy(rows, key) {
  return rows.reduce((acc, r) => acc + num(r[key]), 0);
}

export function totalEngagement(rows) {
  return rows.reduce((acc, r) => acc + rowEngagement(r), 0);
}

export function totalImpressions(rows) {
  return rows.reduce((acc, r) => acc + rowImpressions(r), 0);
}

export function engagementRate(rows) {
  const imp = totalImpressions(rows);
  return imp > 0 ? Number(((totalEngagement(rows) / imp) * 100).toFixed(2)) : 0;
}

export function platformLabel(key) {
  return PLATFORM_MAP[key]?.label || key;
}

export function compactNumber(n) {
  const v = num(n);
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return v.toLocaleString();
}

export function formatDay(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Build a per-day engagement/impressions series from rows using a date accessor.
export function buildTimeSeries(rows, getDate) {
  const byDay = new Map();
  for (const r of rows) {
    const iso = getDate(r);
    if (!iso) continue;
    const day = new Date(iso);
    if (isNaN(day.getTime())) continue;
    const key = day.toISOString().slice(0, 10);
    const bucket = byDay.get(key) || { date: key, engagement: 0, impressions: 0, clicks: 0 };
    bucket.engagement += rowEngagement(r);
    bucket.impressions += rowImpressions(r);
    bucket.clicks += num(r.clicks);
    byDay.set(key, bucket);
  }
  return [...byDay.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((b) => ({ ...b, label: formatDay(b.date) }));
}

// Derive a content type for a published job from its payload + post.
export function jobContentType(job, post) {
  const p = job?.platform_specific_payload || {};
  const platform = job?.platform;
  if (platform === "instagram") return p.media_type || post?.platform_variants?.instagram_media_type || "image";
  if (platform === "facebook") return p.post_type || post?.platform_variants?.facebook_post_type || "text";
  if (platform === "twitter") {
    if ((p.thread && p.thread.length) || (post?.platform_variants?.twitter_thread || []).length) return "text";
    return p.media_url || p.media_urls?.length || post?.image_url ? "image" : "text";
  }
  if (platform === "reddit") return p.reddit_post_kind === "self" ? "text" : (p.reddit_post_kind || "text");
  if (platform === "linkedin") return post?.image_url ? "image" : "text";
  return "text";
}