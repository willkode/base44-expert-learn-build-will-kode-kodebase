import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const { social_post_id, rejected_reason } = await req.json();
    if (!social_post_id) return Response.json({ error: "social_post_id is required." }, { status: 400 });

    const post = await base44.entities.SocialPost.get(social_post_id);
    if (!post) return Response.json({ error: "Post not found." }, { status: 404 });

    const updated = await base44.entities.SocialPost.update(social_post_id, {
      approval_status: "rejected",
      rejected_reason: rejected_reason || "",
      publishing_status: "unscheduled",
    });

    try {
      await base44.entities.SocialAutomationLog.create({
        account_id: "global",
        user_id: user.id,
        event_type: "approval_rejected",
        related_post_id: social_post_id,
        related_campaign_id: post.campaign_id || undefined,
        status: "warning",
        message: `Post "${post.title_internal || social_post_id}" rejected by ${user.email}.`,
        metadata: { from_status: post.approval_status, to_status: "rejected", rejected_reason: rejected_reason || "" },
      });
    } catch (_e) { /* best-effort */ }

    try {
      await base44.functions.invoke("createSocialNotification", {
        event_type: "post_rejected",
        title: "Post rejected",
        message: `"${post.title_internal || 'A post'}" was rejected${rejected_reason ? `: ${rejected_reason}` : ""}.`,
        related_record_type: "SocialPost",
        related_record_id: social_post_id,
        severity: "warning",
      });
    } catch (_e) { /* best-effort */ }

    return Response.json({ post: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});