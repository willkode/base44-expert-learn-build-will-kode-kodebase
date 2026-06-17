// ---------------------------------------------------------------------------
// Social Media Marketing — Error Catalog
// Central, single source of truth that maps every known error code across the
// system (OAuth, publishing, scheduling, analytics) to a user-friendly message:
//   - title:      short headline of what happened
//   - happened:   plain-language explanation of the failure
//   - nextStep:   what the user should do next
//   - severity:   "error" | "warning"
//   - actions:    list of action keys the UI should offer (see ERROR_ACTIONS)
//
// Action keys are resolved into buttons by SocialErrorCard. This keeps copy and
// recovery affordances consistent everywhere an error surfaces.
// ---------------------------------------------------------------------------

// Available recovery actions. `support` is only rendered when a support system
// exists in the app (this app has a Contact page + Help center, so it is on).
export const ERROR_ACTIONS = {
  reconnect: { label: "Reconnect account", to: "/admin/marketing/social/connections" },
  retry: { label: "Retry post" },
  edit: { label: "Edit post" },
  reschedule: { label: "Reschedule" },
  viewLogs: { label: "View logs", to: "/admin/marketing/social/logs" },
  connectFacebookPage: { label: "Connect Facebook Page", to: "/admin/marketing/social/connections" },
  connectInstagram: { label: "Connect Instagram account", to: "/admin/marketing/social/connections" },
  approve: { label: "Review & approve", to: "/admin/marketing/social/approvals" },
  resumeCampaign: { label: "Resume campaign" },
  support: { label: "Contact support", to: "/contact" },
};

const DEFAULT_ERROR = {
  title: "Something went wrong",
  happened: "An unexpected error occurred while processing this action.",
  nextStep: "Try again in a moment. If it keeps happening, review the logs or contact support.",
  severity: "error",
  actions: ["retry", "viewLogs", "support"],
};

// --- OAuth / connection errors --------------------------------------------
const OAUTH = {
  oauth_permission_denied: {
    title: "Permission was denied",
    happened: "You declined the permissions the app needs to connect this account.",
    nextStep: "Reconnect and approve all requested permissions so we can publish on your behalf.",
    actions: ["reconnect", "support"],
  },
  oauth_invalid_state: {
    title: "Connection could not be verified",
    happened: "The connection request couldn't be verified (the security check failed). This usually happens if the flow was left open too long.",
    nextStep: "Start the connection again from the Connections page.",
    actions: ["reconnect", "support"],
  },
  oauth_missing_code: {
    title: "Connection didn't complete",
    happened: "The platform didn't return an authorization code, so the connection couldn't finish.",
    nextStep: "Try connecting again. Make sure pop-ups aren't blocked.",
    actions: ["reconnect"],
  },
  oauth_expired_code: {
    title: "Connection link expired",
    happened: "The authorization link expired before it could be exchanged.",
    nextStep: "Reconnect the account to get a fresh authorization.",
    actions: ["reconnect"],
  },
  oauth_missing_scopes: {
    title: "Missing required permissions",
    happened: "The account connected, but some required permissions were not granted.",
    nextStep: "Reconnect and approve every requested permission so publishing works.",
    actions: ["reconnect", "support"],
  },
  oauth_token_exchange_failed: {
    title: "Couldn't finish connecting",
    happened: "We reached the platform but the final token exchange failed.",
    nextStep: "Try reconnecting. If the platform is having issues, wait a few minutes and retry.",
    actions: ["reconnect", "viewLogs"],
  },
  refresh_token_missing: {
    title: "Account needs to be reconnected",
    happened: "There's no refresh token stored for this account, so we can't keep the connection alive automatically.",
    nextStep: "Reconnect the account to restore long-lived access.",
    actions: ["reconnect"],
  },
  refresh_token_expired: {
    title: "Connection expired",
    happened: "The stored refresh token has expired, so the account can no longer publish.",
    nextStep: "Reconnect the account to resume scheduling and publishing.",
    actions: ["reconnect"],
  },
  revoked_access: {
    title: "Access was revoked",
    happened: "Access for this account was revoked on the platform side.",
    nextStep: "Reconnect the account and re-approve permissions.",
    actions: ["reconnect", "support"],
  },
  expired_authorization: {
    title: "Authorization expired",
    happened: "This account's authorization has expired.",
    nextStep: "Reconnect the account to continue.",
    actions: ["reconnect"],
  },
  account_token_expired: {
    title: "Account token expired",
    happened: "The access token for this account expired.",
    nextStep: "Reconnect the account to refresh access.",
    actions: ["reconnect"],
  },
  meta_oauth_denied: {
    title: "Meta connection denied",
    happened: "The Facebook/Meta login was canceled or denied.",
    nextStep: "Reconnect through Meta and approve the requested permissions.",
    actions: ["reconnect", "support"],
  },
  facebook_page_permission_missing: {
    title: "Facebook Page permission missing",
    happened: "The connected account doesn't have permission to publish to the selected Facebook Page.",
    nextStep: "Connect a Facebook Page you manage and grant the Page publishing permissions.",
    actions: ["connectFacebookPage", "reconnect", "support"],
  },
  facebook_page_missing: {
    title: "No Facebook Page connected",
    happened: "This post targets Facebook, but no Facebook Page is connected.",
    nextStep: "Connect a Facebook Page, then reschedule the post.",
    actions: ["connectFacebookPage", "reschedule"],
  },
  instagram_account_not_found: {
    title: "Instagram account not found",
    happened: "We couldn't find an Instagram account linked to your connected Page.",
    nextStep: "Connect an Instagram professional account linked to your Facebook Page.",
    actions: ["connectInstagram", "support"],
  },
  instagram_not_professional: {
    title: "Instagram account isn't a professional account",
    happened: "Publishing requires an Instagram Business or Creator account. The connected account is a personal profile.",
    nextStep: "Switch your Instagram to a Business or Creator account, then reconnect it.",
    actions: ["connectInstagram", "support"],
  },
  meta_app_review_missing: {
    title: "Meta app review pending",
    happened: "A required Meta permission hasn't been approved through app review yet.",
    nextStep: "Complete Meta app review for the required permissions, then reconnect.",
    actions: ["reconnect", "support"],
  },
  account_disconnected: {
    title: "Account disconnected",
    happened: "This account is no longer connected.",
    nextStep: "Reconnect the account to resume publishing.",
    actions: ["reconnect"],
  },
};

