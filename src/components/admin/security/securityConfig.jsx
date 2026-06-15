// Shared styling + label maps for the Security Lockdown Pro module.

export const SEVERITY_STYLES = {
  Critical: "bg-red-500/15 text-red-400 border-red-500/30",
  High: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Info: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export const ISSUE_STATUS_STYLES = {
  Open: "bg-red-500/15 text-red-400 border-red-500/30",
  "In Progress": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Fixed: "bg-green-500/15 text-green-400 border-green-500/30",
  "Needs Retest": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Ignored: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  "False Positive": "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export const SCAN_STATUS_STYLES = {
  "Not Started": "bg-slate-500/15 text-slate-300 border-slate-500/30",
  Running: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Completed: "bg-green-500/15 text-green-400 border-green-500/30",
  Failed: "bg-red-500/15 text-red-400 border-red-500/30",
  "Needs Review": "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

export const CHECK_STATUS_STYLES = {
  Passed: "bg-green-500/15 text-green-400 border-green-500/30",
  Failed: "bg-red-500/15 text-red-400 border-red-500/30",
  Warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Skipped: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export const SEVERITY_ORDER = ["Critical", "High", "Medium", "Low", "Info"];

export function scoreColor(score) {
  if (score == null) return "text-muted-foreground";
  if (score >= 85) return "text-green-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

export function formatDate(value) {
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