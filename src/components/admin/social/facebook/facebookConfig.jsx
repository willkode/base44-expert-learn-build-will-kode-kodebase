// Shared config, validation, and heuristics for Facebook Page publishing.
// This workflow supports Facebook PAGES ONLY — personal profile posting is not supported.

export const FACEBOOK_POST_TYPES = [
  { key: "text", label: "Text post", help: "A plain status update to the Page feed." },
  { key: "link", label: "Link post", help: "Shares an external URL with optional message." },
  { key: "photo", label: "Photo post", help: "Publishes a single image with a caption." },
  { key: "video", label: "Video post", help: "Publishes a video to the Page." },
];

// Optional Facebook call-to-action button options (only shown for link/photo posts).
export const FACEBOOK_CTA_OPTIONS = [
  { key: "", label: "No button" },
  { key: "LEARN_MORE", label: "Learn More" },
  { key: "SHOP_NOW", label: "Shop Now" },
  { key: "SIGN_UP", label: "Sign Up" },
  { key: "BOOK_NOW", label: "Book Now" },
  { key: "GET_OFFER", label: "Get Offer" },
  { key: "CONTACT_US", label: "Contact Us" },
  { key: "DOWNLOAD", label: "Download" },
  { key: "WATCH_MORE", label: "Watch More" },
];

// AI assistant actions surfaced in the Facebook panel.
export const FACEBOOK_AI_ACTIONS = [
  { key: "rewrite_page_update", label: "Rewrite as Page update" },
  { key: "rewrite_community", label: "Rewrite as community post" },
  { key: "rewrite_offer", label: "Rewrite as offer post" },
  { key: "rewrite_educational", label: "Rewrite as educational post" },
  { key: "make_conversational", label: "Make more conversational" },
  { key: "make_less_salesy", label: "Make less salesy" },
  { key: "add_cta", label: "Add CTA" },
  { key: "generate_image_caption", label: "Generate image caption" },
  { key: "generate_link_text", label: "Generate link post text" },
  { key: "generate_event", label: "Generate event announcement" },
  { key: "generate_customer_update", label: "Generate customer update" },
];

// Engagement-bait patterns Facebook penalizes in feed ranking.
const ENGAGEMENT_BAIT_PATTERNS = [
  /\blike (this|if|and share)\b/i,
  /\bshare (this|if)\b/i,
  /\btag (a friend|someone|3 friends)\b/i,
  /\bcomment (below|"?yes"?|your)\b/i,
  /\bvote (now|by)\b/i,
  /\bdouble[- ]?tap\b/i,
  /\bsmash that (like|button)\b/i,
  /\bdon'?t scroll\b/i,
  /\bwho else\b/i,
];

export function looksLikeEngagementBait(text) {
  if (!text) return false;
  return ENGAGEMENT_BAIT_PATTERNS.some((re) => re.test(text));
}

const VIDEO_EXT = /\.(mp4|mov|m4v|webm|avi)(\?|$)/i;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp)(\?|$)/i;

export function isVideoUrl(url) {
  return VIDEO_EXT.test(url || "");
}
export function isImageUrl(url) {
  return IMAGE_EXT.test(url || "");
}

// Returns { errors: string[], warnings: string[] } for a Facebook setup payload + account.
export function validateFacebookPayload(fb = {}, account = null) {
  const errors = [];
  const warnings = [];
  const type = fb.post_type || "text";
  const message = (fb.message || "").trim();
  const link = (fb.link_url || "").trim();
  const media = (fb.media_urls || []).filter((m) => (m || "").trim());

  // Page is required (no personal-profile posting).
  const pageId = fb.facebook_page_id || account?.selected_default_facebook_page_id || account?.facebook_page_id || "";
  if (!pageId) errors.push("A Facebook Page is required — connect or select a Page.");

  // At least one of message / link / media.
  if (!message && !link && media.length === 0) {
    errors.push("Add post text, a link, or media before scheduling.");
  }

  // Per-type requirements.
  if (type === "link") {
    if (!link) errors.push("A link post requires a URL.");
    if (link && !/^https?:\/\//i.test(link)) errors.push("Link URL must start with http:// or https://.");
  }
  if (type === "photo") {
    if (media.length === 0) errors.push("A photo post requires an image.");
    if (media[0] && !isImageUrl(media[0]) && !isVideoUrl(media[0])) {
      // unknown extension — allow but warn
      warnings.push("The uploaded media type couldn't be confirmed as an image.");
    } else if (media[0] && isVideoUrl(media[0])) {
      errors.push("This media is a video — switch the post type to Video.");
    }
  }
  if (type === "video") {
    if (media.length === 0) errors.push("A video post requires a video file.");
    if (media[0] && isImageUrl(media[0])) {
      errors.push("This media is an image — switch the post type to Photo.");
    }
  }

  // Page-permission warnings (best-effort, based on what the connect flow stored).
  if (account) {
    if (account.connection_status && account.connection_status !== "connected") {
      errors.push("The Facebook account is not connected — reconnect the Page.");
    }
    const tasks = account.facebook_page_tasks || [];
    if (tasks.length && !tasks.includes("CREATE_CONTENT") && !tasks.includes("MANAGE")) {
      warnings.push("This Page role may not allow publishing. You need CREATE_CONTENT or MANAGE permission.");
    }
    if (!account.facebook_page_access_token_encrypted) {
      warnings.push("No Page access token is stored yet — publishing will fail until the Page is reconnected.");
    }
    if (account.meta_token_expires_at && new Date(account.meta_token_expires_at).getTime() <= Date.now()) {
      warnings.push("The Meta access token has expired — reconnect the Page before scheduling.");
    }
  }

  // Engagement bait.
  if (looksLikeEngagementBait(`${message}`)) {
    warnings.push("This sounds like engagement bait (like/share/tag/comment prompts). Facebook reduces reach for these — rephrase it.");
  }

  return { errors, warnings };
}

export const EMPTY_FACEBOOK_PAYLOAD = {
  facebook_page_id: "",
  post_type: "text",
  message: "",
  link_url: "",
  media_urls: [],
  call_to_action: "",
};