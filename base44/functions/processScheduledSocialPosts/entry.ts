import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ---------------------------------------------------------------------------
// Auto-Posting Worker
// Picks up due ScheduledPost records (status=queued, scheduled_at <= now),
// locks each, validates, publishes to the right platform, and records results.
// Backend functions can't share local imports, so all helpers are inlined here.
// ---------------------------------------------------------------------------

const RETRYABLE = new Set([
  "rate_limited",
  "media_upload_failed",
  "facebook_media_upload_failed",
  "instagram_container_creation_failed",
  "instagram_container_not_ready",
  "instagram_media_publish_failed",
  "unknown_platform_error",
]);

function nowIso() { return new Date().toISOString(); }

// AES-GCM token decryption (mirrors the token vault used at connect time).
async function decryptToken(encrypted) {
  if (!encrypted) return null;
  const secret = Deno.env.get("INTERNAL_FUNCTION_SECRET") || "";
  try {
    const raw = JSON.parse(atob(encrypted));
    if (!raw || !raw.iv || !raw.data) return encrypted; // plain fallback
    const keyMaterial = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
    const key = await crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, ["decrypt"]);
    const iv = new Uint8Array(raw.iv);
    const data = new Uint8Array(raw.data);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new TextDecoder().decode(decrypted);
  } catch (_e) {
    return encrypted; // treat as already-plain
  }
}

class PublishError extends Error {
  constructor(code, message, { retryable } = {}) {
    super(message || code);
    this.code = code;
    this.retryable = retryable != null ? retryable : RETRYABLE.has(code);
  }
}

// --- Token validation / refresh -------------------------------------------
function tokenExpired(account) {
  if (!account.token_expires_at) return false;
  return new Date(account.token_expires_at).getTime() <= Date.now() + 60_000;
}

async function ensureValidToken(base44, account, platform) {
  if (account.connection_status !== "connected") {
    throw new PublishError("missing_connected_account", `No connected ${platform} account.`, { retryable: false });
  }
  if (tokenExpired(account)) {
    // Without a stored refresh token we cannot silently refresh.
    const hasRefresh = !!account.refresh_token_encrypted;
    if (!hasRefresh) {
      throw new PublishError("expired_authorization", `${platform} authorization expired — reconnect the account.`, { retryable: false });
    }
    // A real refresh exchange would happen here per-platform; mark expired so the
    // admin reconnects rather than risk publishing with a stale token.
    throw new PublishError("expired_authorization", `${platform} token needs refresh — reconnect the account.`, { retryable: false });
  }
  return await decryptToken(account.access_token_encrypted);
}

// --- Per-platform publishers ----------------------------------------------
// Uploads media to X's v1.1 media endpoint and returns a media_id string.
async function uploadTwitterMedia(token, mediaUrl) {
  // Fetch the image bytes, then upload to X.
  const imgRes = await fetch(mediaUrl);
  if (!imgRes.ok) throw new PublishError("media_upload_failed", "Could not fetch the image to upload to X.");
  const bytes = new Uint8Array(await imgRes.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  const form = new URLSearchParams({ media_data: b64 });
  const up = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (up.status === 429) throw new PublishError("rate_limited", "X media rate limit hit.");
  if (!up.ok) throw new PublishError("media_upload_failed", `X media upload failed (${up.status}).`);
  const data = await up.json().catch(() => ({}));
  const id = data.media_id_string || (data.media_id != null ? String(data.media_id) : "");
  if (!id) throw new PublishError("media_upload_failed", "X did not return a media id.");
  return id;
}

// Posts a single tweet; optional reply-to (for threads), media, reply settings, quote.
async function postTweet(token, { text, mediaId, replyToId, replySettings, quoteId }) {
  const tweetBody = { text };
  if (mediaId) tweetBody.media = { media_ids: [mediaId] };
  if (replyToId) tweetBody.reply = { in_reply_to_tweet_id: replyToId };
  if (quoteId) tweetBody.quote_tweet_id = quoteId;
  if (replySettings && replySettings !== "everyone") tweetBody.reply_settings = replySettings;

  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(tweetBody),
  });
  if (res.status === 429) throw new PublishError("rate_limited", "X rate limit hit.");
  if (res.status === 401 || res.status === 403) throw new PublishError("missing_permission", "X rejected the credentials/permissions.", { retryable: false });
  if (!res.ok) throw new PublishError("platform_rejected_content", `X rejected the post (${res.status}).`, { retryable: false });
  const data = await res.json().catch(() => ({}));
  const id = data?.data?.id;
  if (!id) throw new PublishError("platform_rejected_content", "X did not return a tweet id.", { retryable: false });
  return id;
}

