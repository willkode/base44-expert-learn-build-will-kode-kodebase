import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Approves a post, clearing it for scheduling / publishing.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { blog_post_id, notes } = await req.json();
    if (!blog_post_id) return Response.json({ success: false, error: 'blog_post_id is required' }, { status: 400 });

    const post = await base44.asServiceRole.entities.BlogPost.get(blog_post_id);
    if (!post) return Response.json({ success: false, error: 'Post not found' }, { status: 404 });

    if (post.approvalStatus === 'approved') {
      return Response.json({ success: false, error: 'Post is already approved.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updated = await base44.asServiceRole.entities.BlogPost.update(blog_post_id, {
      approvalStatus: 'approved',
      status: post.status === 'published' || post.status === 'scheduled' ? post.status : 'approved',
      approvedBy: user.email,
      approvedAt: now,
      rejectedReason: null,
      revisionNotes: notes || post.revisionNotes || null,
      lastUpdatedAt: now,
    });

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'approval_approved',
      relatedPostId: blog_post_id,
      status: 'success',
      message: `"${post.title}" approved by ${user.email}${notes ? ` — ${notes}` : ''}`,
      metadata: { actorEmail: user.email, actorId: user.id, notes: notes || null },
    });

    return Response.json({ success: true, post: updated });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});