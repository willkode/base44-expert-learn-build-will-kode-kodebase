// Shared constants for the content planning system.

export const CONTENT_TYPE_OPTIONS = [
  { value: "pillar_page", label: "Pillar page" },
  { value: "guide", label: "How-to guides" },
  { value: "listicle", label: "Listicles" },
  { value: "comparison", label: "Comparison posts" },
  { value: "product_education", label: "Product education posts" },
  { value: "announcement", label: "Feature announcements" },
  { value: "case_study", label: "Case studies" },
  { value: "faq", label: "FAQ articles" },
  { value: "thought_leadership", label: "Thought leadership posts" },
  { value: "local_seo", label: "Local SEO posts" },
  { value: "support", label: "Support articles" },
  { value: "changelog", label: "Changelog posts" },
];

export const GOAL_OPTIONS = [
  { value: "traffic", label: "Organic traffic" },
  { value: "leads", label: "Lead generation" },
  { value: "authority", label: "Topical authority" },
  { value: "product_education", label: "Product education" },
  { value: "launch", label: "Launch / campaign" },
  { value: "support", label: "Support / deflection" },
  { value: "seo_cluster", label: "SEO topic cluster" },
];

export const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "twice_weekly", label: "Twice weekly" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
];

export const LENGTH_OPTIONS = [
  { value: "short", label: "Short (600–800)" },
  { value: "medium", label: "Medium (1000–1400)" },
  { value: "long", label: "Long (1800–2200)" },
  { value: "comprehensive", label: "Comprehensive (2500+)" },
];

export const contentTypeLabel = (v) =>
  CONTENT_TYPE_OPTIONS.find((o) => o.value === v)?.label || (v || "").replace(/_/g, " ");