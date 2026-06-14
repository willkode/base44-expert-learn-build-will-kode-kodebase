import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Public endpoint — records the deepest scroll threshold reached and time on page.
// depth: 25 | 50 | 75 | 100 ; seconds: time on page (optional)
// We keep the MAX scroll depth and a running average of time-on-page for the day.

const todayUTC = () => new Date().toISOString().slice(0, 10);
const VALID_DEPTHS = [25, 50, 75, 100];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { slug, depth, seconds, isAdminPreview } = await req.json();
    if (!slug) return Response.json({ success: false, error: 'slug is required' }, { status: 400 });
    if (isAdminPreview) return Response.json({ success: true, skipped: 'preview' });
    const d = VALID_DEPTHS.includes(depth) ? depth : 0;

    const posts = await base44.asServiceRole.entities.BlogPost.filter({ slug });
    const post = posts[0];
    if (!post || post.status !== 'published') {
      return Response.json({ success: true, skipped: 'not_published' });
    }

    const day = todayUTC();
    const existing = await base44.asServiceRole.entities.BlogPostAnalytics.filter({ blogPostId: post.id, date: day });
    const row = existing[0];
    const sec = Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds, 3600) : 0;

    if (row) {
      const breakdown = row.sourceBreakdown || {};
      const meta = breakdown._engagement || { timeSamples: 0, timeSum: 0 };
      let avgTime = row.averageTimeOnPage || 0;
      if (sec > 0) {
        meta.timeSamples = (meta.timeSamples || 0) + 1;
        meta.timeSum = (meta.timeSum || 0) + sec;
        avgTime = Math.round(meta.timeSum / meta.timeSamples);
      }
      await base44.asServiceRole.entities.BlogPostAnalytics.update(row.id, {
        scrollDepth: Math.max(row.scrollDepth || 0, d),
        averageTimeOnPage: avgTime,
        sourceBreakdown: { ...breakdown, _engagement: meta },
      });
    } else {
      await base44.asServiceRole.entities.BlogPostAnalytics.create({
        blogPostId: post.id,
        date: day,
        scrollDepth: d,
        averageTimeOnPage: sec,
        sourceBreakdown: { _engagement: { timeSamples: sec > 0 ? 1 : 0, timeSum: sec } },
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});