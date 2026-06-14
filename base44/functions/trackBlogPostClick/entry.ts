import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Public endpoint — records a click event on a published post.
// clickType: 'cta' | 'internal_link' | 'related_post'

const todayUTC = () => new Date().toISOString().slice(0, 10);
const VALID = ['cta', 'internal_link', 'related_post'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { slug, clickType, isAdminPreview } = await req.json();
    if (!slug) return Response.json({ success: false, error: 'slug is required' }, { status: 400 });
    if (isAdminPreview) return Response.json({ success: true, skipped: 'preview' });
    const type = VALID.includes(clickType) ? clickType : 'cta';

    const posts = await base44.asServiceRole.entities.BlogPost.filter({ slug });
    const post = posts[0];
    if (!post || post.status !== 'published') {
      return Response.json({ success: true, skipped: 'not_published' });
    }

    const day = todayUTC();
    const existing = await base44.asServiceRole.entities.BlogPostAnalytics.filter({ blogPostId: post.id, date: day });
    const row = existing[0];

    if (row) {
      const breakdown = row.sourceBreakdown || {};
      const clicksByType = { ...(breakdown._clicks || {}) };
      clicksByType[type] = (clicksByType[type] || 0) + 1;
      await base44.asServiceRole.entities.BlogPostAnalytics.update(row.id, {
        clicks: (row.clicks || 0) + 1,
        sourceBreakdown: { ...breakdown, _clicks: clicksByType },
      });
    } else {
      await base44.asServiceRole.entities.BlogPostAnalytics.create({
        blogPostId: post.id,
        date: day,
        clicks: 1,
        sourceBreakdown: { _clicks: { [type]: 1 } },
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});