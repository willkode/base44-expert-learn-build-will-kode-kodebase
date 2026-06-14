import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Heuristics-driven content refresh recommendation engine.
// Scans published posts + analytics + Search Console data and creates
// BlogContentRefreshRecommendation records (one per post, highest-priority reason).

const DAY_MS = 24 * 60 * 60 * 1000;

// Date-sensitive language that hints a post may be stale.
const DATED_PATTERNS = [/\b20(1[0-9]|2[0-4])\b/, /\bthis year\b/i, /\blast year\b/i, /\bcurrently\b/i, /\brecently\b/i];

function priorityRank(p) { return p === 'high' ? 3 : p === 'medium' ? 2 : 1; }

// Build the candidate list of issues for a single post. Returns array of
// { recommendationType, reason, priority, suggestedChanges }.
function evaluatePost({ post, analytics, scPages, scQueries, settings }) {
  const issues = [];
  const content = post.content || '';
  const plain = (post.contentPlainText || content || '').replace(/[#*`_>\-]/g, ' ');
  const wordCount = post.wordCount || plain.split(/\s+/).filter(Boolean).length;
  const lower = content.toLowerCase();

  // --- Aggregate internal analytics for this post ---
  let pageviews = 0, conversions = 0, recentClicks = 0, priorClicks = 0;
  let maxScroll = 0;
  const sortedA = [...analytics].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const half = Math.floor(sortedA.length / 2);
  sortedA.forEach((r, i) => {
    pageviews += r.pageviews || 0;
    conversions += r.conversions || 0;
    maxScroll = Math.max(maxScroll, r.scrollDepth || 0);
    if (i >= half) recentClicks += r.clicks || 0; else priorClicks += r.clicks || 0;
  });

  // --- Aggregate Search Console for this post ---
  let scImpr = 0, scClicks = 0, posSum = 0, posSamples = 0;
  for (const r of scPages) { scImpr += r.impressions || 0; scClicks += r.clicks || 0; if (r.position) { posSum += r.position; posSamples += 1; } }
  const scCtr = scImpr > 0 ? (scClicks / scImpr) * 100 : 0;
  const avgPosition = posSamples ? posSum / posSamples : 0;

  // --- Structure checks ---
  const hasInternalLink = /\]\(\/(learn|products|pricing|features)/.test(content) || /\]\(\/learn\/blog\//.test(content);
  const hasFaq = /##\s*faq/i.test(content) || /frequently asked/i.test(lower);
  const hasCta = /\b(get started|sign up|try|download|learn more|book a|contact us|subscribe)\b/i.test(lower);
  const thinThreshold = settings?.thinContentWordThreshold || 600;
  const ageThresholdDays = settings?.refreshAgeThresholdDays || 180;

  const publishedAt = post.publishedAt || post.created_date;
  const ageDays = publishedAt ? Math.floor((Date.now() - new Date(publishedAt).getTime()) / DAY_MS) : 0;

  // --- Triggers (each pushes a candidate issue) ---
  if (typeof post.seoScore === 'number' && post.seoScore < 60)
    issues.push({ recommendationType: 'fix_decay', reason: `Low SEO score (${post.seoScore}/100).`, priority: 'high', suggestedChanges: 'Run a full SEO pass: title, meta, headings, keyword usage, and internal links.' });

  if (!post.metaDescription || post.metaDescription.trim().length < 50)
    issues.push({ recommendationType: 'update_meta', reason: 'Missing or thin meta description.', priority: 'high', suggestedChanges: 'Write a 120–160 character meta description with the target keyword to lift click-through.' });

  if (!post.title || post.title.length < 25 || post.title.length > 70)
    issues.push({ recommendationType: 'update_title', reason: 'Weak title length for search.', priority: 'medium', suggestedChanges: 'Rewrite the title to 40–65 characters, leading with the target keyword and a clear benefit.' });

  if (!hasInternalLink)
    issues.push({ recommendationType: 'add_internal_links', reason: 'No internal links found in the post.', priority: 'medium', suggestedChanges: 'Add 2–4 contextual internal links to related posts and product pages.' });

  if (!hasCta)
    issues.push({ recommendationType: 'improve_cta', reason: 'No call-to-action detected.', priority: 'medium', suggestedChanges: 'Add a natural CTA near the end pointing to the next step (signup, product, or related guide).' });

  if (maxScroll > 0 && maxScroll < 40)
    issues.push({ recommendationType: 'improve_intro', reason: `Low scroll depth (${maxScroll}%) — readers leave early.`, priority: 'high', suggestedChanges: 'Refresh the intro to answer search intent immediately and tighten the opening sections.' });

  if (pageviews >= 100 && conversions === 0)
    issues.push({ recommendationType: 'improve_cta', reason: `High traffic (${pageviews} views) but zero conversions.`, priority: 'high', suggestedChanges: 'Add stronger, better-placed CTAs and a relevant offer to convert existing traffic.' });

  if (priorClicks >= 10 && recentClicks < priorClicks * 0.7)
    issues.push({ recommendationType: 'fix_decay', reason: `Traffic declining (${priorClicks} → ${recentClicks} clicks).`, priority: 'high', suggestedChanges: 'Refresh content, update stats and examples, and re-promote to recover lost traffic.' });

  if (scImpr >= 100 && scCtr < 1.5)
    issues.push({ recommendationType: 'update_meta', reason: `${scImpr} impressions but ${scCtr.toFixed(1)}% CTR.`, priority: 'high', suggestedChanges: 'Rewrite the title and meta description to better match what searchers click.' });

  if (avgPosition >= 4 && avgPosition <= 15)
    issues.push({ recommendationType: 'expand_content', reason: `Ranks position ${avgPosition.toFixed(1)} — close to page 1.`, priority: 'high', suggestedChanges: 'Expand depth, add sections and a FAQ, and strengthen internal links to push onto page 1.' });

  if (DATED_PATTERNS.some((re) => re.test(plain)))
    issues.push({ recommendationType: 'refresh_stats', reason: 'Contains date-sensitive language that may be outdated.', priority: 'medium', suggestedChanges: 'Update years, stats, and time-relative phrasing to keep the post current.' });

  if (ageDays >= ageThresholdDays)
    issues.push({ recommendationType: 'refresh_stats', reason: `Published ${ageDays} days ago — past the refresh threshold.`, priority: 'low', suggestedChanges: 'Review for accuracy, refresh examples, and update the published date after editing.' });

  if (wordCount > 0 && wordCount < thinThreshold)
    issues.push({ recommendationType: 'expand_content', reason: `Thin content (${wordCount} words).`, priority: 'medium', suggestedChanges: `Expand to at least ${thinThreshold}+ words with deeper, more useful sections.` });

  if (!hasFaq && wordCount >= 800)
    issues.push({ recommendationType: 'add_section', reason: 'Long post without an FAQ section.', priority: 'low', suggestedChanges: 'Add a "## FAQ" section answering 3–5 common questions to capture related searches.' });

  return { issues, metrics: { pageviews, conversions, recentClicks, priorClicks, maxScroll, scImpr, scClicks, scCtr: Number(scCtr.toFixed(1)), avgPosition: Number(avgPosition.toFixed(1)), wordCount, ageDays } };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { date_range, include_search_console_data = true, include_internal_analytics = true } = body;

    const svc = base44.asServiceRole;

    // Settings (thresholds)
    const settingsRows = await svc.entities.BlogSettings.filter({ key: 'global' });
    const settings = settingsRows[0] || {};

    // Published posts only
    const posts = (await svc.entities.BlogPost.filter({ status: 'published' }, '-publishedAt', 1000));
    if (posts.length === 0) {
      return Response.json({ success: true, created: 0, evaluated: 0, recommendations: [], message: 'No published posts to evaluate.' });
    }

    const startDate = date_range?.startDate || null;
    const endDate = date_range?.endDate || null;
    const inRange = (d) => (!startDate || d >= startDate) && (!endDate || d <= endDate);

    // Analytics
    let analyticsByPost = {};
    if (include_internal_analytics) {
      const analytics = await svc.entities.BlogPostAnalytics.list('-date', 5000);
      for (const a of analytics) {
        if (!inRange(a.date)) continue;
        (analyticsByPost[a.blogPostId] ||= []).push(a);
      }
    }

    // Search Console
    let scPagesByPost = {}, scQueriesByPost = {};
    if (include_search_console_data) {
      const scPages = await svc.entities.SearchConsolePageData.list('-date', 5000).catch(() => []);
      const scQueries = await svc.entities.SearchConsoleQueryData.list('-date', 5000).catch(() => []);
      for (const r of scPages) { if (r.blogPostId && inRange(r.date)) (scPagesByPost[r.blogPostId] ||= []).push(r); }
      for (const r of scQueries) { if (r.blogPostId && inRange(r.date)) (scQueriesByPost[r.blogPostId] ||= []).push(r); }
    }

    // Existing open/in-progress recs — don't duplicate.
    const existing = await svc.entities.BlogContentRefreshRecommendation.list('-created_date', 2000);
    const openByPost = {};
    for (const r of existing) {
      if (r.status === 'open' || r.status === 'in_progress') openByPost[r.blogPostId] = r;
    }

    const created = [];
    let evaluated = 0;

    for (const post of posts) {
      evaluated += 1;
      const { issues, metrics } = evaluatePost({
        post,
        analytics: analyticsByPost[post.id] || [],
        scPages: scPagesByPost[post.id] || [],
        scQueries: scQueriesByPost[post.id] || [],
        settings,
      });
      if (issues.length === 0) continue;

      // Pick the highest-priority issue as the headline recommendation.
      issues.sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority));
      const top = issues[0];
      const allReasons = issues.map((i) => i.reason);

      if (openByPost[post.id]) continue; // already has an active rec

      const rec = await svc.entities.BlogContentRefreshRecommendation.create({
        blogPostId: post.id,
        recommendationType: top.recommendationType,
        reason: top.reason,
        priority: top.priority,
        suggestedChanges: [top.suggestedChanges, ...(allReasons.length > 1 ? [`Also flagged: ${allReasons.slice(1).join('; ')}`] : [])].join('\n\n'),
        status: 'open',
      });
      created.push({ id: rec.id, blogPostId: post.id, title: post.title, priority: top.priority, recommendationType: top.recommendationType, reason: top.reason, metrics });
    }

    await svc.entities.BlogAutomationLog.create({
      eventType: 'refresh_scan',
      status: 'success',
      message: `Refresh scan: ${created.length} recommendations created across ${evaluated} published posts.`,
      metadata: { created: created.length, evaluated, include_search_console_data, include_internal_analytics },
    });

    return Response.json({ success: true, created: created.length, evaluated, recommendations: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});