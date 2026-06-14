import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Changes the scheduled publish time of an already-scheduled post.
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
    if (post.status !== 'scheduled') return Response.json({ success: false, error: 'Only scheduled posts can be rescheduled.' }, { status: 400 });

    const updated = await base44.asServiceRole.entities.BlogPost.update(blog_post_id, {
      scheduledAt: when.toISOString(),
      scheduledTimezone: timezone || post.scheduledTimezone || 'UTC',
      publishLockAt: null,
      lastUpdatedAt: new Date().toISOString(),
    });

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'schedule',
      relatedPostId: blog_post_id,
      status: 'success',
      message: `Rescheduled "${post.title}" to ${when.toISOString()} (${timezone || post.scheduledTimezone || 'UTC'})`,
    });

    return Response.json({ success: true, post: updated });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});