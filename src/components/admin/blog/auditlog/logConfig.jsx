// Friendly labels for blog automation log event types + filter options.

export const EVENT_LABELS = {
  settings_updated: "Settings updated",
  category_created: "Category created",
  category_updated: "Category updated",
  tag_created: "Tag created",
  tag_updated: "Tag updated",
  post_created: "Post created",
  post_updated: "Post updated",
  generate: "AI post generated",
  image_generated: "AI image generated",
  seo_analysis: "SEO analysis run",
  seo_fix: "SEO fix applied",
  internal_links: "Internal links generated",
  internal_link_applied: "Internal link applied",
  submitted_for_review: "Submitted for review",
  approved: "Post approved",
  rejected: "Post rejected",
  schedule: "Post scheduled",
  reschedule: "Post rescheduled",
  schedule_canceled: "Schedule canceled",
  publishing_started: "Publishing started",
  publish: "Published",
  publish_failed: "Publishing failed",
  analytics_tracked: "Analytics tracked",
  analytics_sync: "Analytics sync",
  search_console_sync: "Search Console sync",
  refresh_scan: "Refresh recommendation created",
  refresh_apply: "Refresh recommendation applied",
  repurposed: "Post repurposed",
};

export function eventLabel(type) {
  return EVENT_LABELS[type] || (type || "Event").replace(/_/g, " ");
}

export const STATUS_VARIANT = { success: "default", warning: "secondary", error: "destructive" };

export const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];