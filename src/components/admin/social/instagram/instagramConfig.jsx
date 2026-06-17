// Shared config, validation, and heuristics for Instagram publishing.
// Instagram is visual-first: text-only posts are never allowed.

export const IG_CAPTION_LIMIT = 2200;
export const IG_CAPTION_LONG_WARN = 2000;
export const IG_MAX_HASHTAGS = 30; // hard cap enforced by Instagram
export const IG_HASHTAG_WARN = 15; // warn beyond this — too many reads as spammy
export const IG_CAROUSEL_MIN = 2;
export const IG_CAROUSEL_MAX = 10;
export const IG_ALT_TEXT_LIMIT = 1000;

export const IG_MEDIA_TYPES = [
  { key: "image", label: "Image", accept: "image/*", kind: "image" },
  { key: "carousel", label: "Carousel", accept: "image/*,video/*", kind: "mixed" },
  { key: "reel", label: "Reel", accept: "video/*", kind: "video" },
  { key: "video", label: "Video", accept: "video/*", kind: "video" },
  { key: "story", label: "Story", accept: "image/*,video/*", kind: "mixed" },
];

export const IG_MEDIA_TYPE_MAP = IG_MEDIA_TYPES.reduce((acc, t) => {
  acc[t.key] = t;
  return acc;
}, {});

// Per-type publishing notes / media requirements shown in the composer.
export const IG_MEDIA_REQUIREMENTS = {
  image: "Single JPEG/PNG image. Recommended aspect ratios 4:5, 1:1, or 1.91:1.",
  carousel: "2–10 images or videos. All items share one caption. Mixed media is allowed.",
  reel: "A single vertical video (9:16). Reels can also be shared to the main feed.",
  video: "A single video posted to the feed. For short-form, use a Reel instead.",
  story: "One image or short video. Stories disappear after 24 hours.",
};

// AI assistant actions surfaced in the Instagram panel.
export const IG_AI_ACTIONS = [
  { key: "rewrite_caption", label: "Rewrite as IG caption", target: "caption" },
  { key: "rewrite_reel_caption", label: "Rewrite as Reel caption", target: "caption" },
  { key: "rewrite_carousel_caption", label: "Rewrite as carousel caption", target: "caption" },
  { key: "generate_hooks", label: "Generate hook options", target: "options" },
  { key: "generate_hashtags", label: "Generate hashtags", target: "hashtags" },
  { key: "generate_first_comment_hashtags", label: "First-comment hashtags", target: "first_comment" },
  { key: "generate_alt_text", label: "Generate alt text", target: "alt_text" },
  { key: "generate_image_concept", label: "Generate image concept", target: "notes" },
  { key: "generate_reel_idea", label: "Generate Reel idea", target: "notes" },
  { key: "generate_carousel_outline", label: "Carousel slide outline", target: "notes" },
  { key: "make_more_visual", label: "More visual", target: "caption" },
  { key: "make_more_community", label: "More community-focused", target: "caption" },
  { key: "make_more_sales", label: "More sales-focused", target: "caption" },
  { key: "make_shorter", label: "Make shorter", target: "caption" },
];

export function countHashtags(text) {
  if (!text) return 0;
  const m = String(text).match(/(^|\s)#[A-Za-z0-9_]+/g);
  return m ? m.length : 0;
}

// Total hashtags = inline (in caption) + explicit hashtag list + first-comment.
export function totalHashtags(ig = {}) {
  const inline = countHashtags(ig.caption);
  const list = (ig.hashtags || []).filter((h) => (h || "").trim()).length;
  const firstComment = countHashtags(ig.first_comment);
  return inline + list + firstComment;
}

const SPAMMY_PATTERNS = [
  /follow\s*4?\s*follow/i,
  /f4f/i,
  /like\s*4?\s*like/i,
  /\bdm\s+me\b.*\bnow\b/i,
  /click\s+the\s+link\s+in\s+bio.*(now|hurry|fast)/i,
];

function looksSpammy(caption) {
  return SPAMMY_PATTERNS.some((re) => re.test(caption || ""));
}

// Returns { errors: string[], warnings: string[] } for an Instagram payload.
export function validateInstagramPayload(ig = {}) {
  const errors = [];
  const warnings = [];
  const mediaType = ig.media_type || "image";
  const media = (ig.media_urls || []).filter((m) => (m || "").trim());
  const caption = (ig.caption || "").trim();

  // Visual-first: media is always required (no text-only posts).
  if (media.length === 0) {
    errors.push("Instagram posts require media — text-only posts are not allowed.");
  }

  // Caption must match the selected media type.
  if (mediaType === "carousel") {
    if (media.length < IG_CAROUSEL_MIN) errors.push(`Carousels need at least ${IG_CAROUSEL_MIN} media items.`);
    if (media.length > IG_CAROUSEL_MAX) errors.push(`Carousels allow at most ${IG_CAROUSEL_MAX} items.`);
  } else if (media.length > 1 && mediaType !== "carousel") {
    errors.push(`A single ${IG_MEDIA_TYPE_MAP[mediaType]?.label || mediaType} post can only have one media item — switch to Carousel for multiple.`);
  }

  // Reels / video require a video file; image requires an image.
  const isVideoUrl = (u) => /\.(mp4|mov|m4v|webm)(\?|$)/i.test(u || "");
  const isImageUrl = (u) => /\.(jpe?g|png|webp|gif|heic)(\?|$)/i.test(u || "");
  if ((mediaType === "reel" || mediaType === "video") && media.length && !media.some(isVideoUrl)) {
    warnings.push("Reels and videos expect a valid video file — confirm the uploaded media is a video.");
  }
  if (mediaType === "image" && media.length && !media.every((u) => isImageUrl(u) || !isVideoUrl(u))) {
    warnings.push("Image posts expect an image file — confirm the uploaded media is an image.");
  }

  // Caption length.
  if (caption.length > IG_CAPTION_LIMIT) {
    errors.push(`Caption is ${caption.length} characters — over the ${IG_CAPTION_LIMIT} limit.`);
  }

  // Alt text length.
  if ((ig.alt_text || "").length > IG_ALT_TEXT_LIMIT) {
    errors.push(`Alt text is over the ${IG_ALT_TEXT_LIMIT} character limit.`);
  }

  // Hashtag hard cap.
  const tags = totalHashtags(ig);
  if (tags > IG_MAX_HASHTAGS) {
    errors.push(`You have ${tags} hashtags — Instagram allows at most ${IG_MAX_HASHTAGS}.`);
  }

  // Warnings (non-blocking).
  if (tags > IG_HASHTAG_WARN && tags <= IG_MAX_HASHTAGS) {
    warnings.push(`${tags} hashtags can read as spammy — 5–15 focused tags perform best.`);
  }
  if (caption.length >= IG_CAPTION_LONG_WARN && caption.length <= IG_CAPTION_LIMIT) {
    warnings.push("Caption is very long — front-load the hook in the first line.");
  }
  if (looksSpammy(caption)) {
    warnings.push("Caption contains spammy phrasing (e.g. follow-for-follow) that can hurt reach.");
  }
  if (!caption && media.length) {
    warnings.push("No caption yet — a strong first line drives saves and shares.");
  }

  return { errors, warnings };
}

export const EMPTY_INSTAGRAM_PAYLOAD = {
  instagram_business_account_id: "",
  media_type: "image",
  media_urls: [],
  caption: "",
  hashtags: [],
  first_comment: "",
  alt_text: "",
  share_to_feed: true,
};