// Content-mix options for the calendar auto-fill (keys must match the backend CONTENT_MIX map).
export const CONTENT_MIX_OPTIONS = [
  { key: "educational", label: "Educational posts" },
  { key: "promotional", label: "Promotional posts" },
  { key: "community_question", label: "Community questions" },
  { key: "thought_leadership", label: "Thought leadership" },
  { key: "product_feature", label: "Product / feature posts" },
  { key: "case_study", label: "Case studies" },
  { key: "reddit_discussion", label: "Reddit discussions" },
  { key: "twitter_short", label: "X / Twitter short posts" },
  { key: "linkedin_authority", label: "LinkedIn authority posts" },
  { key: "facebook_update", label: "Facebook Page updates" },
  { key: "facebook_offer", label: "Facebook offer posts" },
  { key: "instagram_image", label: "Instagram image captions" },
  { key: "instagram_reel", label: "Instagram Reels" },
  { key: "instagram_carousel", label: "Instagram carousel posts" },
  { key: "instagram_story", label: "Instagram Stories" },
];

export const DEFAULT_AUTOFILL = () => {
  const start = new Date(Date.now() + 86400000);
  const end = new Date(Date.now() + 14 * 86400000);
  const toDate = (d) => d.toISOString().slice(0, 10);
  return {
    campaign_id: "",
    date_range_start: toDate(start),
    date_range_end: toDate(end),
    selected_platforms: ["linkedin", "twitter"],
    posting_schedule_id: "",
    number_of_posts: 6,
    approval_mode: "require_review",
    content_mix: ["educational", "thought_leadership", "product_feature", "community_question"],
    custom_instructions: "",
    generate_images: false,
  };
};