import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SLUG_RE = /^[a-z0-9-]+$/;

// Returns blocking errors (must fix before publish/approve) and recommendations (soft warnings).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { post = {}, intendedStatus } = await req.json();
    const errors = [];
    const recommendations = [];

    // Hard requirements
    if (!post.title || !String(post.title).trim()) errors.push('Title is required.');
    if (!post.slug || !String(post.slug).trim()) errors.push('Slug is required.');
    else if (!SLUG_RE.test(post.slug)) errors.push('Slug must be a valid public slug (lowercase letters, numbers, hyphens).');

    // Slug uniqueness
    if (post.slug && SLUG_RE.test(post.slug)) {
      const matches = await base44.asServiceRole.entities.BlogPost.filter({ slug: post.slug });
      if (matches.find((m) => m.id !== post.id)) errors.push('This slug is already in use by another post.');
    }

    const status = intendedStatus || post.status;
    const needsContent = ['approved', 'scheduled', 'published'].includes(status);
    if (needsContent && (!post.content || post.content.trim().length < 50)) {
      errors.push('Content is required before approval or publishing.');
    }

    if (status === 'published' && (!post.slug || !SLUG_RE.test(post.slug))) {
      errors.push('Published posts must have a valid public slug.');
    }

    if (status === 'scheduled') {
      if (!post.scheduledAt) errors.push('Scheduled posts must have a scheduled publish date.');
      else if (new Date(post.scheduledAt).getTime() <= Date.now()) {
        errors.push('Scheduled publish date must be in the future.');
      }
    }

    // Soft recommendations
    if (!post.metaTitle) recommendations.push('Add a meta title for better search appearance.');
    if (!post.metaDescription) recommendations.push('Add a meta description for better click-through.');
    if (!post.featuredImageAlt) recommendations.push('Add featured image alt text for accessibility and SEO.');
    if (!post.category && !post.categoryId) recommendations.push('Assign a category.');
    if (!post.targetKeyword) recommendations.push('Set a target keyword to focus SEO.');
    if (!post.coverImageUrl) recommendations.push('Add a featured image.');

    return Response.json({
      success: true,
      valid: errors.length === 0,
      errors,
      recommendations,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});