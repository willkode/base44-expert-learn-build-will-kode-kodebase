import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ---------------------------------------------------------------------------
// Admin Recovery Tools for the Social Media Marketing system.
// A single admin-only endpoint exposing bulk recovery actions:
//   - retry_failed_queue : re-queue every failed ScheduledPost for another run
//   - clear_failed_queue  : mark every failed ScheduledPost as canceled
//   - pause_campaign      : set a campaign to paused
//   - resume_campaign     : set a campaign back to active
//   - resync_facebook_pages   : refresh cached Facebook Page list (public info)
//   - resync_instagram_accounts : refresh cached Instagram account list
//   - export_logs         : return recent automation logs (already redaction-safe)
//
// All actions are audit-logged. Tokens/secrets are never returned.
// ---------------------------------------------------------------------------

function nowIso() { return new Date().toISOString(); }

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

async function audit(base44, user, { event_type, platform, status, message, metadata }) {
  try {
    await base44.asServiceRole.entities.SocialAutomationLog.create({
      account_id: "global", user_id: user?.id,
      event_type: event_type || "recovery_action", platform: platform || undefined,
      status: status || "success", message: message || "", metadata: metadata || {},
    });
  } catch (_e) { /* best-effort */ }
}

// Roll up the parent SocialPost publishing_status after job changes.
async function rollup(base44, socialPostId) {
  if (!socialPostId) return;
  const jobs = await base44.asServiceRole.entities.ScheduledPost.filter({ social_post_id: socialPostId });
  if (!jobs.length) return;
  const statuses = jobs.map((s) => s.status);
  let publishing_status = "scheduled";
  if (statuses.every((s) => s === "canceled")) publishing_status = "canceled";
  else if (statuses.every((s) => s === "published")) publishing_status = "published";
  else if (statuses.some((s) => s === "published")) publishing_status = "partially_published";
  else if (statuses.every((s) => ["failed", "canceled"].includes(s))) publishing_status = "failed";
  try { await base44.asServiceRole.entities.SocialPost.update(socialPostId, { publishing_status }); } catch (_e) { /* */ }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { action, campaign_id, platform, account_id, limit } = body;
    if (!action) return Response.json({ error: "action is required." }, { status: 400 });

    // ----- Retry every failed scheduled post --------------------------------
    if (action === "retry_failed_queue") {
      const filter = { status: "failed" };
      if (platform) filter.platform = platform;
      if (campaign_id) filter.campaign_id = campaign_id;
      const failed = await base44.asServiceRole.entities.ScheduledPost.filter(filter, "-last_attempt_at", 200);
      const touchedPosts = new Set();
      for (const job of failed) {
        await base44.asServiceRole.entities.ScheduledPost.update(job.id, {
          status: "queued", error_code: "", error_message: "", next_retry_at: "",
          scheduled_at: nowIso(),
        });
        if (job.social_post_id) touchedPosts.add(job.social_post_id);
      }
      for (const pid of touchedPosts) await rollup(base44, pid);
      await audit(base44, user, {
        event_type: "post_attempt", platform, status: "warning",
        message: `Bulk re-queued ${failed.length} failed post(s) for retry.`,
        metadata: { action, count: failed.length, campaign_id: campaign_id || null },
      });
      return Response.json({ ok: true, requeued: failed.length });
    }

    // ----- Clear (cancel) the failed queue ----------------------------------
    if (action === "clear_failed_queue") {
      const filter = { status: "failed" };
      if (platform) filter.platform = platform;
      if (campaign_id) filter.campaign_id = campaign_id;
      const failed = await base44.asServiceRole.entities.ScheduledPost.filter(filter, "-last_attempt_at", 500);
      const touchedPosts = new Set();
      for (const job of failed) {
        await base44.asServiceRole.entities.ScheduledPost.update(job.id, { status: "canceled", next_retry_at: "" });
        if (job.social_post_id) touchedPosts.add(job.social_post_id);
      }
      for (const pid of touchedPosts) await rollup(base44, pid);
      await audit(base44, user, {
        event_type: "post_attempt", platform, status: "warning",
        message: `Cleared ${failed.length} failed post(s) from the queue.`,
        metadata: { action, count: failed.length },
      });
      return Response.json({ ok: true, cleared: failed.length });
    }

    // ----- Pause / resume a campaign ----------------------------------------
    if (action === "pause_campaign" || action === "resume_campaign") {
      if (!campaign_id) return Response.json({ error: "campaign_id is required." }, { status: 400 });
      const campaign = await base44.asServiceRole.entities.SocialCampaign.get(campaign_id).catch(() => null);
      if (!campaign) return Response.json({ error: "Campaign not found." }, { status: 404 });
      const newStatus = action === "pause_campaign" ? "paused" : "active";
      await base44.asServiceRole.entities.SocialCampaign.update(campaign_id, { status: newStatus });
      await audit(base44, user, {
        event_type: "campaign_update", status: "success",
        message: `Campaign "${campaign.name}" ${newStatus === "paused" ? "paused" : "resumed"}.`,
        metadata: { action, campaign_id, new_status: newStatus },
      });
      return Response.json({ ok: true, status: newStatus });
    }

    // ----- Re-sync Facebook Pages (refresh cached public Page list) ----------
    if (action === "resync_facebook_pages") {
      const acc = (await base44.asServiceRole.entities.SocialAccount.filter(
        { account_id: account_id || "global", platform: "facebook" }, "-last_connected_at", 1
      ))[0];
      if (!acc) return Response.json({ error: "No connected Facebook account found." }, { status: 404 });
      const userToken = await decryptToken(acc.access_token_encrypted);
      if (!userToken) return Response.json({ error: "Facebook authorization is missing — reconnect the account.", code: "facebook_page_permission_missing" }, { status: 400 });

      const res = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,category,picture{url}&access_token=${encodeURIComponent(userToken)}`);
      const data = await res.json().catch(() => ({}));
      if (data?.error) {
        await audit(base44, user, { event_type: "token_refresh", platform: "facebook", status: "error", message: `Facebook Page re-sync failed: ${data.error.message}`, metadata: { action } });
        return Response.json({ error: `Facebook re-sync failed: ${data.error.message}`, code: "facebook_page_permission_missing" }, { status: 400 });
      }
      const pages = (data.data || []).map((p) => ({ id: p.id, name: p.name, category: p.category, picture_url: p?.picture?.data?.url || "" }));
      await base44.asServiceRole.entities.SocialAccount.update(acc.id, { available_facebook_pages: pages });
      await audit(base44, user, { event_type: "token_refresh", platform: "facebook", status: "success", message: `Re-synced ${pages.length} Facebook Page(s).`, metadata: { action, count: pages.length } });
      return Response.json({ ok: true, pages: pages.length });
    }

    // ----- Re-sync Instagram accounts ---------------------------------------
    if (action === "resync_instagram_accounts") {
      const acc = (await base44.asServiceRole.entities.SocialAccount.filter(
        { account_id: account_id || "global", platform: "instagram" }, "-last_connected_at", 1
      ))[0] || (await base44.asServiceRole.entities.SocialAccount.filter(
        { account_id: account_id || "global", platform: "facebook" }, "-last_connected_at", 1
      ))[0];
      if (!acc) return Response.json({ error: "No connected Meta account found." }, { status: 404 });
      const userToken = await decryptToken(acc.access_token_encrypted);
      if (!userToken) return Response.json({ error: "Meta authorization is missing — reconnect the account.", code: "instagram_account_not_found" }, { status: 400 });

      // Discover IG professional accounts linked to the user's Pages.
      const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,instagram_business_account{id,username,profile_picture_url}&access_token=${encodeURIComponent(userToken)}`);
      const pagesData = await pagesRes.json().catch(() => ({}));
      if (pagesData?.error) {
        await audit(base44, user, { event_type: "token_refresh", platform: "instagram", status: "error", message: `Instagram re-sync failed: ${pagesData.error.message}`, metadata: { action } });
        return Response.json({ error: `Instagram re-sync failed: ${pagesData.error.message}`, code: "instagram_account_not_found" }, { status: 400 });
      }
      const igAccounts = [];
      for (const p of pagesData.data || []) {
        const ig = p.instagram_business_account;
        if (ig?.id) igAccounts.push({ id: ig.id, username: ig.username || "", profile_picture_url: ig.profile_picture_url || "", connected_facebook_page_id: p.id });
      }
      await base44.asServiceRole.entities.SocialAccount.update(acc.id, { available_instagram_accounts: igAccounts });
      await audit(base44, user, { event_type: "token_refresh", platform: "instagram", status: igAccounts.length ? "success" : "warning", message: `Re-synced ${igAccounts.length} Instagram account(s).`, metadata: { action, count: igAccounts.length } });
      return Response.json({ ok: true, accounts: igAccounts.length });
    }

    // ----- Export recent automation logs (redaction-safe already) -----------
    if (action === "export_logs") {
      const max = Math.min(limit || 1000, 2000);
      const logs = await base44.asServiceRole.entities.SocialAutomationLog.list("-created_date", max);
      const rows = logs.map((l) => ({
        created_date: l.created_date, event_type: l.event_type, platform: l.platform || "",
        status: l.status, message: l.message || "",
        related_campaign_id: l.related_campaign_id || "", related_post_id: l.related_post_id || "",
        related_scheduled_post_id: l.related_scheduled_post_id || "",
      }));
      await audit(base44, user, { event_type: "recovery_action", status: "success", message: `Exported ${rows.length} log entries.`, metadata: { action, count: rows.length } });
      return Response.json({ ok: true, count: rows.length, logs: rows });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});