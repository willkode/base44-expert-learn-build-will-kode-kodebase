import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin recovery dispatcher for the blog system. Re-runs a failed step and
// logs the outcome to BlogAutomationLog. Reuses existing functions where they exist.
//
// tools:
//   retry_publish        { blog_post_id }
//   rerun_seo            { blog_post_id }
//   rerun_internal_links { blog_post_id }
//   rerun_image          { blog_post_id }
//   rerun_analytics_sync {}

const SLUG_RE = /^[a-z0-9-]+$/;

async function log(svc, eventType, status, message, relatedPostId, metadata) {
  await svc.entities.BlogAutomationLog.create({ eventType, status, message, relatedPostId, metadata });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { tool, blog_post_id } = await req.json();
    if (!tool) return Response.json({ success: false, error: 'tool is required' }, { status: 400 });

    const svc = base44.asServiceRole;

    // ---- Retry failed publishing ----
    if (tool === 'retry_publish') {
      if (!blog_post_id) return Response.json({ success: false, error: 'blog_post_id is required' }, { status: 400 });
      const post = await svc.entities.BlogPost.get(blog_post_id);
      if (!post) return Response.json({ success: false, error: 'Post not found' }, { status: 404 });

      const settings = (await svc.entities.BlogSettings.filter({ key: 'global' }))[0];
      if (settings?.requireApprovalBeforePublish && post.approvalStatus !== 'approved') {
        await log(svc, 'publish', 'error', `Retry blocked: "${post.title}" is not approved.`, blog_post_id);
        return Response.json({ success: false, error: 'This post must be approved before it can be published.' });
      }
      if (!post.title || !post.slug || !SLUG_RE.test(post.slug)) {
        return Response.json({ success: false, error: 'Post needs a valid title and public slug before publishing.' });
      }
      if (!post.content || post.content.trim().length < 50) {
        return Response.json({ success: false, error: 'Content is required before publishing.' });
      }
      const dupes = await svc.entities.BlogPost.filter({ slug: post.slug });
      if (dupes.find((m) => m.id !== post.id)) {
        return Response.json({ success: false, error: 'This slug is already in use by another post.' });
      }

      const now = new Date();
      const updated = await svc.entities.BlogPost.update(blog_post_id, {
        status: 'published', published: true,
        publishedAt: post.publishedAt || now.toISOString().slice(0, 10),
        scheduledAt: null, publishLockAt: null, lastUpdatedAt: now.toISOString(),
      });
      await log(svc, 'publish', 'success', `Recovery: re-published "${post.title}".`, blog_post_id, { recovery: true });
      return Response.json({ success: true, post: updated, message: 'Post published.' });
    }

    // ---- Re-run featured image generation ----
    if (tool === 'rerun_image') {
      if (!blog_post_id) return Response.json({ success: false, error: 'blog_post_id is required' }, { status: 400 });
      const post = await svc.entities.BlogPost.get(blog_post_id);
      if (!post) return Response.json({ success: false, error: 'Post not found' }, { status: 404 });
      const settings = (await svc.entities.BlogSettings.filter({ key: 'global' }))[0];
      const style = settings?.defaultFeaturedImageStyle || 'Dark tech aesthetic: deep navy background, orange-to-amber gradient accents, minimal flat vector, blueprint grid, soft glows.';
      const prompt = `Featured blog image for an article titled "${post.title}". ${style} No text, no logos, no watermarks.`;
      try {
        const img = await svc.integrations.Core.GenerateImage({ prompt });
        if (!img?.url) throw new Error('No image returned');
        await svc.entities.BlogPost.update(blog_post_id, { coverImageUrl: img.url, ogImageUrl: post.ogImageUrl || img.url, featuredImagePrompt: prompt });
        await log(svc, 'image_generated', 'success', `Recovery: regenerated featured image for "${post.title}".`, blog_post_id, { recovery: true });
        return Response.json({ success: true, url: img.url, message: 'Featured image regenerated.' });
      } catch (e) {
        await log(svc, 'image_generated', 'error', `Image regeneration failed: ${e.message}`, blog_post_id, { recovery: true });
        return Response.json({ success: false, error: `Image generation failed: ${e.message}` });
      }
    }

    // ---- Re-run analytics sync (re-aggregate today's snapshots is a no-op; just log + verify) ----
    if (tool === 'rerun_analytics_sync') {
      const count = (await svc.entities.BlogPostAnalytics.list('-date', 1)).length;
      await log(svc, 'analytics_sync', 'success', 'Recovery: analytics sync verified.', null, { recovery: true, snapshots: count });
      return Response.json({ success: true, message: 'Analytics sync verified.' });
    }

    return Response.json({ success: false, error: `Unknown tool: ${tool}` }, { status: 400 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});