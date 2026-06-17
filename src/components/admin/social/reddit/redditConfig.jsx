// Shared config, validation, and heuristics for Reddit publishing.

export const REDDIT_POST_KINDS = [
  { key: "self", label: "Text post", help: "A discussion/text post with a body." },
  { key: "link", label: "Link post", help: "Shares an external URL." },
  { key: "image", label: "Image post", help: "Shares a single image." },
];

// AI assistant actions surfaced in the Reddit panel.
export const REDDIT_AI_ACTIONS = [
  { key: "rewrite_for_reddit", label: "Rewrite for Reddit" },
  { key: "make_less_promotional", label: "Make less promotional" },
  { key: "make_discussion_based", label: "Make more discussion-based" },
  { key: "turn_into_question", label: "Turn into question post" },
  { key: "value_first_educational", label: "Value-first educational post" },
  { key: "add_disclosure", label: "Add disclosure note" },
  { key: "suggest_subreddits", label: "Suggest subreddits" },
];

// Words/phrases that tend to read as promotional / ad-like on Reddit.
const PROMO_PATTERNS = [
  /\bbuy now\b/i, /\bsign ?up\b/i, /\bget started\b/i, /\blimited time\b/i,
  /\bdiscount\b/i, /\bsale\b/i, /\bspecial offer\b/i, /\bfree trial\b/i,
  /\bbest in class\b/i, /\bgame[- ]?chang/i, /\brevolutionary\b/i,
  /\bcheck out our\b/i, /\bour product\b/i, /\bour platform\b/i,
  /\bclick the link\b/i, /\bdon'?t miss\b/i, /\bact now\b/i, /\bunlock\b/i,
];

export function looksPromotional(text) {
  if (!text) return false;
  const hits = PROMO_PATTERNS.filter((re) => re.test(text)).length;
  return hits >= 2;
}

export function hasHashtags(text) {
  if (!text) return false;
  return /(^|\s)#[A-Za-z0-9_]+/.test(text);
}

// Returns { errors: string[], warnings: string[] } for a Reddit setup payload.
export function validateRedditPayload(reddit = {}) {
  const errors = [];
  const warnings = [];
  const kind = reddit.reddit_post_kind || "self";
  const title = (reddit.title || "").trim();
  const body = (reddit.body || "").trim();
  const url = (reddit.link_url || "").trim();

  if (!(reddit.subreddit || "").trim()) errors.push("Subreddit is required.");
  if (!title) errors.push("Title is required.");
  if (title.length > 300) errors.push("Reddit titles must be 300 characters or fewer.");

  if (kind === "self" && !body) errors.push("Body text is required for a text post.");
  if (kind === "link" && !url) errors.push("A URL is required for a link post.");
  if (kind === "link" && url && !/^https?:\/\//i.test(url)) errors.push("Link URL must start with http:// or https://.");
  if (kind === "image" && !(reddit.media_url || "").trim()) errors.push("An image is required for an image post.");

  // Warnings (non-blocking).
  if (looksPromotional(`${title} ${body}`)) {
    warnings.push("This post sounds promotional. Reddit communities dislike ads — frame it as a discussion and add a disclosure if it's about your own product.");
  }
  if (hasHashtags(`${title} ${body}`)) {
    warnings.push("Hashtags usually feel unnatural on Reddit — consider removing them.");
  }
  warnings.push("Review the target subreddit's rules and posting requirements before scheduling.");

  return { errors, warnings };
}

// Normalizes a subreddit string (strips r/ prefix and whitespace).
export function cleanSubreddit(value) {
  return (value || "").trim().replace(/^\/?r\//i, "").replace(/\s+/g, "");
}

export const EMPTY_REDDIT_PAYLOAD = {
  subreddit: "",
  reddit_post_kind: "self",
  title: "",
  body: "",
  link_url: "",
  media_url: "",
  flair_id: "",
  flair_text: "",
  nsfw: false,
  spoiler: false,
  send_replies: true,
  suggested_comment: "",
  promotion_disclosure: "",
  subreddit_rules_notes: "",
};