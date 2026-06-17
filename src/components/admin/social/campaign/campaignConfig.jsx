// Shared options & helpers for Social Campaigns.

// NOTE: SocialCampaign.goal enum is:
// awareness, traffic, leads, sales, engagement, retention, launch, announcement
// We present richer labels mapped onto those existing enum values (no schema change).
export const CAMPAIGN_GOALS = [
  { key: "announcement", label: "Launch announcement" },
  { key: "awareness", label: "Feature promotion" },
  { key: "leads", label: "Lead generation" },
  { key: "sales", label: "Sales" },
  { key: "engagement", label: "Community engagement" },
  { key: "retention", label: "Thought leadership" },
  { key: "traffic", label: "Educational content" },
  { key: "launch", label: "Event promotion" },
];

// A flatter goal list keyed by enum for label lookups.
export const GOAL_LABELS = {
  awareness: "Feature promotion",
  traffic: "Educational content",
  leads: "Lead generation",
  sales: "Sales",
  engagement: "Community engagement",
  retention: "Thought leadership",
  launch: "Event promotion",
  announcement: "Launch announcement",
};

export const CAMPAIGN_STATUSES = [
  { key: "draft", label: "Draft" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

export const FREQUENCY_OPTIONS = [
  { key: "daily", label: "Daily" },
  { key: "few_times_week", label: "A few times a week" },
  { key: "weekly", label: "Weekly" },
  { key: "biweekly", label: "Bi-weekly" },
  { key: "monthly", label: "Monthly" },
];

// Statuses that must never keep publishing.
export const NON_PUBLISHING_STATUSES = ["archived", "completed", "paused", "draft"];

export const EMPTY_CAMPAIGN = {
  name: "",
  goal: "awareness",
  description: "",
  start_date: "",
  end_date: "",
  target_audience: "",
  offer_details: "",
  landing_page_url: "",
  brand_voice: "",
  default_platforms: ["twitter", "linkedin"],
  default_hashtag_strategy: "",
  posting_frequency: "weekly",
  key_message: "",
  content_themes: [],
  approval_required: true,
  status: "draft",
};

export function campaignToPayload(d) {
  return {
    name: (d.name || "").trim(),
    goal: d.goal || "awareness",
    description: d.description || "",
    start_date: d.start_date || undefined,
    end_date: d.end_date || undefined,
    target_audience: d.target_audience || "",
    offer_details: d.offer_details || "",
    landing_page_url: d.landing_page_url || "",
    brand_voice: d.brand_voice || "",
    default_platforms: d.default_platforms || [],
    default_hashtag_strategy: d.default_hashtag_strategy || "",
    posting_frequency: d.posting_frequency || "weekly",
    key_message: d.key_message || "",
    content_themes: d.content_themes || [],
    approval_required: d.approval_required !== false,
    status: d.status || "draft",
    account_id: "global",
  };
}

export function validateCampaign(d) {
  const errors = {};
  if (!d.name || !d.name.trim()) errors.name = "Campaign name is required.";
  if (d.landing_page_url && !/^https?:\/\/.+\..+/.test(d.landing_page_url.trim()))
    errors.landing_page_url = "Enter a valid URL starting with http:// or https://";
  if (d.start_date && d.end_date && new Date(d.end_date) < new Date(d.start_date))
    errors.end_date = "End date must be after the start date.";
  if (!d.default_platforms || d.default_platforms.length === 0)
    errors.default_platforms = "Select at least one platform.";
  return errors;
}