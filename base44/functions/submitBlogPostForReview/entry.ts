import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Submits a draft / revision_requested post for review.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { blog_post_id } = await req.json();
    if (!blog_post_id) return Response.json({ success: false, error: 'blog_post_id is required' }, { status: 400 });

    const post = await base44.asServiceRole.entities.BlogPost.get(blog_post_id);
    if (!post) return Response.json({ success: false, error: 'Post not found' }, { status: 404 });

    if (['needs_review', 'approved', 'published', 'scheduled'].includes(post.approvalStatus)) {
      return Response.json({ success: false, error: `Post is already ${post.approvalStatus.replace(/_/g, ' ')}.` }, { status: 400 });
    }
    if (!post.content || post.content.trim().length < 50) {
      return Response.json({ success: false, error: 'Add content before submitting for review.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updated = await base44.asServiceRole.entities.BlogPost.update(blog_post_id, {
      approvalStatus: 'needs_review',
      status: post.status === 'published' ? post.status : 'needs_review',
      rejectedReason: null,
      lastUpdatedAt: now,
    });

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'approval_submitted',
      relatedPostId: blog_post_id,
      status: 'success',
      message: `"${post.title}" submitted for review by ${user.email}`,
      metadata: { actorEmail: user.email, actorId: user.id },
    });

    return Response.json({ success: true, post: updated });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});