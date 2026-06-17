import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ---------------------------------------------------------------------------
// Social Post Analytics Sync
// Runs on a schedule (and on demand by an admin). Finds published ScheduledPost
// records (prioritizing the last 30 days), pulls engagement metrics from each
// platform where available, normalizes them into SocialPostAnalytics, redacts
// sensitive data from the raw response, and logs success/failure.
// Backend functions can't share local imports, so helpers are inlined here.
// ---------------------------------------------------------------------------

function nowIso() { return new Date().toISOString(); }

// AES-GCM token decryption (mirrors the publishing worker / token vault).
async function decryptToken(encrypted) {
  if (!encrypted) return null;
  const secret = Deno.env.get("INTERNAL_FUNCTION_SECRET") || "";
  try {
    const raw = JSON.parse(atob(encrypted));
    if (!raw || !raw.iv || !raw.data) return encrypted;
    const keyMaterial = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
    const key = await crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, ["decrypt"]);
    const iv = new Uint8Array(raw.iv);
    const data = new Uint8Array(raw.data);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new TextDecoder().decode(decrypted);
  } catch (_e) {
    return encrypted;
  }
}

// Strip anything token/secret-like before persisting a raw platform response.
function redactRaw(obj, depth = 0) {
  if (obj == null || depth > 6) return obj;
  if (Array.isArray(obj)) return obj.slice(0, 50).map((x) => redactRaw(x, depth + 1));
  if (typeof obj !== "object") return obj;
  const SENSITIVE = /(token|secret|access|refresh|auth|password|signature|client_id|client_secret|app_secret|bearer|cookie)/i;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE.test(k)) { out[k] = "[redacted]"; continue; }
    out[k] = redactRaw(v, depth + 1);
  }
  return out;
}

function num(v) { const n = Number(v); return isFinite(n) ? n : 0; }

function computeRates(m) {
  const engagement = num(m.likes) + num(m.comments) + num(m.shares) + num(m.reposts) +
    num(m.saves) + num(m.upvotes) + num(m.reactions || 0);
  const denom = num(m.impressions) || num(m.reach);
  const engagement_rate = denom > 0 ? Number(((engagement / denom) * 100).toFixed(2)) : 0;
  const click_through_rate = denom > 0 && num(m.clicks) > 0
    ? Number(((num(m.clicks) / denom) * 100).toFixed(2)) : 0;
  return { engagement_rate, click_through_rate };
}

// --- Per-platform metric fetchers -----------------------------------------
// Each returns { metrics: {...normalized...}, raw: {...} } or throws.

async function fetchTwitterMetrics(token, postId) {
  const url = `https://api.twitter.com/2/tweets/${postId}?tweet.fields=public_metrics,non_public_metrics,organic_metrics`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 429) throw new Error("rate_limited");
  if (res.status === 401 || res.status === 403) throw new Error("permission_or_access_level");
  const data = await res.json().catch(() => ({}));
  const pm = data?.data?.public_metrics || {};
  const np = data?.data?.non_public_metrics || {};
  const og = data?.data?.organic_metrics || {};
  const metrics = {
    likes: num(pm.like_count),
    comments: num(pm.reply_count),
    reposts: num(pm.retweet_count) + num(pm.quote_count),
    shares: num(pm.retweet_count),
    impressions: num(np.impression_count || og.impression_count),
    clicks: num(og.url_link_clicks || np.url_link_clicks),
  };
  return { metrics, raw: data };
}

async function fetchRedditMetrics(token, payload) {
  const fullname = payload?.platform_post_id_fullname || (payload?.id ? `t3_${String(payload.id).replace(/^t3_/, "")}` : "");
  const postId = payload?.platform_post_id || "";
  const thingId = fullname || (postId ? `t3_${postId.replace(/^t3_/, "")}` : "");
  if (!thingId) throw new Error("missing_post_id");
  const res = await fetch(`https://oauth.reddit.com/api/info?id=${encodeURIComponent(thingId)}`, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": "KodeBaseSocial/1.0" },
  });
  if (res.status === 429) throw new Error("rate_limited");
  if (res.status === 401 || res.status === 403) throw new Error("permission_or_access_level");
  const data = await res.json().catch(() => ({}));
  const d = data?.data?.children?.[0]?.data || {};
  const score = num(d.score);
  const ratio = num(d.upvote_ratio);
  const ups = ratio > 0 && score >= 0 ? Math.round(score / (2 * ratio - 1 || 1)) : num(d.ups);
  const metrics = {
    score,
    upvotes: num(d.ups || ups),
    downvotes: ratio > 0 ? Math.max(0, num(d.ups || ups) - score) : 0,
    comments: num(d.num_comments),
    engagement_rate: 0,
  };
  return { metrics, raw: data };
}

