// Shared options & helpers for the Brand Profile module.

export const TONE_OPTIONS = [
  { key: "professional", label: "Professional" },
  { key: "casual", label: "Casual" },
  { key: "bold", label: "Bold" },
  { key: "educational", label: "Educational" },
  { key: "witty", label: "Witty" },
  { key: "direct", label: "Direct" },
  { key: "community_focused", label: "Community-focused" },
  { key: "sales_driven", label: "Sales-driven" },
];

// Empty draft used when no profile exists yet.
export const EMPTY_BRAND = {
  brand_name: "",
  website_url: "",
  short_description: "",
  products_services: "",
  audience: "",
  competitor_notes: "",
  value_propositions: [],
  tone_of_voice: "",
  preferred_tone: "",
  preferred_words: [],
  banned_words: [],
  default_call_to_action: "",
  default_hashtags: [],
  pain_points: "",
  visual_style: "",
  logo_url: "",
  brand_colors: [],
  facebook_content_style: "",
  instagram_style: "",
};

// Build the entity payload from a draft (only fields that exist on BrandProfile + extras stored via additionalProperties not allowed — so we keep to schema fields).
export function brandToPayload(d) {
  return {
    brand_name: d.brand_name || "",
    website_url: d.website_url || "",
    short_description: d.short_description || "",
    products_services: d.products_services || "",
    audience: d.audience || "",
    competitor_notes: d.competitor_notes || "",
    value_propositions: d.value_propositions || [],
    tone_of_voice: d.tone_of_voice || "",
    preferred_tone: d.preferred_tone || "",
    preferred_words: d.preferred_words || [],
    banned_words: d.banned_words || [],
    default_call_to_action: d.default_call_to_action || "",
    default_hashtags: d.default_hashtags || [],
    pain_points: d.pain_points || "",
    visual_style: d.visual_style || "",
    logo_url: d.logo_url || "",
    brand_colors: d.brand_colors || [],
    facebook_content_style: d.facebook_content_style || "",
    instagram_style: d.instagram_style || "",
    account_id: "global",
  };
}

export function validateBrand(d) {
  const errors = {};
  if (!d.brand_name || !d.brand_name.trim()) errors.brand_name = "Brand name is required.";
  if (d.website_url && !/^https?:\/\/.+\..+/.test(d.website_url.trim()))
    errors.website_url = "Enter a valid URL starting with http:// or https://";
  if (!d.short_description || !d.short_description.trim())
    errors.short_description = "A short description helps the AI understand your brand.";
  if (!d.audience || !d.audience.trim()) errors.audience = "Target audience is required for good content.";
  return errors;
}

// First-time guided setup steps (titles map to which sections to show).
export const SETUP_STEPS = [
  { key: "basics", title: "The Basics", description: "Who you are and what you do." },
  { key: "audience", title: "Audience & Offer", description: "Who you serve and what you sell." },
  { key: "voice", title: "Voice & Words", description: "How your brand sounds." },
  { key: "visual", title: "Visual & Channels", description: "How your brand looks and posts." },
];