import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only — aggregate overview metrics across all posts within filters.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { startDate, endDate, category, tag, author, status, source } = await req.json().catch(() => ({}));

    const [posts, analytics] = await Promise.all([
      base44.asServiceRole.entities.BlogPost.list('-created_date', 2000),
      base44.asServiceRole.entities.BlogPostAnalytics.list('-date', 5000),
    ]);

    const postById = {};
    posts.forEach((p) => { postById[p.id] = p; });

    const matchesPost = (p) => {
      if (!p) return false;
      if (category && p.category !== category && p.categoryId !== category) return false;
      if (tag && !(p.tags || []).includes(tag) && !(p.tagIds || []).includes(tag)) return false;
      if (author && p.author !== author) return false;
      if (status && (p.status || 'draft') !== status) return false;
      return true;
    };
    const inRange = (d) => (!startDate || d >= startDate) && (!endDate || d <= endDate);

    let totalPageviews = 0, totalUnique = 0, totalClicks = 0, totalConversions = 0;
    let timeSum = 0, timeSamples = 0, scrollSum = 0, scrollSamples = 0;
    const perPost = {};
    const sources = {};
    const categories = {};

    for (const row of analytics) {
      const p = postById[row.blogPostId];
      if (!matchesPost(p) || !inRange(row.date)) continue;
      const br = row.sourceBreakdown || {};
      // Source filter applies to whether this row contributes to source-specific tallies.
      if (source && !(br[source] > 0)) continue;

      totalPageviews += row.pageviews || 0;
      totalUnique += row.uniqueVisitors || 0;
      totalClicks += row.clicks || 0;
      totalConversions += row.conversions || 0;
      if (row.averageTimeOnPage) { timeSum += row.averageTimeOnPage; timeSamples += 1; }
      if (row.scrollDepth) { scrollSum += row.scrollDepth; scrollSamples += 1; }

      perPost[row.blogPostId] = perPost[row.blogPostId] || { pageviews: 0, unique: 0, clicks: 0 };
      perPost[row.blogPostId].pageviews += row.pageviews || 0;
      perPost[row.blogPostId].unique += row.uniqueVisitors || 0;
      perPost[row.blogPostId].clicks += row.clicks || 0;

      ['direct', 'search', 'social', 'referral', 'other'].forEach((s) => {
        if (br[s]) sources[s] = (sources[s] || 0) + br[s];
      });

      const cat = p.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + (row.pageviews || 0);
    }

    const topPosts = Object.entries(perPost)
      .map(([id, m]) => ({ id, title: postById[id]?.title || 'Untitled', slug: postById[id]?.slug, ...m }))
      .sort((a, b) => b.pageviews - a.pageviews)
      .slice(0, 10);

    const topCategories = Object.entries(categories)
      .map(([name, pageviews]) => ({ name, pageviews }))
      .sort((a, b) => b.pageviews - a.pageviews)
      .slice(0, 8);

    const topSources = Object.entries(sources)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return Response.json({
      success: true,
      overview: {
        totalPageviews,
        uniqueVisitors: totalUnique,
        totalClicks,
        totalConversions,
        avgTimeOnPage: timeSamples ? Math.round(timeSum / timeSamples) : 0,
        avgScrollDepth: scrollSamples ? Math.round(scrollSum / scrollSamples) : 0,
        ctaClickRate: totalPageviews ? +((totalClicks / totalPageviews) * 100).toFixed(1) : 0,
        conversionRate: totalPageviews ? +((totalConversions / totalPageviews) * 100).toFixed(2) : 0,
      },
      topPosts,
      topCategories,
      topSources,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});