async function publishToTwitter(payload, ctx) {
  const token = await ensureValidToken(ctx.base44, ctx.account, "twitter");
  const v = ctx.post.platform_variants || {};
  const text = (payload.text || payload.message || v.twitter_text || ctx.post.content || "").trim();
  const thread = (payload.thread && payload.thread.length ? payload.thread : (v.twitter_thread || []))
    .filter((t) => (t || "").trim());
  if (!text && !thread.length) throw new PublishError("platform_rejected_content", "Tweet text is empty.", { retryable: false });

  // Upload media first if present, so it can be attached to the first tweet.
  let mediaId = payload.media_id || "";
  const mediaUrl = payload.media_url || (payload.media_urls && payload.media_urls[0]) || ctx.post.image_url || "";
  if (mediaUrl && !mediaId) {
    mediaId = await uploadTwitterMedia(token, mediaUrl);
  }

  const allTweetIds = [];
  // 1) First tweet.
  const firstText = text || thread[0];
  const replies = text ? thread : thread.slice(1);
  const firstId = await postTweet(token, {
    text: firstText,
    mediaId: mediaId || undefined,
    replySettings: payload.reply_settings,
    quoteId: payload.quote_post_id || undefined,
  });
  allTweetIds.push(firstId);
  await log(ctx.base44, { status: "success", platform: "twitter", message: "Posted first tweet.", job: ctx.job, metadata: { tweet_id: firstId } });

  // 2) Replies in order.
  let prevId = firstId;
  for (let i = 0; i < replies.length; i++) {
    const replyId = await postTweet(token, { text: replies[i], replyToId: prevId });
    allTweetIds.push(replyId);
    prevId = replyId;
    await log(ctx.base44, { status: "success", platform: "twitter", message: `Posted thread reply ${i + 1}.`, job: ctx.job, metadata: { tweet_id: replyId } });
  }

  return {
    platform_post_id: firstId,
    platform_post_url: `https://twitter.com/i/web/status/${firstId}`,
    thread_post_ids: allTweetIds,
  };
}

