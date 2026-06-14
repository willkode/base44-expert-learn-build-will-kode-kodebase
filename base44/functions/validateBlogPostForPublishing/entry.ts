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
    const goingLive = ['scheduled', 'published'].includes(status);

    // Load settings once for all publish-safety gates.
    const settings = (await base44.asServiceRole.entities.BlogSettings.filter({ key: 'global' }))[0] || {};

    // Approval gate: surface as a blocking error so the UI explains what's blocking publishing.
    if (goingLive && settings.requireApprovalBeforePublish && post.approvalStatus !== 'approved') {
      errors.push('This post must be approved before it can be scheduled or published.');
    }

    // Configurable publishing-safety gates (only block when the admin enabled them).
    if (goingLive) {
      if (settings.requireFeaturedImageBeforePublish && !post.coverImageUrl)
        errors.push('A featured image is required before publishing (enabled in Blog Settings).');
      if (settings.requireMetaTitleBeforePublish && !post.metaTitle)
        errors.push('A meta title is required before publishing (enabled in Blog Settings).');
      if (settings.requireMetaDescriptionBeforePublish && !post.metaDescription)
        errors.push('A meta description is required before publishing (enabled in Blog Settings).');
      if (settings.requireCategoryBeforePublish && !post.category && !post.categoryId)
        errors.push('A category is required before publishing (enabled in Blog Settings).');
      if (settings.requireCta && post.content && !/\b(get started|sign up|try|download|learn more|subscribe|contact)\b/i.test(post.content))
        errors.push('A call-to-action is required before publishing (enabled in Blog Settings).');
      if (settings.requireFaq && post.content && !/##\s*faq/i.test(post.content))
        errors.push('An FAQ section is required before publishing (enabled in Blog Settings).');

      if (settings.requireSeoScoreBeforePublish) {
        const min = Number(settings.minSeoScoreToPublish ?? 60);
        if (typeof post.seoScore !== 'number') errors.push(`Run an SEO analysis before publishing (minimum score ${min} required).`);
        else if (post.seoScore < min) errors.push(`SEO score ${post.seoScore} is below the required minimum of ${min}.`);
      }

      // Placeholder text block
      if (settings.blockPlaceholderText && post.content && /(lorem ipsum|todo:|tk tk|\bTKTK\b|\[placeholder\]|xxxx)/i.test(post.content))
        errors.push('Content contains placeholder text — remove it before publishing.');

      // Duplicate target keyword block
      if (settings.blockDuplicateTargetKeywords && post.targetKeyword) {
        const others = await base44.asServiceRole.entities.BlogPost.filter({ targetKeyword: post.targetKeyword, status: 'published' });
        if (others.find((m) => m.id !== post.id))
          errors.push(`Another published post already targets the keyword "${post.targetKeyword}".`);
      }
    }

    // Word-count bounds (recommendation, non-blocking)
    const wc = post.wordCount || (post.contentPlainText ? post.contentPlainText.split(/\s+/).filter(Boolean).length : 0);
    if (wc && settings.minWordCount && wc < Number(settings.minWordCount))
      recommendations.push(`Post is ${wc} words — below the ${settings.minWordCount}-word minimum.`);
    if (wc && settings.maxWordCount && wc > Number(settings.maxWordCount))
      recommendations.push(`Post is ${wc} words — above the ${settings.maxWordCount}-word maximum.`);

    // Keyword cannibalization warning (non-blocking)
    if (settings.warnKeywordCannibalization && post.targetKeyword && !settings.blockDuplicateTargetKeywords) {
      const others = await base44.asServiceRole.entities.BlogPost.filter({ targetKeyword: post.targetKeyword });
      if (others.find((m) => m.id !== post.id))
        recommendations.push(`Another post targets "${post.targetKeyword}" — possible keyword cannibalization.`);
    }

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