import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Whitelist of fields admins may update. No secrets/keys are ever stored here.
const ALLOWED_FIELDS = [
  'blogEnabled', 'enablePublicBlogPages', 'blogName', 'blogDescription', 'publicBlogRoute',
  'defaultAuthorName', 'defaultAuthorBio', 'defaultAuthorAvatarUrl',
  'defaultAuthorWebsite', 'defaultAuthorTwitter', 'defaultAuthorLinkedin',
  'defaultLanguage', 'defaultTimezone', 'defaultPostStatus',
  'requireApprovalBeforePublish', 'enableScheduledPublishing', 'allowManualPublish',
  'enableAutoPublishing', 'notifyOnPublish',
  'enableAiGeneration', 'enableAiImageGeneration',
  'enableSeoScoring', 'enableInternalLinking', 'enableContentRefreshRecommendations',
  'enableAnalyticsTracking', 'enableBlogRepurposing',
  'enableKeywordTracking', 'enableSitemapUpdates',
  // Publishing safety
  'requireSeoScoreBeforePublish', 'minSeoScoreToPublish',
  'requireFeaturedImageBeforePublish', 'requireMetaTitleBeforePublish',
  'requireMetaDescriptionBeforePublish', 'requireCategoryBeforePublish',
  'blockDuplicateTargetKeywords', 'warnKeywordCannibalization',
  'blockPlaceholderText', 'warnUnsupportedClaims',
  // AI usage limits
  'maxAiPostsPerDay', 'maxAiImagesPerDay', 'maxRefreshFixesPerDay',
  'maxRepurposingPerDay', 'maxContentPlanPostsPerGeneration',
  // Content quality
  'minWordCount', 'maxWordCount', 'requireCta', 'requireFaq',
  'requireInternalLinks', 'requireHumanReview', 'requiredBrandTerms',
  // Notifications
  'notifyOnNeedsReview', 'notifyOnApproved', 'notifyOnPublishingFailed',
  'notifyOnRefreshRecommended', 'notifyOnLowSeoScore', 'notificationEmail',
  // Permissions
  'permCreatePosts', 'permEditPosts', 'permApprovePosts', 'permPublishPosts',
  'permManageSettings', 'permViewAnalytics', 'permUseAiGeneration',
  'defaultArticleTone', 'defaultArticleLength', 'defaultContentStructure',
  'defaultCta', 'defaultBrandVoice', 'bannedWords', 'preferredWords',
  'defaultFeaturedImageStyle', 'defaultMetaTitleTemplate', 'defaultMetaDescriptionTemplate',
  'defaultCanonicalUrlBase', 'defaultOgImageUrl', 'defaultTwitterImageUrl',
  'defaultCategoryFallback', 'noindexDraftsAndPreviews',
  'postsPerPage', 'showAuthorBox', 'showRelatedPosts', 'showTableOfContents', 'allowComments',
];

// Inlined validation (no local imports allowed in Deno functions).
function validate(input) {
  const errors = [];
  const warnings = [];
  if (input.blogEnabled) {
    if (!input.blogName || !String(input.blogName).trim()) errors.push('Blog name is required when the blog is enabled.');
    if (!input.publicBlogRoute || !String(input.publicBlogRoute).startsWith('/')) errors.push('Public blog route must start with "/".');
    if (!input.defaultMetaTitleTemplate || !String(input.defaultMetaTitleTemplate).trim()) errors.push('A default meta title template is required for SEO.');
    if (!input.defaultAuthorName || !String(input.defaultAuthorName).trim()) warnings.push('No default author name set — posts may display without an author.');
    if (!input.defaultOgImageUrl) warnings.push('No default Open Graph image set — social shares may lack a preview image.');
  }
  const ppp = Number(input.postsPerPage);
  if (input.postsPerPage != null && (!Number.isInteger(ppp) || ppp < 1 || ppp > 100)) errors.push('Posts per page must be a whole number between 1 and 100.');
  if (input.enableAutoPublishing && input.requireApprovalBeforePublish) warnings.push('Auto-publishing is on while approval is required — posts will still wait for approval.');

  // Word-count sanity
  const minW = Number(input.minWordCount), maxW = Number(input.maxWordCount);
  if (input.minWordCount != null && (minW < 0)) errors.push('Minimum word count cannot be negative.');
  if (input.minWordCount != null && input.maxWordCount != null && maxW > 0 && minW > maxW) {
    errors.push('Minimum word count cannot be greater than maximum word count.');
  }
  // SEO gate
  const minSeo = Number(input.minSeoScoreToPublish);
  if (input.requireSeoScoreBeforePublish && (!(minSeo >= 0 && minSeo <= 100))) {
    errors.push('Minimum SEO score to publish must be between 0 and 100.');
  }
  // Daily limits must be non-negative whole numbers
  for (const f of ['maxAiPostsPerDay', 'maxAiImagesPerDay', 'maxRefreshFixesPerDay', 'maxRepurposingPerDay', 'maxContentPlanPostsPerGeneration']) {
    if (input[f] != null) {
      const v = Number(input[f]);
      if (!Number.isInteger(v) || v < 0) errors.push(`${f} must be a whole number of 0 or more.`);
    }
  }
  if (input.notificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input.notificationEmail))) {
    errors.push('Notification email is not a valid email address.');
  }
  return { valid: errors.length === 0, errors, warnings };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = await req.json();
    const input = payload?.settings || {};
    if (typeof input !== 'object' || Array.isArray(input)) {
      return Response.json({ error: 'Invalid settings payload' }, { status: 400 });
    }
    const blocked = Object.keys(input).find((k) => /api[_-]?key|secret|token|password/i.test(k));
    if (blocked) {
      return Response.json({ error: `Field "${blocked}" is not allowed.` }, { status: 400 });
    }

    // Merge with existing to validate the full effective config.
    const rows = await base44.asServiceRole.entities.BlogSettings.filter({ key: 'global' });
    const existing = rows[0] || {};
    const data = {};
    for (const k of ALLOWED_FIELDS) {
      if (k in input) data[k] = input[k];
    }
    const effective = { ...existing, ...data };

    const result = validate(effective);
    if (!result.valid) {
      return Response.json({ error: 'Validation failed', errors: result.errors, warnings: result.warnings }, { status: 400 });
    }

    let record;
    if (rows[0]) {
      record = await base44.asServiceRole.entities.BlogSettings.update(rows[0].id, data);
    } else {
      record = await base44.asServiceRole.entities.BlogSettings.create({ key: 'global', ...data });
    }

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'settings_updated',
      status: 'success',
      message: `Blog settings updated by ${user.email} (${Object.keys(data).length} fields)`,
      metadata: { updatedFields: Object.keys(data), warnings: result.warnings },
    });

    return Response.json({ success: true, settings: record, warnings: result.warnings });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});