async function fetchLinkedInMetrics(token, payload) {
  const urn = payload?.platform_post_id || "";
  if (!urn) throw new Error("missing_post_id");
  // socialActions returns likes + comments counts for a share/ugcPost URN.
  const res = await fetch(`https://api.linkedin.com/v2/socialActions/${encodeURIComponent(urn)}`, {
    headers: { Authorization: `Bearer ${token}`, "X-Restli-Protocol-Version": "2.0.0" },
  });
  if (res.status === 429) throw new Error("rate_limited");
  if (res.status === 401 || res.status === 403) throw new Error("permission_or_access_level");
  const data = await res.json().catch(() => ({}));
  const metrics = {
    likes: num(data?.likesSummary?.totalLikes),
    comments: num(data?.commentsSummary?.totalFirstLevelComments || data?.commentsSummary?.aggregatedTotalComments),
    reactions: num(data?.likesSummary?.totalLikes),
    shares: 0,
    reposts: 0,
    impressions: 0,
    clicks: 0,
  };
  return { metrics, raw: data };
}

async function fetchFacebookMetrics(pageToken, postId) {
  if (!postId) throw new Error("missing_post_id");
  const base = `https://graph.facebook.com/v19.0/${postId}`;
  const [summaryRes, insightsRes] = await Promise.all([
    fetch(`${base}?fields=likes.summary(true),comments.summary(true),shares,reactions.summary(true)&access_token=${encodeURIComponent(pageToken)}`),
    fetch(`${base}/insights?metric=post_impressions,post_impressions_unique,post_clicks,post_engaged_users,post_video_views&access_token=${encodeURIComponent(pageToken)}`),
  ]);
  const summary = await summaryRes.json().catch(() => ({}));
  const insights = await insightsRes.json().catch(() => ({}));
  if (summary?.error?.code === 190 || insights?.error?.code === 190) throw new Error("permission_or_access_level");
  if (summaryRes.status === 429 || insightsRes.status === 429) throw new Error("rate_limited");
  const iv = {};
  for (const m of (insights?.data || [])) iv[m.name] = num(m?.values?.[0]?.value);
  const reactions = num(summary?.reactions?.summary?.total_count || summary?.likes?.summary?.total_count);
  const comments = num(summary?.comments?.summary?.total_count);
  const shares = num(summary?.shares?.count);
  const metrics = {
    reactions, likes: reactions, comments, shares,
    impressions: num(iv.post_impressions),
    reach: num(iv.post_impressions_unique),
    clicks: num(iv.post_clicks),
    facebook_reactions: reactions,
    facebook_comments: comments,
    facebook_shares: shares,
    facebook_clicks: num(iv.post_clicks),
    facebook_impressions: num(iv.post_impressions),
    facebook_reach: num(iv.post_impressions_unique),
    facebook_video_views: num(iv.post_video_views),
    facebook_post_engaged_users: num(iv.post_engaged_users),
  };
  return { metrics, raw: { summary, insights } };
}

async function fetchInstagramMetrics(token, mediaId) {
  if (!mediaId) throw new Error("missing_post_id");
  const base = `https://graph.facebook.com/v19.0/${mediaId}`;
  const [fieldsRes, insightsRes] = await Promise.all([
    fetch(`${base}?fields=like_count,comments_count,media_type&access_token=${encodeURIComponent(token)}`),
    fetch(`${base}/insights?metric=reach,impressions,saved,shares,plays,profile_visits,follows&access_token=${encodeURIComponent(token)}`),
  ]);
  const f = await fieldsRes.json().catch(() => ({}));
  const ins = await insightsRes.json().catch(() => ({}));
  if (f?.error?.code === 190 || ins?.error?.code === 190) throw new Error("permission_or_access_level");
  if (fieldsRes.status === 429 || insightsRes.status === 429) throw new Error("rate_limited");
  const iv = {};
  for (const m of (ins?.data || [])) iv[m.name] = num(m?.values?.[0]?.value);
  const likes = num(f.like_count);
  const comments = num(f.comments_count);
  const saves = num(iv.saved);
  const shares = num(iv.shares);
  const metrics = {
    likes, comments, saves, shares,
    reach: num(iv.reach),
    impressions: num(iv.impressions),
    instagram_likes: likes,
    instagram_comments: comments,
    instagram_saves: saves,
    instagram_shares: shares,
    instagram_reach: num(iv.reach),
    instagram_impressions: num(iv.impressions),
    instagram_plays: num(iv.plays),
    instagram_reel_plays: num(iv.plays),
    instagram_profile_visits: num(iv.profile_visits),
    instagram_follows: num(iv.follows),
  };
  return { metrics, raw: { fields: f, insights: ins } };
}