async function publishToReddit(payload, ctx) {
  const token = await ensureValidToken(ctx.base44, ctx.account, "reddit");
  const v = ctx.post.platform_variants || {};
  const title = payload.title || v.reddit_title;
  if (!title) throw new PublishError("platform_rejected_content", "Reddit title is required.", { retryable: false });
  const subreddit = (payload.subreddit || ctx.account.platform_username || "").trim();
  if (!subreddit) throw new PublishError("platform_rejected_content", "Reddit subreddit is required.", { retryable: false });

  // Map our post kind to Reddit's submit "kind" + content fields.
  const requestedKind = payload.reddit_post_kind || "self";
  const mediaUrls = payload.media_urls || (ctx.post.image_url ? [ctx.post.image_url] : []);
  const fields = {
    sr: subreddit,
    title,
    api_type: "json",
    nsfw: payload.nsfw ? "true" : "false",
    spoiler: payload.spoiler ? "true" : "false",
    sendreplies: payload.send_replies === false ? "false" : "true",
  };
  if (payload.flair_id) fields.flair_id = payload.flair_id;
  if (payload.flair_text) fields.flair_text = payload.flair_text;

  if (requestedKind === "link") {
    if (!payload.link_url) throw new PublishError("platform_rejected_content", "Reddit link post requires a URL.", { retryable: false });
    fields.kind = "link";
    fields.url = payload.link_url;
  } else if (requestedKind === "image") {
    // Reddit's media upload flow differs; without it, submit the image as a link post to its URL.
    if (!mediaUrls.length) throw new PublishError("instagram_media_required", "Reddit image post requires an image.", { retryable: false });
    fields.kind = "link";
    fields.url = mediaUrls[0];
  } else {
    fields.kind = "self";
    fields.text = payload.body || v.reddit_body || ctx.post.content || "";
  }

  const res = await fetch("https://oauth.reddit.com/api/submit", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "KodeBaseSocial/1.0" },
    body: new URLSearchParams(fields).toString(),
  });
  if (res.status === 429) throw new PublishError("rate_limited", "Reddit rate limit hit.");
  if (res.status === 401 || res.status === 403) throw new PublishError("missing_permission", "Reddit rejected the credentials.", { retryable: false });
  const data = await res.json().catch(() => ({}));
  const errors = data?.json?.errors || [];
  if (errors.length) {
    const flat = JSON.stringify(errors).toLowerCase();
    if (flat.includes("flair")) throw new PublishError("subreddit_requires_flair", "This subreddit requires post flair.", { retryable: false });
    throw new PublishError("platform_rejected_content", `Reddit rejected the post: ${errors[0]?.[1] || "unknown"}.`, { retryable: false });
  }
  const url = data?.json?.data?.url || "";
  const id = data?.json?.data?.id || data?.json?.data?.name || "";

  // Best-effort: post the suggested first comment for context.
  if (payload.suggested_comment && (data?.json?.data?.name || id)) {
    try {
      await fetch("https://oauth.reddit.com/api/comment", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "KodeBaseSocial/1.0" },
        body: new URLSearchParams({ api_type: "json", thing_id: data?.json?.data?.name || id, text: payload.suggested_comment }).toString(),
      });
    } catch (_e) { /* non-fatal */ }
  }
  return { platform_post_id: id, platform_post_url: url };
}

async function publishToLinkedIn(payload, ctx) {
  const token = await ensureValidToken(ctx.base44, ctx.account, "linkedin");
  const authorUrn = ctx.account.platform_account_id ? `urn:li:person:${ctx.account.platform_account_id}` : "";
  if (!authorUrn) throw new PublishError("linkedin_author_missing", "LinkedIn author URN is missing — reconnect the account.", { retryable: false });
  const text = (ctx.post.platform_variants?.linkedin_text || ctx.post.content || "").trim();
  if (!text) throw new PublishError("platform_rejected_content", "LinkedIn post text is empty.", { retryable: false });
  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Restli-Protocol-Version": "2.0.0" },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: { "com.linkedin.ugc.ShareContent": { shareCommentary: { text }, shareMediaCategory: "NONE" } },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });
  if (res.status === 429) throw new PublishError("rate_limited", "LinkedIn rate limit hit.");
  if (res.status === 401 || res.status === 403) throw new PublishError("missing_permission", "LinkedIn rejected the credentials/permissions.", { retryable: false });
  if (!res.ok) throw new PublishError("platform_rejected_content", `LinkedIn rejected the post (${res.status}).`, { retryable: false });
  const id = res.headers.get("x-restli-id") || "";
  return { platform_post_id: id, platform_post_url: id ? `https://www.linkedin.com/feed/update/${id}` : "" };
}

