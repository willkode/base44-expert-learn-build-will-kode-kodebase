import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only — content performance: best/worst posts, refresh candidates, conversion stats.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { startDate, endDate } = await req.json().catch(() => ({}));
    const [posts, analytics] = await Promise.all([
      base44.asServiceRole.entities.BlogPost.list('-created_date', 2000),
      base44.asServiceRole.entities.BlogPostAnalytics.list('-date', 5000),
    ]);
    const postById = {};
    posts.forEach((p) => { postById[p.id] = p; });
    const inRange = (d) => (!startDate || d >= startDate) && (!endDate || d <= endDate);

    const agg = {};
    let totalPageviews = 0, totalConversions = 0, totalClicks = 0;
    for (const r of analytics) {
      if (!inRange(r.date)) continue;
      const p = postById[r.blogPostId];
      if (!p || p.status !== 'published') continue;
      const a = agg[r.blogPostId] = agg[r.blogPostId] || { pageviews: 0, clicks: 0, conversions: 0, scrollMax: 0, timeSum: 0, timeSamples: 0 };
      a.pageviews += r.pageviews || 0;
      a.clicks += r.clicks || 0;
      a.conversions += r.conversions || 0;
      a.scrollMax = Math.max(a.scrollMax, r.scrollDepth || 0);
      if (r.averageTimeOnPage) { a.timeSum += r.averageTimeOnPage; a.timeSamples += 1; }
      totalPageviews += r.pageviews || 0;
      totalConversions += r.conversions || 0;
      totalClicks += r.clicks || 0;
    }

    const rows = Object.entries(agg).map(([id, a]) => {
      const p = postById[id];
      return {
        id, title: p.title, slug: p.slug, seoScore: p.seoScore ?? null, publishedAt: p.publishedAt,
        category: p.category, tags: p.tags || [],
        pageviews: a.pageviews, clicks: a.clicks, conversions: a.conversions,
        scrollDepth: a.scrollMax,
        avgTimeOnPage: a.timeSamples ? Math.round(a.timeSum / a.timeSamples) : 0,
        ctaRate: a.pageviews ? +((a.clicks / a.pageviews) * 100).toFixed(1) : 0,
      };
    });

    const byViews = [...rows].sort((a, b) => b.pageviews - a.pageviews);
    const bestPosts = byViews.slice(0, 8);
    const worstPosts = [...byViews].reverse().filter((r) => r.pageviews > 0).slice(0, 8);
    // High traffic but low CTA engagement (top-half traffic, bottom CTA rate).
    const medianViews = byViews.length ? byViews[Math.floor(byViews.length / 2)].pageviews : 0;
    const highTrafficLowCta = rows
      .filter((r) => r.pageviews >= medianViews && r.pageviews > 0 && r.ctaRate < 2)
      .sort((a, b) => b.pageviews - a.pageviews).slice(0, 8);
    const lowScrollDepth = rows
      .filter((r) => r.pageviews > 0 && r.scrollDepth < 50)
      .sort((a, b) => b.pageviews - a.pageviews).slice(0, 8);
    // Refresh candidates: published > 180 days ago, declining or low engagement.
    const cutoff = Date.now() - 180 * 86400000;
    const needsRefresh = rows
      .filter((r) => r.publishedAt && new Date(r.publishedAt).getTime() < cutoff)
      .filter((r) => r.scrollDepth < 75 || r.ctaRate < 2 || (r.seoScore != null && r.seoScore < 70))
      .sort((a, b) => b.pageviews - a.pageviews).slice(0, 8);

    // Best categories & tags by pageviews.
    const catMap = {}, tagMap = {};
    rows.forEach((r) => {
      const c = r.category || 'Uncategorized';
      catMap[c] = (catMap[c] || 0) + r.pageviews;
      (r.tags || []).forEach((t) => { tagMap[t] = (tagMap[t] || 0) + r.pageviews; });
    });
    const bestCategories = Object.entries(catMap).map(([name, pageviews]) => ({ name, pageviews })).sort((a, b) => b.pageviews - a.pageviews).slice(0, 8);
    const bestTags = Object.entries(tagMap).map(([name, pageviews]) => ({ name, pageviews })).sort((a, b) => b.pageviews - a.pageviews).slice(0, 12);

    return Response.json({
      success: true,
      conversion: {
        totalPageviews, totalConversions, totalClicks,
        conversionRate: totalPageviews ? +((totalConversions / totalPageviews) * 100).toFixed(2) : 0,
        ctaClickRate: totalPageviews ? +((totalClicks / totalPageviews) * 100).toFixed(1) : 0,
      },
      bestPosts, worstPosts, highTrafficLowCta, lowScrollDepth, needsRefresh,
      bestCategories, bestTags,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});