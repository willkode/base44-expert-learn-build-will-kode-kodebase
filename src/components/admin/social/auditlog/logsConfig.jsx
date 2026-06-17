// Shared config for the Social Automation Logs page: event groupings + helpers.

// Canonical list of event types the social system writes, grouped for filtering.
// Includes both the granular audit events and the legacy event types already
// present in existing log writes (e.g. content_generated, post_attempt).
export const EVENT_GROUPS = [
  {
    label: "OAuth & Connections",
    events: [
      "oauth_started", "oauth_completed", "oauth_failed",
      "meta_oauth_started", "meta_oauth_completed", "meta_oauth_failed",
      "facebook_page_connected", "instagram_account_connected",
      "token_refreshed", "token_refresh_failed", "token_refresh",
      "account_disconnected", "meta_event",
    ],
  },
  {
    label: "Campaigns",
    events: ["campaign_created", "campaign_updated", "campaign_paused", "campaign_archived"],
  },
  {
    label: "AI Generation",
    events: ["ai_content_generated", "ai_image_generated", "content_generated"],
  },
  {
    label: "Approval Workflow",
    events: [
      "post_edited", "post_submitted_for_review", "post_approved", "post_rejected",
      "approval_approved", "approval_rejected", "approval_submitted", "revision_requested",
    ],
  },
  {
    label: "Scheduling",
    events: ["post_scheduled", "post_rescheduled", "post_canceled", "scheduled"],
  },
  {
    label: "Publishing",
    events: [
      "publishing_started", "publishing_succeeded", "publishing_failed", "post_attempt",
      "facebook_publishing_started", "facebook_publishing_succeeded", "facebook_publishing_failed",
      "instagram_container_created", "instagram_container_failed",
      "instagram_publishing_succeeded", "instagram_publishing_failed",
    ],
  },
  {
    label: "Analytics",
    events: ["analytics_synced", "analytics_sync_failed", "analytics_sync"],
  },
  {
    label: "Settings",
    events: ["settings_changed", "settings_updated"],
  },
];

// Flat map: event_type -> group label (for display + grouping in the filter select).
export const EVENT_TO_GROUP = EVENT_GROUPS.reduce((acc, g) => {
  g.events.forEach((e) => { acc[e] = g.label; });
  return acc;
}, {});

export const STATUS_OPTIONS = [
  { key: "all", label: "All Statuses" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
  { key: "error", label: "Error" },
];

export const DATE_RANGE_OPTIONS = [
  { key: "all", label: "All time" },
  { key: "1", label: "Last 24 hours" },
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "90", label: "Last 90 days" },
];

// Event types that support a publishing retry action (re-queue the scheduled job).
export const RETRYABLE_EVENTS = new Set([
  "publishing_failed", "post_attempt",
  "facebook_publishing_failed", "instagram_publishing_failed",
]);

export function isRetryable(log) {
  return (
    log.status === "error" &&
    !!log.related_scheduled_post_id &&
    RETRYABLE_EVENTS.has(log.event_type)
  );
}