import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only — traffic source + device breakdown across all posts within filters.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { startDate, endDate } = await req.json().catch(() => ({}));
    const analytics = await base44.asServiceRole.entities.BlogPostAnalytics.list('-date', 5000);
    const inRange = (d) => (!startDate || d >= startDate) && (!endDate || d <= endDate);

    const sources = {};
    const devices = {};
    for (const r of analytics) {
      if (!inRange(r.date)) continue;
      const br = r.sourceBreakdown || {};
      ['direct', 'search', 'social', 'referral', 'other'].forEach((s) => { if (br[s]) sources[s] = (sources[s] || 0) + br[s]; });
      Object.entries(br._devices || {}).forEach(([d, n]) => { devices[d] = (devices[d] || 0) + n; });
    }
    const total = Object.values(sources).reduce((a, b) => a + b, 0) || 1;

    return Response.json({
      success: true,
      sources: Object.entries(sources)
        .map(([name, count]) => ({ name, count, percent: +((count / total) * 100).toFixed(1) }))
        .sort((a, b) => b.count - a.count),
      devices: Object.entries(devices).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});