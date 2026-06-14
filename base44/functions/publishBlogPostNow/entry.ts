import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SLUG_RE = /^[a-z0-9-]+$/;

// Immediately publishes a post, making it public.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { blog_post_id } = await req.json();
    if (!blog_post_id) return Response.json({ success: false, error: 'blog_post_id is required' }, { status: 400 });

    const post = await base44.asServiceRole.entities.BlogPost.get(blog_post_id);
    if (!post) return Response.json({ success: false, error: 'Post not found' }, { status: 404 });

    if (!post.title || !post.slug || !SLUG_RE.test(post.slug)) {
      return Response.json({ success: false, error: 'Post needs a valid title and public slug before publishing.' }, { status: 400 });
    }
    if (!post.content || post.content.trim().length < 50) {
      return Response.json({ success: false, error: 'Content is required before publishing.' }, { status: 400 });
    }

    const dupes = await base44.asServiceRole.entities.BlogPost.filter({ slug: post.slug });
    if (dupes.find((m) => m.id !== post.id)) {
      return Response.json({ success: false, error: 'This slug is already in use by another post.' }, { status: 400 });
    }

    const now = new Date();
    const updated = await base44.asServiceRole.entities.BlogPost.update(blog_post_id, {
      status: 'published',
      published: true,
      publishedAt: post.publishedAt || now.toISOString().slice(0, 10),
      scheduledAt: null,
      publishLockAt: null,
      lastUpdatedAt: now.toISOString(),
    });

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'publish',
      relatedPostId: blog_post_id,
      status: 'success',
      message: `Published "${post.title}" manually`,
    });

    return Response.json({ success: true, post: updated });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});