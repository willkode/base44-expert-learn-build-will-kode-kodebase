import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Rejects a post. Rejected posts cannot be published.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { blog_post_id, reason } = await req.json();
    if (!blog_post_id) return Response.json({ success: false, error: 'blog_post_id is required' }, { status: 400 });
    if (!reason || !String(reason).trim()) return Response.json({ success: false, error: 'A rejection reason is required.' }, { status: 400 });

    const post = await base44.asServiceRole.entities.BlogPost.get(blog_post_id);
    if (!post) return Response.json({ success: false, error: 'Post not found' }, { status: 404 });

    const now = new Date().toISOString();
    const updated = await base44.asServiceRole.entities.BlogPost.update(blog_post_id, {
      approvalStatus: 'rejected',
      status: 'draft',
      scheduledAt: null,
      published: false,
      rejectedReason: String(reason).trim(),
      approvedBy: null,
      approvedAt: null,
      lastUpdatedAt: now,
    });

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'approval_rejected',
      relatedPostId: blog_post_id,
      status: 'warning',
      message: `"${post.title}" rejected by ${user.email} — ${String(reason).trim()}`,
      metadata: { actorEmail: user.email, actorId: user.id, reason: String(reason).trim() },
    });

    return Response.json({ success: true, post: updated });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});