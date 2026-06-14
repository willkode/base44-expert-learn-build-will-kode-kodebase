import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only production-readiness check for the AI blogging system.
// Returns booleans/counts only — NEVER secret values.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const svc = base44.asServiceRole;

    const [settingsRows, categories, tags, keywords, plans, posts, gscRows] = await Promise.all([
      svc.entities.BlogSettings.filter({ key: 'global' }).catch(() => []),
      svc.entities.BlogCategory.list('', 1).catch(() => []),
      svc.entities.BlogTag.list('', 1).catch(() => []),
      svc.entities.BlogKeyword.list('', 1).catch(() => []),
      svc.entities.BlogContentPlan.list('', 1).catch(() => []),
      svc.entities.BlogPost.list('-created_date', 1000).catch(() => []),
      svc.entities.SearchConsoleConnection.filter({ key: 'global' }).catch(() => []),
    ]);

    const settings = settingsRows[0] || null;
    const gsc = gscRows[0] || null;

    const publishedPosts = posts.filter((p) => p.status === 'published' || (!p.status && p.published));
    const scoredPosts = posts.filter((p) => typeof p.seoScore === 'number');
    const withImage = posts.filter((p) => p.coverImageUrl);
    const approvedOrBeyond = posts.filter((p) =>
      ['approved', 'scheduled', 'publishing', 'published'].includes(p.status)
    );

    // Secret presence — booleans only, values never returned.
    const secrets = {
      // The platform-managed InvokeLLM/GenerateImage integrations require no
      // builder-provided key, so these are always available.
      aiProvider: true,
      imageProvider: true,
      appPublicUrl: !!Deno.env.get('APP_PUBLIC_URL'),
      searchConsole: !!gsc?.connected,
      resend: !!Deno.env.get('RESEND_API_KEY'),
    };

    const checklist = {
      blogEnabled: !!settings && settings.blogEnabled !== false,
      blogNameSet: !!settings?.blogName && settings.blogName !== 'Blog',
      authorConfigured: !!settings?.defaultAuthorName,
      seoDefaultsSet: !!settings?.defaultMetaTitleTemplate && !!settings?.defaultCanonicalUrlBase,
      hasCategories: categories.length > 0,
      hasTags: tags.length > 0,
      hasKeywords: keywords.length > 0,
      hasContentPlan: plans.length > 0,
      hasPosts: posts.length > 0,
      hasScoredPost: scoredPosts.length > 0,
      hasFeaturedImage: withImage.length > 0,
      hasApprovedPost: approvedOrBeyond.length > 0,
      hasPublishedPost: publishedPosts.length > 0,
      searchConsoleConnected: !!gsc?.connected,
    };

    const completed = Object.values(checklist).filter(Boolean).length;
    const total = Object.keys(checklist).length;

    return Response.json({
      success: true,
      settingsExists: !!settings,
      secrets,
      checklist,
      progress: { completed, total, percent: Math.round((completed / total) * 100) },
      counts: {
        posts: posts.length,
        published: publishedPosts.length,
        categories: categories.length,
        tags: tags.length,
        keywords: keywords.length,
        plans: plans.length,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});