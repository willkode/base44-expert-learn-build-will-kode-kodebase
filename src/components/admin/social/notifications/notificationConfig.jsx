import {
  Plug, PlugZap, KeyRound, Sparkles, CheckSquare, ThumbsUp, ThumbsDown,
  CalendarClock, CalendarX, Send, AlertTriangle, BarChart3, Flag, PauseCircle,
  Facebook, Instagram, Gauge,
} from "lucide-react";

// Severity → badge styles (matches the dark tech palette used across the social module).
export const SOCIAL_SEVERITY_STYLES = {
  info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  success: "bg-green-500/15 text-green-400 border-green-500/30",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  error: "bg-red-500/15 text-red-400 border-red-500/30",
};

// Event → icon + default severity (used for display + the helper's defaults).
export const SOCIAL_EVENT_META = {
  account_connected: { icon: Plug, severity: "success", label: "Account connected" },
  account_disconnected: { icon: PlugZap, severity: "warning", label: "Account disconnected" },
  account_token_expired: { icon: KeyRound, severity: "error", label: "Token expired" },
  post_generated: { icon: Sparkles, severity: "info", label: "Post generated" },
  post_needs_approval: { icon: CheckSquare, severity: "warning", label: "Needs approval" },
  post_approved: { icon: ThumbsUp, severity: "success", label: "Post approved" },
  post_rejected: { icon: ThumbsDown, severity: "warning", label: "Post rejected" },
  post_scheduled: { icon: CalendarClock, severity: "success", label: "Post scheduled" },
  post_rescheduled: { icon: CalendarClock, severity: "info", label: "Post rescheduled" },
  post_canceled: { icon: CalendarX, severity: "warning", label: "Post canceled" },
  post_published: { icon: Send, severity: "success", label: "Post published" },
  post_failed: { icon: AlertTriangle, severity: "error", label: "Post failed" },
  analytics_sync_completed: { icon: BarChart3, severity: "info", label: "Analytics synced" },
  campaign_completed: { icon: Flag, severity: "success", label: "Campaign completed" },
  campaign_paused_failures: { icon: PauseCircle, severity: "error", label: "Campaign paused" },
  facebook_page_connected: { icon: Facebook, severity: "success", label: "Facebook Page connected" },
  facebook_page_disconnected: { icon: Facebook, severity: "warning", label: "Facebook Page disconnected" },
  facebook_token_expired: { icon: KeyRound, severity: "error", label: "Facebook token expired" },
  facebook_post_published: { icon: Facebook, severity: "success", label: "Facebook post published" },
  facebook_post_failed: { icon: Facebook, severity: "error", label: "Facebook post failed" },
  facebook_analytics_synced: { icon: BarChart3, severity: "info", label: "Facebook analytics synced" },
  instagram_account_connected: { icon: Instagram, severity: "success", label: "Instagram connected" },
  instagram_account_disconnected: { icon: Instagram, severity: "warning", label: "Instagram disconnected" },
  instagram_token_expired: { icon: KeyRound, severity: "error", label: "Instagram token expired" },
  instagram_post_published: { icon: Instagram, severity: "success", label: "Instagram post published" },
  instagram_post_failed: { icon: Instagram, severity: "error", label: "Instagram post failed" },
  instagram_limit_reached: { icon: Gauge, severity: "warning", label: "Instagram limit reached" },
  instagram_analytics_synced: { icon: BarChart3, severity: "info", label: "Instagram analytics synced" },
};

export function eventIcon(eventType) {
  return SOCIAL_EVENT_META[eventType]?.icon || Sparkles;
}

export function formatNotifDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}