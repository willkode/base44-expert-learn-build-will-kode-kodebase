import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only — detailed analytics for a single post within a date range.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { blogPostId, startDate, endDate } = await req.json();
    if (!blogPostId) return Response.json({ error: 'blogPostId is required' }, { status: 400 });

    const post = await base44.asServiceRole.entities.BlogPost.get(blogPostId);
    if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });

    const rows = await base44.asServiceRole.entities.BlogPostAnalytics.filter({ blogPostId }, '-date', 1000);
    const inRange = (d) => (!startDate || d >= startDate) && (!endDate || d <= endDate);
    const filtered = rows.filter((r) => inRange(r.date));

    let pageviews = 0, unique = 0, clicks = 0, conversions = 0;
    let timeSum = 0, timeSamples = 0, maxScroll = 0;
    const sources = {};
    const clicksByType = {};
    const daily = [];

    for (const r of filtered) {
      pageviews += r.pageviews || 0;
      unique += r.uniqueVisitors || 0;
      clicks += r.clicks || 0;
      conversions += r.conversions || 0;
      if (r.averageTimeOnPage) { timeSum += r.averageTimeOnPage; timeSamples += 1; }
      maxScroll = Math.max(maxScroll, r.scrollDepth || 0);
      const br = r.sourceBreakdown || {};
      ['direct', 'search', 'social', 'referral', 'other'].forEach((s) => { if (br[s]) sources[s] = (sources[s] || 0) + br[s]; });
      Object.entries(br._clicks || {}).forEach(([t, n]) => { clicksByType[t] = (clicksByType[t] || 0) + n; });
      daily.push({ date: r.date, pageviews: r.pageviews || 0, uniqueVisitors: r.uniqueVisitors || 0, clicks: r.clicks || 0 });
    }

    return Response.json({
      success: true,
      post: {
        id: post.id, title: post.title, slug: post.slug, status: post.status,
        publishedAt: post.publishedAt, seoScore: post.seoScore ?? null, category: post.category,
      },
      metrics: {
        pageviews, uniqueVisitors: unique, clicks, conversions,
        avgTimeOnPage: timeSamples ? Math.round(timeSum / timeSamples) : 0,
        scrollDepth: maxScroll,
        ctaClicks: clicksByType.cta || 0,
        internalLinkClicks: clicksByType.internal_link || 0,
        relatedPostClicks: clicksByType.related_post || 0,
      },
      sources: Object.entries(sources).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      daily: daily.sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});