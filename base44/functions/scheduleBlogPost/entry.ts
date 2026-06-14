import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SLUG_RE = /^[a-z0-9-]+$/;

// Schedules an approved/draft post for future auto-publishing.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { blog_post_id, scheduled_at, timezone } = await req.json();
    if (!blog_post_id) return Response.json({ success: false, error: 'blog_post_id is required' }, { status: 400 });
    if (!scheduled_at) return Response.json({ success: false, error: 'scheduled_at is required' }, { status: 400 });

    const when = new Date(scheduled_at);
    if (isNaN(when.getTime())) return Response.json({ success: false, error: 'Invalid scheduled date' }, { status: 400 });
    if (when.getTime() <= Date.now()) return Response.json({ success: false, error: 'Scheduled publish date must be in the future.' }, { status: 400 });

    const post = await base44.asServiceRole.entities.BlogPost.get(blog_post_id);
    if (!post) return Response.json({ success: false, error: 'Post not found' }, { status: 404 });
    if (post.status === 'published') return Response.json({ success: false, error: 'Post is already published.' }, { status: 400 });

    // Approval gate: when approval is required, only approved posts can be scheduled.
    const settings = (await base44.asServiceRole.entities.BlogSettings.filter({ key: 'global' }))[0];
    if (settings?.requireApprovalBeforePublish && post.approvalStatus !== 'approved') {
      return Response.json({ success: false, error: 'This post must be approved before it can be scheduled.' }, { status: 400 });
    }

    if (!post.title || !post.slug || !SLUG_RE.test(post.slug)) {
      return Response.json({ success: false, error: 'Post needs a valid title and slug before scheduling.' }, { status: 400 });
    }
    if (!post.content || post.content.trim().length < 50) {
      return Response.json({ success: false, error: 'Content is required before scheduling.' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.BlogPost.update(blog_post_id, {
      status: 'scheduled',
      scheduledAt: when.toISOString(),
      scheduledTimezone: timezone || 'UTC',
      publishLockAt: null,
      published: false,
      lastUpdatedAt: new Date().toISOString(),
    });

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'schedule',
      relatedPostId: blog_post_id,
      status: 'success',
      message: `Scheduled "${post.title}" for ${when.toISOString()} (${timezone || 'UTC'})`,
    });

    return Response.json({ success: true, post: updated });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});