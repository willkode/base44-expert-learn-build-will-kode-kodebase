import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Cancels a scheduled publish, returning the post to approved (or draft) status.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { blog_post_id } = await req.json();
    if (!blog_post_id) return Response.json({ success: false, error: 'blog_post_id is required' }, { status: 400 });

    const post = await base44.asServiceRole.entities.BlogPost.get(blog_post_id);
    if (!post) return Response.json({ success: false, error: 'Post not found' }, { status: 404 });
    if (post.status !== 'scheduled') return Response.json({ success: false, error: 'Only scheduled posts can be cancelled.' }, { status: 400 });

    const nextStatus = post.approvalStatus === 'approved' ? 'approved' : 'draft';
    const updated = await base44.asServiceRole.entities.BlogPost.update(blog_post_id, {
      status: nextStatus,
      scheduledAt: null,
      publishLockAt: null,
      lastUpdatedAt: new Date().toISOString(),
    });

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'schedule',
      relatedPostId: blog_post_id,
      status: 'success',
      message: `Cancelled schedule for "${post.title}"`,
    });

    return Response.json({ success: true, post: updated });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});