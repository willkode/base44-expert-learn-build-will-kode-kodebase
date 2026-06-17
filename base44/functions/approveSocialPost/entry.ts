import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Validates that every selected platform meets its publish-readiness requirements.
function validatePlatformRequirements(post, account) {
  const errors = [];
  const platforms = post.selected_platforms || [];
  const v = post.platform_variants || {};

  for (const platform of platforms) {
    if (platform === "instagram") {
      const media = (v.instagram_media_urls && v.instagram_media_urls.length) || post.image_url;
      if (!media) errors.push("Instagram posts require an image, video, or Reel before approval.");
      if (!v.instagram_caption && !post.content) errors.push("Instagram posts require a caption.");
    }
    if (platform === "facebook") {
      const hasPage = account && (account.facebook_page_id || account.selected_default_facebook_page_id);
      if (!hasPage) errors.push("Facebook posts require a connected Page target before approval.");
      if (!v.facebook_text && !post.content) errors.push("Facebook posts require post text.");
    }
    if (platform === "twitter" && !v.twitter_text && !post.content) {
      errors.push("X / Twitter posts require text.");
    }
    if (platform === "linkedin" && !v.linkedin_text && !post.content) {
      errors.push("LinkedIn posts require text.");
    }
    if (platform === "reddit" && !v.reddit_title) {
      errors.push("Reddit posts require a title.");
    }
  }
  return errors;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const { social_post_id } = await req.json();
    if (!social_post_id) return Response.json({ error: "social_post_id is required." }, { status: 400 });

    const post = await base44.entities.SocialPost.get(social_post_id);
    if (!post) return Response.json({ error: "Post not found." }, { status: 404 });

    if (post.approval_status === "rejected") {
      return Response.json({ error: "Rejected posts cannot be approved. Request a revision first." }, { status: 400 });
    }

    // Look up the relevant connected account(s) for platform validation.
    const platforms = post.selected_platforms || [];
    let fbIgAccount = null;
    if (platforms.includes("facebook") || platforms.includes("instagram")) {
      const accounts = await base44.entities.SocialAccount.filter({ account_id: "global" }, "-created_date", 200);
      fbIgAccount = accounts.find((a) => a.platform === "facebook" || a.platform === "instagram") || null;
    }

    const reqErrors = validatePlatformRequirements(post, fbIgAccount);
    if (reqErrors.length > 0) {
      return Response.json({ error: reqErrors.join(" "), requirement_errors: reqErrors }, { status: 400 });
    }

    const updated = await base44.entities.SocialPost.update(social_post_id, {
      approval_status: "approved",
      approved_by: user.email,
      approved_at: new Date().toISOString(),
    });

    try {
      await base44.entities.SocialAutomationLog.create({
        account_id: "global",
        user_id: user.id,
        event_type: "approval_approved",
        related_post_id: social_post_id,
        related_campaign_id: post.campaign_id || undefined,
        status: "success",
        message: `Post "${post.title_internal || social_post_id}" approved by ${user.email}.`,
        metadata: { from_status: post.approval_status, to_status: "approved", platforms },
      });
    } catch (_e) { /* best-effort */ }

    try {
      await base44.functions.invoke("createSocialNotification", {
        event_type: "post_approved",
        title: "Post approved",
        message: `"${post.title_internal || 'A post'}" was approved by ${user.email}.`,
        related_record_type: "SocialPost",
        related_record_id: social_post_id,
        severity: "success",
      });
    } catch (_e) { /* best-effort */ }

    return Response.json({ post: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});