// --- Token / account helpers ----------------------------------------------
function tokenExpired(account) {
  if (!account?.token_expires_at) return false;
  return new Date(account.token_expires_at).getTime() <= Date.now();
}

async function getPlatformToken(account, platform) {
  if (!account || account.connection_status !== "connected") return { error: "missing_connected_account" };
  if (platform === "facebook" || platform === "instagram") {
    // Meta platforms use the Page token.
    if (!account.facebook_page_access_token_encrypted) return { error: "missing_meta_token" };
    const t = await decryptToken(account.facebook_page_access_token_encrypted);
    return t ? { token: t } : { error: "missing_meta_token" };
  }
  if (tokenExpired(account)) return { error: "expired_authorization" };
  const t = await decryptToken(account.access_token_encrypted);
  return t ? { token: t } : { error: "expired_authorization" };
}

async function logEvent(base44, { status, platform, job, message, metadata }) {
  try {
    await base44.asServiceRole.entities.SocialAutomationLog.create({
      account_id: "global",
      event_type: "analytics_sync",
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

// Upsert a single SocialPostAnalytics snapshot for a job.
async function upsertSnapshot(base44, job, account, normalized, raw) {
  const rates = computeRates(normalized);
  const record = {
    scheduled_post_id: job.id,
    social_post_id: job.social_post_id || "",
    campaign_id: job.campaign_id || "",
    platform: job.platform,
    platform_post_id: job.platform_post_id || "",
    platform_post_url: job.platform_post_url || "",
    impressions: num(normalized.impressions),
    reach: num(normalized.reach),
    likes: num(normalized.likes),
    comments: num(normalized.comments),
    shares: num(normalized.shares),
    reposts: num(normalized.reposts),
    clicks: num(normalized.clicks),
    saves: num(normalized.saves),
    upvotes: num(normalized.upvotes),
    downvotes: num(normalized.downvotes),
    score: num(normalized.score),
    engagement_rate: normalized.engagement_rate || rates.engagement_rate,
    click_through_rate: rates.click_through_rate,
    follower_count_at_post_time: account?.follower_count != null ? num(account.follower_count) : undefined,
    collected_at: nowIso(),
    raw_platform_response: redactRaw(raw || {}),
  };
  // Carry platform-specific fields when present.
  for (const k of Object.keys(normalized)) {
    if (k.startsWith("facebook_") || k.startsWith("instagram_")) record[k] = num(normalized[k]);
  }

  // Upsert: one snapshot row per job (latest), keep a timeline via collected_at history is
  // achieved by creating a new row each run. We keep history (create new), matching the
  // entity design (timeline of metric changes), but avoid unbounded growth by updating
  // the row collected within the same sync window if it already exists.
  const existing = await base44.asServiceRole.entities.SocialPostAnalytics
    .filter({ scheduled_post_id: job.id }, "-collected_at", 1).catch(() => []);
  const last = existing?.[0];
  const within6h = last?.collected_at && (Date.now() - new Date(last.collected_at).getTime()) < 6 * 60 * 60 * 1000;
  if (last && within6h) {
    await base44.asServiceRole.entities.SocialPostAnalytics.update(last.id, record);
  } else {
    await base44.asServiceRole.entities.SocialPostAnalytics.create(record);
  }
  return record;
}

async function syncJob(base44, job, accountCache) {
  const platform = job.platform;
  // Resolve account (cache per social_account_id / platform).
  const cacheKey = job.social_account_id || `global:${platform}`;
  let account = accountCache.get(cacheKey);
  if (account === undefined) {
    account = job.social_account_id
      ? await base44.asServiceRole.entities.SocialAccount.get(job.social_account_id).catch(() => null)
      : (await base44.asServiceRole.entities.SocialAccount.filter({ account_id: "global", platform }, "-last_connected_at", 1))[0] || null;
    accountCache.set(cacheKey, account);
  }
  if (!account) { return { skipped: true, reason: "no_account" }; }

  const tk = await getPlatformToken(account, platform);
  if (tk.error) {
    await logEvent(base44, { status: "warning", platform, job, message: `Skipped analytics: ${tk.error}.`, metadata: { reason: tk.error } });
    return { skipped: true, reason: tk.error };
  }

  try {
    let fetched;
    if (platform === "twitter") fetched = await fetchTwitterMetrics(tk.token, job.platform_post_id);
    else if (platform === "reddit") fetched = await fetchRedditMetrics(tk.token, job);
    else if (platform === "linkedin") fetched = await fetchLinkedInMetrics(tk.token, job);
    else if (platform === "facebook") fetched = await fetchFacebookMetrics(tk.token, job.platform_post_id);
    else if (platform === "instagram") fetched = await fetchInstagramMetrics(tk.token, job.platform_post_id);
    else return { skipped: true, reason: "unknown_platform" };

    await upsertSnapshot(base44, job, account, fetched.metrics, fetched.raw);
    await logEvent(base44, { status: "success", platform, job, message: `Synced ${platform} analytics.`, metadata: {} });
    return { synced: true };
  } catch (err) {
    const msg = err?.message || "unknown_error";
    await logEvent(base44, { status: "error", platform, job, message: `Analytics fetch failed: ${msg}.`, metadata: { error: msg } });
    return { failed: true, reason: msg };
  }
}

// Roll up campaign-level totals from the latest analytics snapshots.
async function rollupCampaigns(base44, campaignIds) {
  for (const cid of campaignIds) {
    if (!cid) continue;
    try {
      const rows = await base44.asServiceRole.entities.SocialPostAnalytics.filter({ campaign_id: cid }, "-collected_at", 500);
      // Keep only the latest snapshot per scheduled_post_id.
      const latestByJob = new Map();
      for (const r of rows) {
        if (!latestByJob.has(r.scheduled_post_id)) latestByJob.set(r.scheduled_post_id, r);
      }
      const latest = [...latestByJob.values()];
      const totals = latest.reduce((acc, r) => {
        acc.impressions += num(r.impressions);
        acc.engagement += num(r.likes) + num(r.comments) + num(r.shares) + num(r.reposts) + num(r.saves) + num(r.upvotes);
        acc.clicks += num(r.clicks);
        return acc;
      }, { impressions: 0, engagement: 0, clicks: 0 });
      await logEvent(base44, {
        status: "success", platform: undefined, job: { campaign_id: cid },
        message: "Campaign analytics rollup updated.",
        metadata: { campaign_id: cid, posts: latest.length, ...totals },
      });
    } catch (_e) { /* best-effort */ }
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow an authenticated admin (manual) or the scheduler.
    let isAdmin = false;
    try { const u = await base44.auth.me(); isAdmin = u?.role === "admin"; } catch (_e) { /* scheduler */ }

    let body = {};
    try { body = await req.json(); } catch (_e) { /* no body */ }
    const limit = Math.min(Number(body?.limit) || 60, 100);

    // Find published jobs, prioritizing the last 30 days.
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    let jobs = await base44.asServiceRole.entities.ScheduledPost.filter(
      { status: "published", scheduled_at: { $gte: cutoff } }, "-scheduled_at", limit,
    );
    // If a single job id was provided (on-demand refresh of one post), target just it.
    if (body?.scheduled_post_id) {
      const one = await base44.asServiceRole.entities.ScheduledPost.get(body.scheduled_post_id).catch(() => null);
      jobs = one ? [one] : [];
    }
    // Top up with older published posts if we have headroom.
    if (!body?.scheduled_post_id && jobs.length < limit) {
      const older = await base44.asServiceRole.entities.ScheduledPost.filter(
        { status: "published", scheduled_at: { $lt: cutoff } }, "-scheduled_at", limit - jobs.length,
      );
      jobs = jobs.concat(older);
    }

    const accountCache = new Map();
    const results = { processed: 0, synced: 0, skipped: 0, failed: 0 };
    const campaignIds = new Set();
    for (const job of jobs) {
      if (!job.platform_post_id) { results.skipped++; continue; }
      const r = await syncJob(base44, job, accountCache);
      results.processed++;
      if (r.synced) { results.synced++; if (job.campaign_id) campaignIds.add(job.campaign_id); }
      else if (r.failed) results.failed++;
      else results.skipped++;
    }

    await rollupCampaigns(base44, [...campaignIds]);

    return Response.json({ ok: true, triggered_by: isAdmin ? "admin" : "scheduler", ...results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});