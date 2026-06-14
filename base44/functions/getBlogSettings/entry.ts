import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Defaults applied when no settings record exists yet. Keep in sync with the
// BlogSettings entity defaults so the public site and admin always have safe values.
const DEFAULTS = {
  key: 'global',
  blogEnabled: true,
  blogName: 'Blog',
  publicBlogRoute: '/learn/blog',
  defaultAuthorName: 'KodeBase Team',
  defaultLanguage: 'en',
  defaultTimezone: 'America/Chicago',
  defaultPostStatus: 'draft',
  requireApprovalBeforePublish: true,
  enableScheduledPublishing: true,
  allowManualPublish: true,
  notifyOnPublish: false,
  enableAiGeneration: true,
  enableAiImageGeneration: true,
  enableAutoPublishing: false,
  enableSeoScoring: true,
  enableInternalLinking: true,
  enableContentRefreshRecommendations: true,
  enableKeywordTracking: true,
  enableSitemapUpdates: true,
  defaultArticleLength: 'long',
  defaultMetaTitleTemplate: '{{title}} | KodeBase',
  defaultMetaDescriptionTemplate: '{{excerpt}}',
  defaultCategoryFallback: 'General',
  noindexDraftsAndPreviews: true,
  postsPerPage: 12,
  showAuthorBox: true,
  showRelatedPosts: true,
  showTableOfContents: false,
  allowComments: false,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rows = await base44.asServiceRole.entities.BlogSettings.filter({ key: 'global' });
    const settings = rows[0] ? { ...DEFAULTS, ...rows[0] } : { ...DEFAULTS };

    return Response.json({ success: true, settings, exists: !!rows[0] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});