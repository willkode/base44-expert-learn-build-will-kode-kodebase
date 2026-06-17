// Shared config for the Social Content Studio generator.

export const CONTENT_TYPES = [
  { key: "product_launch", label: "Product launch" },
  { key: "feature_announcement", label: "Feature announcement" },
  { key: "educational_tip", label: "Educational tip" },
  { key: "case_study", label: "Case study" },
  { key: "customer_story", label: "Customer story" },
  { key: "behind_the_scenes", label: "Behind the scenes" },
  { key: "problem_solution", label: "Problem / solution" },
  { key: "promotional_offer", label: "Promotional offer" },
  { key: "thought_leadership", label: "Thought leadership" },
  { key: "community_question", label: "Community question" },
  { key: "event_announcement", label: "Event announcement" },
  { key: "weekly_roundup", label: "Weekly roundup" },
  { key: "reddit_discussion", label: "Reddit discussion starter" },
  { key: "linkedin_authority", label: "LinkedIn authority post" },
  { key: "x_short_form", label: "X short-form post" },
  { key: "x_thread", label: "X thread" },
  { key: "facebook_update", label: "Facebook Page update" },
  { key: "facebook_offer", label: "Facebook offer post" },
  { key: "instagram_caption", label: "Instagram caption" },
  { key: "instagram_reel", label: "Instagram Reel" },
  { key: "instagram_carousel", label: "Instagram carousel" },
];

export const TONE_OPTIONS = [
  "Professional",
  "Conversational",
  "Bold & punchy",
  "Educational",
  "Witty",
  "Direct",
  "Community-focused",
  "Sales-driven",
];

export const EMPTY_STUDIO_FORM = {
  campaign_id: "",
  selected_platforms: ["twitter", "linkedin"],
  topic: "",
  content_type: "educational_tip",
  tone: "",
  number_of_variations: 3,
  include_hashtags: true,
  include_image_prompt: true,
  include_call_to_action: true,
  custom_instructions: "",
  source_text: "",
};

// Lightweight, client-side warnings layered on top of the model's compliance_notes.
export function platformWarnings(platform, variant) {
  const warnings = [];
  if (!variant) return warnings;
  const hashtagCount = (variant.hashtags || []).length;

  if (platform === "reddit") {
    const risk = (variant.promotion_risk || "").toLowerCase();
    if (risk.includes("high")) warnings.push("This may read as too promotional for Reddit — keep it discussion-first.");
    if (hashtagCount > 0) warnings.push("Reddit posts rarely use hashtags — consider removing them.");
  }
  if (platform === "facebook") {
    const text = (variant.text || "").toLowerCase();
    if (/(like|share|comment|tag a friend|double tap)\b/.test(text) && /(if you|to win|for a chance)/.test(text)) {
      warnings.push("This may sound like engagement bait — Facebook penalizes it.");
    }
  }
  if (platform === "instagram") {
    if (hashtagCount > 15) warnings.push(`${hashtagCount} hashtags is a lot — move some to the first comment.`);
  }
  if (platform === "twitter") {
    if (hashtagCount > 3) warnings.push("Too many hashtags for X — 1-2 performs best.");
  }
  return warnings;
}

export function scoreColor(score) {
  if (score == null) return "text-muted-foreground";
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}