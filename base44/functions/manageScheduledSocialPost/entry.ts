import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin actions on a ScheduledPost: retry a failed job or cancel a queued one.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const { scheduled_post_id, action } = await req.json();
    if (!scheduled_post_id || !action) {
      return Response.json({ error: "scheduled_post_id and action are required." }, { status: 400 });
    }

    const job = await base44.entities.ScheduledPost.get(scheduled_post_id);
    if (!job) return Response.json({ error: "Scheduled post not found." }, { status: 404 });

    if (action === "retry") {
      if (job.status !== "failed") {
        return Response.json({ error: "Only failed posts can be retried." }, { status: 400 });
      }
      await base44.entities.ScheduledPost.update(job.id, {
        status: "queued",
        error_code: "",
        error_message: "",
        next_retry_at: "",
        scheduled_at: new Date().toISOString(),
      });
      await base44.entities.SocialAutomationLog.create({
        account_id: "global", user_id: user.id, event_type: "post_attempt", platform: job.platform,
        related_post_id: job.social_post_id, related_campaign_id: job.campaign_id, related_scheduled_post_id: job.id,
        status: "warning", message: `Manually re-queued ${job.platform} post for retry.`, metadata: { action: "retry" },
      });
      return Response.json({ ok: true, status: "queued" });
    }

    if (action === "cancel") {
      if (!["queued", "failed", "processing"].includes(job.status)) {
        return Response.json({ error: "This post can no longer be canceled." }, { status: 400 });
      }
      await base44.entities.ScheduledPost.update(job.id, { status: "canceled", next_retry_at: "" });

      // Roll up the parent SocialPost status.
      if (job.social_post_id) {
        const siblings = await base44.entities.ScheduledPost.filter({ social_post_id: job.social_post_id });
        const statuses = siblings.map((s) => s.status);
        let publishing_status = "scheduled";
        if (statuses.every((s) => ["canceled"].includes(s))) publishing_status = "canceled";
        else if (statuses.every((s) => ["published", "canceled"].includes(s)) && statuses.includes("published")) publishing_status = "published";
        else if (statuses.some((s) => s === "published")) publishing_status = "partially_published";
        try { await base44.entities.SocialPost.update(job.social_post_id, { publishing_status }); } catch (_e) { /* */ }
      }

      await base44.entities.SocialAutomationLog.create({
        account_id: "global", user_id: user.id, event_type: "post_attempt", platform: job.platform,
        related_post_id: job.social_post_id, related_campaign_id: job.campaign_id, related_scheduled_post_id: job.id,
        status: "warning", message: `Canceled scheduled ${job.platform} post.`, metadata: { action: "cancel" },
      });
      return Response.json({ ok: true, status: "canceled" });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});