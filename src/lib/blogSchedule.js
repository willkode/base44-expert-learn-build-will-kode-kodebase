// Helpers for displaying scheduled blog post times in the user's timezone.

export function localTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

// Format an ISO timestamp for display. Uses the viewer's local timezone and
// appends the original scheduling timezone label when it differs.
export function formatScheduled(iso, scheduledTimezone) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const local = d.toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
  const tz = localTimezone();
  let label = `${local} (${tz})`;
  if (scheduledTimezone && scheduledTimezone !== tz) {
    label += ` · set in ${scheduledTimezone}`;
  }
  return label;
}