// --- Publishing errors -----------------------------------------------------
const PUBLISHING = {
  missing_permission: {
    title: "Missing publishing permission",
    happened: "The platform rejected the request because a required permission is missing.",
    nextStep: "Reconnect the account and approve all permissions, then retry.",
    actions: ["reconnect", "retry", "viewLogs"],
  },
  rate_limited: {
    title: "Platform rate limit reached",
    happened: "The platform temporarily limited how often we can post.",
    nextStep: "We'll automatically retry shortly. You can also retry manually a bit later.",
    severity: "warning",
    actions: ["retry", "viewLogs"],
  },
  platform_rejected_content: {
    title: "Platform rejected the post",
    happened: "The platform refused to publish this content.",
    nextStep: "Edit the post to meet the platform's rules, then reschedule.",
    actions: ["edit", "reschedule", "viewLogs"],
  },
  duplicate_content: {
    title: "Duplicate content",
    happened: "The platform flagged this as a duplicate of a recent post.",
    nextStep: "Edit the content to make it unique, then reschedule.",
    actions: ["edit", "reschedule"],
  },
  media_upload_failed: {
    title: "Media upload failed",
    happened: "We couldn't upload the attached media to the platform.",
    nextStep: "We'll retry automatically. If it keeps failing, edit the post and replace the media.",
    severity: "warning",
    actions: ["retry", "edit", "viewLogs"],
  },
  missing_subreddit: {
    title: "Subreddit is missing",
    happened: "This Reddit post doesn't have a target subreddit.",
    nextStep: "Edit the post and choose a subreddit, then reschedule.",
    actions: ["edit", "reschedule"],
  },
  subreddit_requires_flair: {
    title: "Reddit flair required",
    happened: "The target subreddit requires post flair, which wasn't set.",
    nextStep: "Edit the post to add the required flair, then reschedule.",
    actions: ["edit", "reschedule"],
  },
  linkedin_org_permission_missing: {
    title: "LinkedIn organization permission missing",
    happened: "The connected account can't post on behalf of the selected organization/page.",
    nextStep: "Reconnect with an account that has posting rights, or post as the personal profile.",
    actions: ["reconnect", "edit", "support"],
  },
  linkedin_author_missing: {
    title: "LinkedIn author missing",
    happened: "We couldn't determine who should author this LinkedIn post.",
    nextStep: "Reconnect the LinkedIn account, then reschedule.",
    actions: ["reconnect", "reschedule"],
  },
  twitter_post_too_long: {
    title: "Post is too long for X",
    happened: "The post exceeds X/Twitter's character limit.",
    nextStep: "Edit the post to shorten it (or split it into a thread), then reschedule.",
    actions: ["edit", "reschedule"],
  },
  facebook_page_token_expired: {
    title: "Facebook Page token expired",
    happened: "The Facebook Page access token expired.",
    nextStep: "Reconnect the Facebook Page, then retry.",
    actions: ["connectFacebookPage", "reconnect", "retry"],
  },
  facebook_post_rejected: {
    title: "Facebook rejected the post",
    happened: "Facebook refused to publish this post.",
    nextStep: "Edit the post to meet Facebook's rules, then reschedule.",
    actions: ["edit", "reschedule", "viewLogs"],
  },
  facebook_media_upload_failed: {
    title: "Facebook media upload failed",
    happened: "We couldn't upload the image or video to Facebook.",
    nextStep: "We'll retry automatically. If it persists, edit the post and replace the media.",
    severity: "warning",
    actions: ["retry", "edit"],
  },
  instagram_media_required: {
    title: "Instagram needs media",
    happened: "Instagram doesn't allow text-only posts — an image, video, or Reel is required.",
    nextStep: "Edit the post and add media, then reschedule.",
    actions: ["edit", "reschedule"],
  },
  instagram_container_creation_failed: {
    title: "Instagram media couldn't be prepared",
    happened: "We couldn't create the Instagram media container.",
    nextStep: "We'll retry automatically. If it persists, edit the post and check the media.",
    severity: "warning",
    actions: ["retry", "edit", "viewLogs"],
  },
  instagram_container_not_ready: {
    title: "Instagram media still processing",
    happened: "Instagram is still processing the video/Reel.",
    nextStep: "No action needed — we'll retry automatically once it's ready.",
    severity: "warning",
    actions: ["retry", "viewLogs"],
  },
  instagram_publish_limit_reached: {
    title: "Instagram publish limit reached",
    happened: "You've hit Instagram's publishing limit for now.",
    nextStep: "Wait a while before publishing more to Instagram, then retry.",
    severity: "warning",
    actions: ["retry", "reschedule"],
  },
  instagram_media_rejected: {
    title: "Instagram rejected the media",
    happened: "Instagram rejected the media (wrong format, aspect ratio, or size).",
    nextStep: "Edit the post and replace the media with a supported format, then reschedule.",
    actions: ["edit", "reschedule"],
  },
  instagram_media_publish_failed: {
    title: "Instagram publish failed",
    happened: "The Instagram media was prepared but publishing failed.",
    nextStep: "We'll retry automatically. You can also retry manually.",
    severity: "warning",
    actions: ["retry", "viewLogs"],
  },
  network_timeout: {
    title: "Network timeout",
    happened: "The platform didn't respond in time.",
    nextStep: "We'll retry automatically. You can also retry manually.",
    severity: "warning",
    actions: ["retry", "viewLogs"],
  },
  unknown_platform_error: {
    title: "Unknown platform error",
    happened: "The platform returned an unexpected error.",
    nextStep: "Retry the post. If it keeps failing, review the logs or contact support.",
    actions: ["retry", "viewLogs", "support"],
  },
};

