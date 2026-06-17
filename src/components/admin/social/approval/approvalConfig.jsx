// Shared config + helpers for the social post approval workflow.

export const APPROVAL_FILTERS = [
  { key: "all", label: "All" },
  { key: "needs_review", label: "Needs review" },
  { key: "revision_requested", label: "Revision requested" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "draft", label: "Draft" },
];

// Returns a human-readable reason a post cannot be scheduled, or null if it can.
export function schedulingBlockReason(post, fbIgAccount) {
  if (post.approval_status !== "approved") {
    return "Only approved posts can be scheduled for auto-posting.";
  }
  const platforms = post.selected_platforms || [];
  const v = post.platform_variants || {};

  if (platforms.includes("instagram")) {
    const media = (v.instagram_media_urls && v.instagram_media_urls.length) || post.image_url;
    if (!media) return "Instagram requires media (image, video, or Reel) before scheduling.";
  }
  if (platforms.includes("facebook")) {
    const hasPage = fbIgAccount && (fbIgAccount.facebook_page_id || fbIgAccount.selected_default_facebook_page_id);
    if (!hasPage) return "Facebook requires a connected Page target before scheduling.";
  }
  return null;
}

// Client-side mirror of the backend approval-requirement check (for inline messaging).
export function approvalBlockReasons(post, fbIgAccount) {
  const errors = [];
  const platforms = post.selected_platforms || [];
  const v = post.platform_variants || {};

  if (platforms.includes("instagram")) {
    const media = (v.instagram_media_urls && v.instagram_media_urls.length) || post.image_url;
    if (!media) errors.push("Instagram needs media before it can be approved.");
  }
  if (platforms.includes("facebook")) {
    const hasPage = fbIgAccount && (fbIgAccount.facebook_page_id || fbIgAccount.selected_default_facebook_page_id);
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