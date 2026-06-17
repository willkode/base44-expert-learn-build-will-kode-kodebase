// Friendly messaging + retry/reconnect mapping for auto-posting failures.

export const ERROR_DETAILS = {
  missing_connected_account: { label: "No connected account", hint: "This platform isn't connected.", reconnect: true, retry: false },
  expired_authorization: { label: "Authorization expired", hint: "The account needs to be reconnected.", reconnect: true, retry: false },
  missing_permission: { label: "Missing permission", hint: "The connected account lacks a required permission.", reconnect: true, retry: false },
  rate_limited: { label: "Rate limited", hint: "The platform throttled the request. A retry is scheduled.", reconnect: false, retry: true },
  media_upload_failed: { label: "Media upload failed", hint: "The image/video couldn't be uploaded.", reconnect: false, retry: true },
  platform_rejected_content: { label: "Content rejected", hint: "The platform rejected the content.", reconnect: false, retry: false },
  subreddit_requires_flair: { label: "Flair required", hint: "This subreddit requires post flair.", reconnect: false, retry: false },
  linkedin_author_missing: { label: "LinkedIn author missing", hint: "Reconnect LinkedIn to restore the author identity.", reconnect: true, retry: false },
  facebook_page_missing: { label: "Facebook Page missing", hint: "Select a Facebook Page for this post.", reconnect: true, retry: false },
  facebook_page_permission_missing: { label: "Page permission missing", hint: "Reconnect the Page with publishing permissions.", reconnect: true, retry: false },
  facebook_page_token_expired: { label: "Page token expired", hint: "Reconnect the Facebook Page.", reconnect: true, retry: false },
  facebook_post_rejected: { label: "Facebook rejected post", hint: "Facebook rejected the content.", reconnect: false, retry: false },
  facebook_media_upload_failed: { label: "FB media upload failed", hint: "Facebook media upload failed.", reconnect: false, retry: true },
  instagram_account_missing: { label: "Instagram account missing", hint: "Connect an Instagram professional account.", reconnect: true, retry: false },
  instagram_media_required: { label: "Instagram media required", hint: "Add an image, video, or Reel.", reconnect: false, retry: false },
  instagram_container_creation_failed: { label: "IG container failed", hint: "Creating the media container failed.", reconnect: false, retry: true },
  instagram_container_not_ready: { label: "IG media not ready", hint: "The media wasn't ready in time. A retry is scheduled.", reconnect: false, retry: true },
  instagram_publish_limit_reached: { label: "IG publish limit", hint: "Instagram's daily publish limit was reached.", reconnect: false, retry: false },
  instagram_media_publish_failed: { label: "IG publish failed", hint: "Publishing the media failed.", reconnect: false, retry: true },
  instagram_permission_missing: { label: "IG permission missing", hint: "Reconnect Instagram with publishing permissions.", reconnect: true, retry: false },
  instagram_token_expired: { label: "Instagram token expired", hint: "Reconnect the linked account.", reconnect: true, retry: false },
  unknown_platform_error: { label: "Unknown error", hint: "An unexpected error occurred. A retry may be scheduled.", reconnect: false, retry: true },
};

export function errorInfo(code) {
  return ERROR_DETAILS[code] || { label: code || "Error", hint: "", reconnect: false, retry: true };
}