// --- Scheduling errors -----------------------------------------------------
const SCHEDULING = {
  scheduled_in_past: {
    title: "Scheduled time is in the past",
    happened: "The chosen publish time has already passed.",
    nextStep: "Reschedule the post for a future time.",
    actions: ["reschedule"],
  },
  missing_connected_account: {
    title: "No connected account",
    happened: "There's no connected account for this platform to publish from.",
    nextStep: "Connect the account, then reschedule.",
    actions: ["reconnect", "reschedule"],
  },
  missing_facebook_page: {
    title: "No Facebook Page selected",
    happened: "Facebook posts need a target Page, but none is selected.",
    nextStep: "Connect a Facebook Page, then reschedule.",
    actions: ["connectFacebookPage", "reschedule"],
  },
  missing_instagram_media: {
    title: "Instagram media missing",
    happened: "Instagram posts require media before they can be scheduled.",
    nextStep: "Edit the post to add an image, video, or Reel, then reschedule.",
    actions: ["edit", "reschedule"],
  },
  post_not_approved: {
    title: "Post isn't approved yet",
    happened: "Only approved posts can be scheduled.",
    nextStep: "Send the post for review and approve it, then schedule.",
    actions: ["approve", "edit"],
  },
  campaign_paused: {
    title: "Campaign is paused",
    happened: "This post belongs to a paused campaign, so it won't be scheduled.",
    nextStep: "Resume the campaign, then schedule the post.",
    actions: ["resumeCampaign", "viewLogs"],
  },
  campaign_archived: {
    title: "Campaign is archived",
    happened: "This post belongs to an archived campaign and can't be scheduled.",
    nextStep: "Move the post to an active campaign, or restore the campaign.",
    actions: ["edit", "viewLogs"],
  },
  duplicate_scheduled_post: {
    title: "Already scheduled",
    happened: "This post is already scheduled for this platform.",
    nextStep: "Open the existing scheduled job instead of creating a duplicate.",
    severity: "warning",
    actions: ["viewLogs"],
  },
  missing_platform_payload: {
    title: "Post details are incomplete",
    happened: "The platform-specific content for this post is missing.",
    nextStep: "Edit the post to complete the platform content, then reschedule.",
    actions: ["edit", "reschedule"],
  },
};

