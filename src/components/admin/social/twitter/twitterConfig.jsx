// Shared config, validation, and heuristics for X/Twitter publishing.

export const TWITTER_CHAR_LIMIT = 280;
export const TWITTER_MAX_HASHTAGS = 3; // warn beyond this
export const TWITTER_LONG_WARN = 260; // warn when a single tweet gets close to the limit

export const TWITTER_REPLY_SETTINGS = [
  { key: "everyone", label: "Everyone can reply" },
  { key: "following", label: "People you follow" },
  { key: "mentionedUsers", label: "Only mentioned users" },
];

// AI assistant actions surfaced in the X/Twitter panel.
export const TWITTER_AI_ACTIONS = [
  { key: "rewrite_shorter", label: "Rewrite shorter" },
  { key: "make_punchy", label: "Make more punchy" },
  { key: "turn_into_thread", label: "Turn into thread" },
  { key: "generate_hooks", label: "Generate hook options" },
  { key: "generate_variations", label: "Generate 5 variations" },
  { key: "add_cta", label: "Add CTA" },
  { key: "add_hashtags", label: "Add hashtags" },
  { key: "make_less_salesy", label: "Make less salesy" },
  { key: "make_controversial", label: "More controversial (professional)" },
  { key: "linkedin_to_thread", label: "LinkedIn post → X thread" },
];

export function countChars(text) {
  return (text || "").trim().length;
}

export function countHashtags(text) {
  if (!text) return 0;
  const m = String(text).match(/(^|\s)#[A-Za-z0-9_]+/g);
  return m ? m.length : 0;
}

// Returns { errors: string[], warnings: string[] } for an X/Twitter setup payload.
export function validateTwitterPayload(tw = {}) {
  const errors = [];
  const warnings = [];
  const text = (tw.text || "").trim();
  const thread = Array.isArray(tw.thread) ? tw.thread : [];
  const hasThread = thread.some((t) => (t || "").trim().length > 0);

  // Empty post guard.
  if (!text && !hasThread) errors.push("Post text is required.");

  // Character limits.
  if (countChars(text) > TWITTER_CHAR_LIMIT) {
    errors.push(`First tweet is ${countChars(text)} characters — over the ${TWITTER_CHAR_LIMIT} limit.`);
  }
  thread.forEach((t, i) => {
    if (countChars(t) > TWITTER_CHAR_LIMIT) {
      errors.push(`Thread tweet ${i + 1} is ${countChars(t)} characters — over the ${TWITTER_CHAR_LIMIT} limit.`);
    }
  });

  // Media must be uploaded before attaching: a media_url present without a media_id is OK
  // (worker uploads at publish time), but a media_id without a media_url is invalid.
  if (tw.media_id && !tw.media_url) {
    errors.push("Media is attached without a source image — re-upload the image.");
  }

  // Poll sanity (optional support).
  const poll = (tw.poll_options || []).filter((o) => (o || "").trim().length > 0);
  if (poll.length === 1) errors.push("A poll needs at least two options.");

  // Warnings (non-blocking).
  if (countHashtags(text) > TWITTER_MAX_HASHTAGS) {
    warnings.push(`This tweet has ${countHashtags(text)} hashtags — 1–2 perform best on X.`);
  }
  if (countChars(text) >= TWITTER_LONG_WARN && countChars(text) <= TWITTER_CHAR_LIMIT) {
    warnings.push("This tweet is close to the character limit — consider tightening it.");
  }
  // Duplicate thread content.
  const seen = new Set();
  let dupe = false;
  [text, ...thread].forEach((t) => {
    const norm = (t || "").trim().toLowerCase();
    if (!norm) return;
    if (seen.has(norm)) dupe = true;
    seen.add(norm);
  });
  if (dupe) warnings.push("Your thread contains duplicate tweets — make each one distinct.");

  return { errors, warnings };
}

// Splits a long body into tweet-sized chunks (used as a client-side fallback).
export function splitIntoTweets(text, limit = TWITTER_CHAR_LIMIT) {
  const clean = (text || "").trim();
  if (!clean) return [];
  if (clean.length <= limit) return [clean];
  const words = clean.split(/\s+/);
  const tweets = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > limit - 6) {
      tweets.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current.trim()) tweets.push(current.trim());
  return tweets.map((t, i) => `${t} (${i + 1}/${tweets.length})`);
}

export const EMPTY_TWITTER_PAYLOAD = {
  text: "",
  thread: [],
  media_url: "",
  media_id: "",
  reply_settings: "everyone",
  quote_post_id: "",
  poll_options: [],
  poll_duration_minutes: 0,
};