async function publishToFacebook(payload, ctx) {
  const account = ctx.account;
  const pageId = payload.facebook_page_id || account.facebook_page_id || account.selected_default_facebook_page_id;
  if (!pageId) throw new PublishError("facebook_page_missing", "No Facebook Page selected for this post.", { retryable: false });
  if (!account.facebook_page_access_token_encrypted) throw new PublishError("facebook_page_token_expired", "Facebook Page token missing — reconnect the Page.", { retryable: false });
  const pageToken = await decryptToken(account.facebook_page_access_token_encrypted);
  if (!pageToken) throw new PublishError("facebook_page_permission_missing", "Facebook Page access token is invalid — reconnect the Page.", { retryable: false });

  const message = payload.message || ctx.post.platform_variants?.facebook_text || ctx.post.content || "";
  const mediaUrls = payload.media_urls || ctx.post.platform_variants?.facebook_media_urls || (ctx.post.image_url ? [ctx.post.image_url] : []);
  let endpoint, fields;
  if (mediaUrls.length) {
    endpoint = `https://graph.facebook.com/v19.0/${pageId}/photos`;
    fields = { url: mediaUrls[0], caption: message, access_token: pageToken };
  } else {
    endpoint = `https://graph.facebook.com/v19.0/${pageId}/feed`;
    fields = { message, access_token: pageToken };
    if (payload.link_url) fields.link = payload.link_url;
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 429 || data?.error?.code === 4 || data?.error?.code === 32) throw new PublishError("rate_limited", "Facebook rate limit hit.");
  if (data?.error) {
    const sub = String(data.error.message || "").toLowerCase();
    if (data.error.code === 190) throw new PublishError("facebook_page_token_expired", "Facebook Page token expired — reconnect the Page.", { retryable: false });
    if (data.error.code === 200 || sub.includes("permission")) throw new PublishError("facebook_page_permission_missing", "Missing Facebook Page publish permission.", { retryable: false });
    if (sub.includes("upload") || sub.includes("photo")) throw new PublishError("facebook_media_upload_failed", "Facebook media upload failed.");
    throw new PublishError("facebook_post_rejected", `Facebook rejected the post: ${data.error.message}.`, { retryable: false });
  }
  if (!res.ok) throw new PublishError("facebook_post_rejected", `Facebook rejected the post (${res.status}).`, { retryable: false });
  const id = data.post_id || data.id || "";
  return { platform_post_id: id, platform_post_url: id ? `https://www.facebook.com/${id}` : "" };
}

const IG_API = "https://graph.facebook.com/v19.0";

function isVideoUrl(u) { return /\.(mp4|mov|m4v|webm)(\?|$)/i.test(u || ""); }

// Maps a Meta Graph error into a precise PublishError code.
function instagramError(err, fallbackCode, fallbackMsg) {
  const msg = String(err?.message || "").toLowerCase();
  if (err?.code === 190) return new PublishError("instagram_token_expired", "Instagram token expired — reconnect.", { retryable: false });
  if (msg.includes("permission") || err?.code === 200 || err?.code === 10) {
    return new PublishError("instagram_permission_missing", "Missing Instagram publishing permission.", { retryable: false });
  }
  if (msg.includes("limit") || err?.code === 4 || err?.code === 17) {
    return new PublishError("instagram_publish_limit_reached", "Instagram publish limit reached — try again later.", { retryable: false });
  }
  if (msg.includes("not a valid") || msg.includes("media") || msg.includes("aspect") || msg.includes("format")) {
    return new PublishError("instagram_media_rejected", `Instagram rejected the media: ${err?.message || "invalid media"}.`, { retryable: false });
  }
  return new PublishError(fallbackCode, `${fallbackMsg}${err?.message ? ": " + err.message : "."}`);
}

// Creates a single media container (used directly for image/video/reel/story,
// and per-item for carousel children).
async function createIgContainer(igId, token, fields) {
  const res = await fetch(`${IG_API}/${igId}/media`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...fields, access_token: token }),
  });
  const data = await res.json().catch(() => ({}));
  if (data?.error) throw instagramError(data.error, "instagram_container_creation_failed", "Failed to create Instagram media container");
  if (!data.id) throw new PublishError("instagram_container_creation_failed", "Failed to create Instagram media container.");
  return data.id;
}

