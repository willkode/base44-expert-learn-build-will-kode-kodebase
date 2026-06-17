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
async function publishToTwitter(payload, ctx) {
  const token = await ensureValidToken(ctx.base44, ctx.account, "twitter");
  const text = (payload.message || ctx.post.platform_variants?.twitter_text || ctx.post.content || "").trim();
  if (!text) throw new PublishError("platform_rejected_content", "Tweet text is empty.", { retryable: false });
  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (res.status === 429) throw new PublishError("rate_limited", "X rate limit hit.");
  if (res.status === 401 || res.status === 403) throw new PublishError("missing_permission", "X rejected the credentials/permissions.", { retryable: false });
  if (!res.ok) throw new PublishError("platform_rejected_content", `X rejected the post (${res.status}).`, { retryable: false });
  const data = await res.json();
  const id = data?.data?.id;
  return { platform_post_id: id, platform_post_url: id ? `https://twitter.com/i/web/status/${id}` : "" };
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

async function publishToInstagram(payload, ctx) {
  const account = ctx.account;
  const igId = payload.instagram_business_account_id || account.instagram_business_account_id || account.selected_default_instagram_account_id;
  if (!igId) throw new PublishError("instagram_account_missing", "No Instagram professional account connected.", { retryable: false });
  const v = ctx.post.platform_variants || {};
  const mediaUrls = payload.media_urls || v.instagram_media_urls || (ctx.post.image_url ? [ctx.post.image_url] : []);
  if (!mediaUrls.length) throw new PublishError("instagram_media_required", "Instagram requires an image, video, or Reel.", { retryable: false });
  if (!account.facebook_page_access_token_encrypted) throw new PublishError("instagram_token_expired", "Instagram token missing — reconnect the linked Page.", { retryable: false });
  const token = await decryptToken(account.facebook_page_access_token_encrypted);
  if (!token) throw new PublishError("instagram_permission_missing", "Instagram access token invalid — reconnect the account.", { retryable: false });
  const caption = payload.caption || v.instagram_caption || ctx.post.content || "";

  // 1) create media container
  const createRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: mediaUrls[0], caption, access_token: token }),
  });
  const createData = await createRes.json().catch(() => ({}));
  if (createData?.error?.code === 190) throw new PublishError("instagram_token_expired", "Instagram token expired — reconnect.", { retryable: false });
  if (createData?.error && String(createData.error.message || "").toLowerCase().includes("permission")) {
    throw new PublishError("instagram_permission_missing", "Missing Instagram publishing permission.", { retryable: false });
  }
  if (!createData.id) throw new PublishError("instagram_container_creation_failed", "Failed to create Instagram media container.");
  const containerId = createData.id;

  // 2) check container readiness
  const statusRes = await fetch(`https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${encodeURIComponent(token)}`);
  const statusData = await statusRes.json().catch(() => ({}));
  if (statusData.status_code && statusData.status_code !== "FINISHED" && statusData.status_code !== "PUBLISHED") {
    throw new PublishError("instagram_container_not_ready", `Instagram media not ready (${statusData.status_code}).`);
  }

  // 3) publish container
  const pubRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media_publish`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: containerId, access_token: token }),
  });
  const pubData = await pubRes.json().catch(() => ({}));
  if (pubData?.error) {
    const sub = String(pubData.error.message || "").toLowerCase();
    if (sub.includes("limit")) throw new PublishError("instagram_publish_limit_reached", "Instagram daily publish limit reached.", { retryable: false });
    throw new PublishError("instagram_media_publish_failed", `Instagram publish failed: ${pubData.error.message}.`);
  }
  if (!pubData.id) throw new PublishError("instagram_media_publish_failed", "Instagram publish failed.");
  return { platform_post_id: pubData.id, platform_post_url: `https://www.instagram.com/` };
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
    const result = await publisher(fresh.platform_specific_payload || {}, { base44, account, post });

    // 4) Success.
    await base44.asServiceRole.entities.ScheduledPost.update(fresh.id, {
      status: "published",
      platform_post_id: result.platform_post_id || "",
      platform_post_url: result.platform_post_url || "",
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