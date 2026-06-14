import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Public endpoint — records a pageview for a published blog post.
// No auth required (public visitors). Never tracks drafts/previews/admin views.
// Privacy: visitor uniqueness uses a hashed anonymous id; no raw IPs stored.

const todayUTC = () => new Date().toISOString().slice(0, 10);

function classifyDevice(ua = '') {
  const s = ua.toLowerCase();
  if (/ipad|tablet|kindle|playbook|silk/.test(s)) return 'tablet';
  if (/mobi|android|iphone|ipod|phone/.test(s)) return 'mobile';
  return 'desktop';
}

function classifySource(referrer = '') {
  if (!referrer) return 'direct';
  let host = '';
  try { host = new URL(referrer).hostname.replace(/^www\./, ''); } catch { return 'other'; }
  if (/google\.|bing\.|duckduckgo\.|yahoo\.|ecosia\./.test(host)) return 'search';
  if (/facebook\.|twitter\.|t\.co|linkedin\.|reddit\.|instagram\.|tiktok\.|youtube\.|pinterest\./.test(host)) return 'social';
  return 'referral';
}

async function hashId(input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { slug, visitorId, referrer, isAdminPreview } = body;
    if (!slug) return Response.json({ success: false, error: 'slug is required' }, { status: 400 });
    if (isAdminPreview) return Response.json({ success: true, skipped: 'preview' });

    const posts = await base44.asServiceRole.entities.BlogPost.filter({ slug });
    const post = posts[0];
    // Only count genuinely published posts.
    if (!post || post.status !== 'published') {
      return Response.json({ success: true, skipped: 'not_published' });
    }

    const ua = req.headers.get('user-agent') || '';
    const device = classifyDevice(ua);
    const source = classifySource(referrer);
    const day = todayUTC();

    // Anonymous, hashed visitor key for unique counting (no raw PII stored).
    const ipSeed = req.headers.get('x-forwarded-for') || '';
    const anonKey = await hashId(`${visitorId || ipSeed || 'anon'}|${post.id}|${day}`);

    const existing = await base44.asServiceRole.entities.BlogPostAnalytics.filter({ blogPostId: post.id, date: day });
    const row = existing[0];

    if (row) {
      const seen = row.sourceBreakdown || {};
      const seenVisitors = seen._visitors || {};
      const isNewVisitor = !seenVisitors[anonKey];
      const nextSources = { ...seen };
      nextSources[source] = (nextSources[source] || 0) + 1;
      nextSources._devices = { ...(seen._devices || {}) };
      nextSources._devices[device] = (nextSources._devices[device] || 0) + 1;
      if (isNewVisitor) {
        nextSources._visitors = { ...seenVisitors, [anonKey]: 1 };
      }
      await base44.asServiceRole.entities.BlogPostAnalytics.update(row.id, {
        pageviews: (row.pageviews || 0) + 1,
        uniqueVisitors: (row.uniqueVisitors || 0) + (isNewVisitor ? 1 : 0),
        sourceBreakdown: nextSources,
      });
    } else {
      await base44.asServiceRole.entities.BlogPostAnalytics.create({
        blogPostId: post.id,
        date: day,
        pageviews: 1,
        uniqueVisitors: 1,
        sourceBreakdown: {
          [source]: 1,
          _devices: { [device]: 1 },
          _visitors: { [anonKey]: 1 },
        },
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});