// --- Analytics errors ------------------------------------------------------
const ANALYTICS = {
  post_deleted: {
    title: "Post was deleted",
    happened: "The original post no longer exists on the platform, so analytics can't be collected.",
    nextStep: "No action needed. The post was removed on the platform side.",
    severity: "warning",
    actions: ["viewLogs"],
  },
  metrics_unavailable: {
    title: "Metrics unavailable",
    happened: "The platform didn't return metrics for this post.",
    nextStep: "Metrics may appear later. We'll try again on the next sync.",
    severity: "warning",
    actions: ["viewLogs"],
  },
  analytics_permission_missing: {
    title: "Analytics permission missing",
    happened: "The connected account lacks permission to read insights.",
    nextStep: "Reconnect the account and grant insights/read permissions.",
    actions: ["reconnect", "support"],
  },
  analytics_rate_limited: {
    title: "Analytics rate limited",
    happened: "The platform limited how often we can read analytics.",
    nextStep: "No action needed — we'll retry on the next scheduled sync.",
    severity: "warning",
    actions: ["viewLogs"],
  },
  analytics_token_expired: {
    title: "Token expired for analytics",
    happened: "The account token expired, so analytics can't be read.",
    nextStep: "Reconnect the account to resume analytics collection.",
    actions: ["reconnect"],
  },
  facebook_insights_unavailable: {
    title: "Facebook insights unavailable",
    happened: "Facebook Page insights couldn't be read for this post.",
    nextStep: "Check the Page permissions and reconnect if needed.",
    severity: "warning",
    actions: ["connectFacebookPage", "reconnect", "viewLogs"],
  },
  instagram_insights_unavailable: {
    title: "Instagram insights unavailable",
    happened: "Instagram insights couldn't be read for this post.",
    nextStep: "Check the Instagram account permissions and reconnect if needed.",
    severity: "warning",
    actions: ["connectInstagram", "reconnect", "viewLogs"],
  },
};

export const SOCIAL_ERROR_CATALOG = {
  ...OAUTH,
  ...PUBLISHING,
  ...SCHEDULING,
  ...ANALYTICS,
};

// Some codes used by the publishing worker map onto catalog entries above.
const CODE_ALIASES = {
  instagram_account_missing: "instagram_account_not_found",
  instagram_token_expired: "account_token_expired",
  instagram_permission_missing: "missing_permission",
  facebook_token_expired: "facebook_page_token_expired",
};

// Resolve a raw error code (plus optional fallback message) into a display object.
export function resolveSocialError(code, fallbackMessage) {
  const key = CODE_ALIASES[code] || code;
  const entry = SOCIAL_ERROR_CATALOG[key];
  if (entry) {
    return { code: key, severity: "error", ...entry };
  }
  return {
    code: code || "unknown_platform_error",
    ...DEFAULT_ERROR,
    happened: fallbackMessage || DEFAULT_ERROR.happened,
  };
}