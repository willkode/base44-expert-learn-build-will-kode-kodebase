// Shared config + helpers for the social post approval workflow.

export const APPROVAL_FILTERS = [
  { key: "all", label: "All" },
  { key: "needs_review", label: "Needs review" },
  { key: "revision_requested", label: "Revision requested" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "draft", label: "Draft" },
];

// Resolve the Facebook / Instagram accounts from whatever the caller passed.
// Accepts either { facebook, instagram } or a legacy single account object.
function resolveAccounts(accounts) {
  if (accounts && (accounts.facebook !== undefined || accounts.instagram !== undefined)) {
    return { facebook: accounts.facebook || null, instagram: accounts.instagram || null };
  }
  // Legacy single-account fallback: use it for whichever platform it matches.
  const a = accounts || null;
  return {
    facebook: a && a.platform === "facebook" ? a : null,
    instagram: a && a.platform === "instagram" ? a : null,
  };
}

// Returns a human-readable reason a post cannot be scheduled, or null if it can.
export function schedulingBlockReason(post, accounts) {
  if (post.approval_status !== "approved") {
    return "Only approved posts can be scheduled for auto-posting.";
  }
  const platforms = post.selected_platforms || [];
  const v = post.platform_variants || {};
  const { facebook, instagram } = resolveAccounts(accounts);

  if (platforms.includes("instagram")) {
    const media = (v.instagram_media_urls && v.instagram_media_urls.length) || post.image_url;
    if (!media) return "Instagram requires media (image, video, or Reel) before scheduling.";
    const igId = instagram && (instagram.instagram_business_account_id || instagram.selected_default_instagram_account_id);
    if (!igId) return "Instagram requires a connected professional account before scheduling.";
    if (!instagram.facebook_page_access_token_encrypted) return "Instagram must be linked to a Facebook Page (reconnect) before scheduling.";
  }
  if (platforms.includes("facebook")) {
    const hasPage = facebook && (facebook.facebook_page_id || facebook.selected_default_facebook_page_id);
    if (!hasPage) return "Facebook requires a connected Page target before scheduling.";
  }
  return null;
}

// Client-side mirror of the backend approval-requirement check (for inline messaging).
export function approvalBlockReasons(post, accounts) {
  const errors = [];
  const platforms = post.selected_platforms || [];
  const v = post.platform_variants || {};
  const { facebook, instagram } = resolveAccounts(accounts);

  if (platforms.includes("instagram")) {
    const media = (v.instagram_media_urls && v.instagram_media_urls.length) || post.image_url;
    if (!media) errors.push("Instagram needs media before it can be approved.");
    const igId = instagram && (instagram.instagram_business_account_id || instagram.selected_default_instagram_account_id);
    if (!igId) errors.push("Instagram needs a connected professional account before approval.");
    else if (!instagram.facebook_page_access_token_encrypted) errors.push("Instagram must be linked to a Facebook Page (reconnect Instagram) before approval.");
  }
  if (platforms.includes("facebook")) {
    const hasPage = facebook && (facebook.facebook_page_id || facebook.selected_default_facebook_page_id);
    if (!hasPage) errors.push("Facebook needs a connected Page target before approval.");
  }
  return errors;
}

export function primaryPostText(post) {
  const v = post.platform_variants || {};
  return (
    v.twitter_text || v.linkedin_text || v.facebook_text || v.instagram_caption || v.reddit_body || post.content || ""
  );
}