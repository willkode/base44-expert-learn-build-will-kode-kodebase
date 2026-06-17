// Shared styling, labels, and platform metadata for the Social Media Marketing module.
import { Twitter, Linkedin, Facebook, Instagram, MessageSquare } from "lucide-react";

export const PLATFORMS = [
  { key: "twitter", label: "X / Twitter", icon: Twitter },
  { key: "reddit", label: "Reddit", icon: MessageSquare },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
  { key: "facebook", label: "Facebook Page", icon: Facebook },
  { key: "instagram", label: "Instagram", icon: Instagram },
];

export const PLATFORM_MAP = PLATFORMS.reduce((acc, p) => {
  acc[p.key] = p;
  return acc;
}, {});

export const CONNECTION_STATUS_STYLES = {
  connected: "bg-green-500/15 text-green-400 border-green-500/30",
  expired: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  disconnected: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  error: "bg-red-500/15 text-red-400 border-red-500/30",
};

export const APPROVAL_STATUS_STYLES = {
  draft: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  needs_review: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  approved: "bg-green-500/15 text-green-400 border-green-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  revision_requested: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

export const PUBLISHING_STATUS_STYLES = {
  unscheduled: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  scheduled: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  publishing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  published: "bg-green-500/15 text-green-400 border-green-500/30",
  partially_published: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  failed: "bg-red-500/15 text-red-400 border-red-500/30",
  canceled: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export const CAMPAIGN_STATUS_STYLES = {
  draft: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  active: "bg-green-500/15 text-green-400 border-green-500/30",
  paused: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  completed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  archived: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export const JOB_STATUS_STYLES = {
  queued: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  processing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  published: "bg-green-500/15 text-green-400 border-green-500/30",
  failed: "bg-red-500/15 text-red-400 border-red-500/30",
  canceled: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  skipped: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export const LOG_STATUS_STYLES = {
  success: "bg-green-500/15 text-green-400 border-green-500/30",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  error: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function prettyLabel(value) {
  if (!value) return "—";
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}