// Polls a container until it is FINISHED (videos/reels process asynchronously).
async function waitForIgContainer(containerId, token, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(`${IG_API}/${containerId}?fields=status_code,status&access_token=${encodeURIComponent(token)}`);
    const data = await res.json().catch(() => ({}));
    const code = data.status_code;
    if (code === "FINISHED" || code === "PUBLISHED") return true;
    if (code === "ERROR") throw new PublishError("instagram_media_rejected", `Instagram could not process the media (${data.status || "error"}).`, { retryable: false });
    // Still IN_PROGRESS — wait, then retry within this run.
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 2500));
  }
  // Not ready yet — let the job retry on the next worker pass.
  throw new PublishError("instagram_container_not_ready", "Instagram media is still processing — will retry.");
}

async function publishToInstagram(payload, ctx) {
  const account = ctx.account;
  const igId = payload.instagram_business_account_id || account.instagram_business_account_id || account.selected_default_instagram_account_id;
  if (!igId) throw new PublishError("instagram_account_missing", "No Instagram professional account connected.", { retryable: false });

  const v = ctx.post.platform_variants || {};
  const mediaUrls = (payload.media_urls && payload.media_urls.length ? payload.media_urls : (v.instagram_media_urls || (ctx.post.image_url ? [ctx.post.image_url] : [])))
    .filter((m) => (m || "").trim());
  if (!mediaUrls.length) throw new PublishError("instagram_media_required", "Instagram requires an image, video, or Reel — text-only posts are not allowed.", { retryable: false });

  if (!account.facebook_page_access_token_encrypted) throw new PublishError("instagram_token_expired", "Instagram token missing — reconnect the linked Page.", { retryable: false });
  const token = await decryptToken(account.facebook_page_access_token_encrypted);
  if (!token) throw new PublishError("instagram_permission_missing", "Instagram access token invalid — reconnect the account.", { retryable: false });

  const mediaType = payload.media_type || v.instagram_media_type || "image";
  const caption = payload.caption || v.instagram_caption || ctx.post.content || "";

  let containerId;

  // 1) Build the media container per media type.
  if (mediaType === "carousel") {
    if (mediaUrls.length < 2) throw new PublishError("instagram_media_rejected", "Carousels need at least 2 media items.", { retryable: false });
    const childIds = [];
    for (const url of mediaUrls.slice(0, 10)) {
      const childFields = isVideoUrl(url)
        ? { media_type: "VIDEO", video_url: url, is_carousel_item: true }
        : { image_url: url, is_carousel_item: true };
      const childId = await createIgContainer(igId, token, childFields);
      if (isVideoUrl(url)) await waitForIgContainer(childId, token);
      childIds.push(childId);
    }
    await log(ctx.base44, { status: "success", platform: "instagram", message: `Created ${childIds.length} carousel item(s).`, job: ctx.job, metadata: { children: childIds } });
    containerId = await createIgContainer(igId, token, { media_type: "CAROUSEL", caption, children: childIds.join(",") });
    ctx.containerMeta = { children_container_ids: childIds };
  } else if (mediaType === "reel") {
    containerId = await createIgContainer(igId, token, {
      media_type: "REELS", video_url: mediaUrls[0], caption, share_to_feed: payload.share_to_feed !== false,
    });
    await waitForIgContainer(containerId, token);
  } else if (mediaType === "video") {
    containerId = await createIgContainer(igId, token, { media_type: "VIDEO", video_url: mediaUrls[0], caption });
    await waitForIgContainer(containerId, token);
  } else if (mediaType === "story") {
    const storyFields = isVideoUrl(mediaUrls[0])
      ? { media_type: "STORIES", video_url: mediaUrls[0] }
      : { media_type: "STORIES", image_url: mediaUrls[0] };
    containerId = await createIgContainer(igId, token, storyFields);
    if (isVideoUrl(mediaUrls[0])) await waitForIgContainer(containerId, token);
  } else {
    // Single image.
    containerId = await createIgContainer(igId, token, { image_url: mediaUrls[0], caption });
    await waitForIgContainer(containerId, token);
  }

  await log(ctx.base44, { status: "success", platform: "instagram", message: `Container ready (${mediaType}).`, job: ctx.job, metadata: { container_id: containerId } });

  // 2) Publish the container.
  const pubRes = await fetch(`${IG_API}/${igId}/media_publish`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: containerId, access_token: token }),
  });
  const pubData = await pubRes.json().catch(() => ({}));
  if (pubData?.error) throw instagramError(pubData.error, "instagram_media_publish_failed", "Instagram publish failed");
  if (!pubData.id) throw new PublishError("instagram_media_publish_failed", "Instagram publish failed.");
  const mediaId = pubData.id;

  // 3) Resolve the permalink (best-effort).
  let permalink = "";
  try {
    const linkRes = await fetch(`${IG_API}/${mediaId}?fields=permalink&access_token=${encodeURIComponent(token)}`);
    const linkData = await linkRes.json().catch(() => ({}));
    permalink = linkData.permalink || "";
  } catch (_e) { /* non-fatal */ }

  // 4) Best-effort first comment (e.g. a clean hashtag block).
  if (payload.first_comment && (payload.first_comment || "").trim()) {
    try {
      await fetch(`${IG_API}/${mediaId}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: payload.first_comment, access_token: token }),
      });
      await log(ctx.base44, { status: "success", platform: "instagram", message: "Posted first comment.", job: ctx.job, metadata: {} });
    } catch (_e) { /* non-fatal */ }
  }

  return {
    platform_post_id: mediaId,
    platform_post_url: permalink || `https://www.instagram.com/${account.instagram_username || account.platform_username || ""}`,
    container_id: containerId,
    children_container_ids: (ctx.containerMeta && ctx.containerMeta.children_container_ids) || [],
  };
}

const PUBLISHERS = {
  twitter: publishToTwitter,
  reddit: publishToReddit,
  linkedin: publishToLinkedIn,
  facebook: publishToFacebook,
  instagram: publishToInstagram,
};

// --- Logging --------------------------------------------------------------
async function log(base44, { status, platform, message, job, metadata }) {
  try {
    await base44.asServiceRole.entities.SocialAutomationLog.create({
      account_id: "global",
      event_type: "post_attempt",
      platform,
      related_post_id: job?.social_post_id,
      related_campaign_id: job?.campaign_id,
      related_scheduled_post_id: job?.id,
      status,
      message,
      metadata: metadata || {},
    });
  } catch (_e) { /* best-effort */ }
}

// --- Per-post SocialPost rollup -------------------------------------------
async function rollupSocialPostStatus(base44, socialPostId) {
  if (!socialPostId) return;
  const jobs = await base44.asServiceRole.entities.ScheduledPost.filter({ social_post_id: socialPostId });
  if (!jobs.length) return;
  const statuses = jobs.map((j) => j.status);
  let publishing_status = "scheduled";
  if (statuses.every((s) => s === "published")) publishing_status = "published";
  else if (statuses.some((s) => s === "published") && statuses.some((s) => ["failed", "canceled"].includes(s))) publishing_status = "partially_published";
  else if (statuses.every((s) => s === "failed")) publishing_status = "failed";
  else if (statuses.some((s) => s === "published")) publishing_status = "partially_published";
  else if (statuses.some((s) => s === "processing")) publishing_status = "publishing";
  try { await base44.asServiceRole.entities.SocialPost.update(socialPostId, { publishing_status }); } catch (_e) { /* */ }
}

async function processJob(base44, job) {
  // 1) Lock: re-read and flip queued -> processing atomically-ish.
  const fresh = await base44.asServiceRole.entities.ScheduledPost.get(job.id);
  if (!fresh || fresh.status !== "queued") return { skipped: true };
  await base44.asServiceRole.entities.ScheduledPost.update(job.id, {
    status: "processing", last_attempt_at: nowIso(), attempt_count: (fresh.attempt_count || 0) + 1,
  });

  const platform = fresh.platform;
  try {
    // 2) Load related records.
    const post = fresh.social_post_id ? await base44.asServiceRole.entities.SocialPost.get(fresh.social_post_id) : null;
    if (!post) throw new PublishError("platform_rejected_content", "Linked social post not found.", { retryable: false });
    if (post.approval_status !== "approved") throw new PublishError("platform_rejected_content", "Post is not approved.", { retryable: false });

    if (fresh.campaign_id) {
      const campaign = await base44.asServiceRole.entities.SocialCampaign.get(fresh.campaign_id).catch(() => null);
      if (campaign && ["paused", "archived", "completed"].includes(campaign.status)) {
        throw new PublishError("platform_rejected_content", `Campaign is ${campaign.status}; not publishing.`, { retryable: false });
      }
    }

    const account = fresh.social_account_id
      ? await base44.asServiceRole.entities.SocialAccount.get(fresh.social_account_id).catch(() => null)
      : (await base44.asServiceRole.entities.SocialAccount.filter({ account_id: "global", platform }, "-last_connected_at", 1))[0];
    if (!account) throw new PublishError("missing_connected_account", `No connected ${platform} account.`, { retryable: false });

    // 3) Publish.
    const publisher = PUBLISHERS[platform];
    if (!publisher) throw new PublishError("unknown_platform_error", `Unknown platform: ${platform}.`, { retryable: false });
    const result = await publisher(fresh.platform_specific_payload || {}, { base44, account, post, job: fresh });

    // 4) Success.
    await base44.asServiceRole.entities.ScheduledPost.update(fresh.id, {
      status: "published",
      platform_post_id: result.platform_post_id || "",
      platform_post_url: result.platform_post_url || "",
      thread_post_ids: result.thread_post_ids || [],
      error_code: "", error_message: "", next_retry_at: "",
    });
    await rollupSocialPostStatus(base44, fresh.social_post_id);
    await log(base44, { status: "success", platform, message: `Published to ${platform}.`, job: fresh, metadata: { platform_post_id: result.platform_post_id } });
    return { published: true };
  } catch (err) {
    const code = err.code || "unknown_platform_error";
    const retryable = err.retryable != null ? err.retryable : RETRYABLE.has(code);
    const attempts = (fresh.attempt_count || 0) + 1;
    const maxAttempts = fresh.max_attempts || 3;
    const willRetry = retryable && attempts < maxAttempts;

    await base44.asServiceRole.entities.ScheduledPost.update(fresh.id, {
      status: willRetry ? "queued" : "failed",
      error_code: code,
      error_message: err.message || code,
      next_retry_at: willRetry ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : "",
    });
    await rollupSocialPostStatus(base44, fresh.social_post_id);
    await log(base44, {
      status: "error", platform,
      message: `${willRetry ? "Retry scheduled" : "Failed"}: ${err.message || code}`,
      job: fresh, metadata: { error_code: code, attempt: attempts, will_retry: willRetry },
    });
    return { failed: true, code };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow either an authenticated admin (manual trigger) or the scheduler.
    let isAdmin = false;
    try { const u = await base44.auth.me(); isAdmin = u?.role === "admin"; } catch (_e) { /* scheduler call */ }

    const due = await base44.asServiceRole.entities.ScheduledPost.filter(
      { status: "queued", scheduled_at: { $lte: nowIso() } },
      "scheduled_at",
      25,
    );

    const results = { processed: 0, published: 0, failed: 0, skipped: 0 };
    for (const job of due) {
      // Respect retry backoff window.
      if (job.next_retry_at && new Date(job.next_retry_at).getTime() > Date.now()) { results.skipped++; continue; }
      const r = await processJob(base44, job);
      results.processed++;
      if (r.published) results.published++;
      else if (r.failed) results.failed++;
      else if (r.skipped) results.skipped++;
    }

    return Response.json({ ok: true, triggered_by: isAdmin ? "admin" : "scheduler", ...results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});