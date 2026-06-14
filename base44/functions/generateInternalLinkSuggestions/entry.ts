import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only. Analyzes posts and suggests internal links (source -> target) using
// title/keyword/category/tag/cluster overlap, then saves them as BlogInternalLink
// records with status "suggested". De-dupes against existing suggestions/applied links.

const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'with', 'how', 'why', 'what', 'your', 'you', 'is', 'are', 'this', 'that', 'from', 'by', 'it', 'as', 'at', 'be', 'guide', 'best', 'top']);

function tokenize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
}

function postKeywords(p) {
  const parts = [p.title, p.targetKeyword, ...(p.secondaryKeywords || []), p.category, ...(p.tags || [])];
  return new Set(tokenize(parts.join(' ')));
}

// Overlap score between two posts (0..1-ish).
function relevance(a, b) {
  const ka = postKeywords(a);
  const kb = postKeywords(b);
  if (ka.size === 0 || kb.size === 0) return 0;
  let shared = 0;
  ka.forEach((w) => { if (kb.has(w)) shared += 1; });
  let score = shared / Math.min(ka.size, kb.size);
  if (a.categoryId && a.categoryId === b.categoryId) score += 0.15;
  if (a.topicClusterId && a.topicClusterId === b.topicClusterId) score += 0.25;
  return score;
}

// Find a natural anchor phrase: prefer the target's target keyword, else a short title fragment.
function anchorFor(target) {
  if (target.targetKeyword && target.targetKeyword.length <= 45) return target.targetKeyword;
  const title = target.title || '';
  return title.length <= 50 ? title : title.split(/[:\-—|]/)[0].trim().slice(0, 50);
}

const MAX_PER_SOURCE = 4;
const MIN_RELEVANCE = 0.18;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { blog_post_id = null, topic_cluster_id = null, all_posts = false } = await req.json();

    const Posts = base44.asServiceRole.entities.BlogPost;
    const Links = base44.asServiceRole.entities.BlogInternalLink;

    const allPosts = await Posts.list('-created_date', 500);
    // Candidate TARGETS: published posts only (never link to unpublished on public pages).
    const targets = allPosts.filter((p) => p.slug && (p.status === 'published' || p.published));

    // Decide which posts get suggestions generated FOR them (sources).
    let sources;
    if (blog_post_id) {
      sources = allPosts.filter((p) => p.id === blog_post_id);
    } else if (topic_cluster_id) {
      sources = allPosts.filter((p) => p.topicClusterId === topic_cluster_id);
    } else if (all_posts) {
      sources = allPosts.filter((p) => p.content && p.content.length > 100);
    } else {
      return Response.json({ error: 'Provide blog_post_id, topic_cluster_id, or all_posts=true.' }, { status: 400 });
    }

    // Existing links to avoid duplicates (any non-rejected link counts).
    const existing = await Links.list('-created_date', 2000);
    const existingPairs = new Set(
      existing.filter((l) => l.status !== 'rejected').map((l) => `${l.sourcePostId}->${l.targetPostId}`)
    );

    const created = [];

    for (const source of sources) {
      if (!source.content || source.content.length < 50) continue;
      const contentLower = (source.content || '').toLowerCase();

      // Rank candidate targets by relevance, applying cluster pillar logic.
      const ranked = targets
        .filter((t) => t.id !== source.id)
        .map((t) => {
          let score = relevance(source, t);
          const sourceIsPillar = source.postType === 'pillar_page';
          const targetIsPillar = t.postType === 'pillar_page';
          // Boost supporting->pillar and pillar->supporting within the same cluster.
          if (source.topicClusterId && source.topicClusterId === t.topicClusterId && (sourceIsPillar !== targetIsPillar)) {
            score += 0.2;
          }
          // Prefer linking newer source -> older target.
          if (new Date(t.created_date) < new Date(source.created_date)) score += 0.05;
          return { target: t, score };
        })
        .filter((r) => r.score >= MIN_RELEVANCE)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_PER_SOURCE);

      for (const { target, score } of ranked) {
        const pairKey = `${source.id}->${target.id}`;
        if (existingPairs.has(pairKey)) continue;

        const anchor = anchorFor(target);
        // Build a short context snippet: a sentence from source mentioning a shared keyword, else the excerpt.
        const sharedWord = [...postKeywords(target)].find((w) => contentLower.includes(w));
        let context = source.excerpt || '';
        if (sharedWord) {
          const sentences = (source.content || '').split(/(?<=[.!?])\s+/);
          const hit = sentences.find((s) => s.toLowerCase().includes(sharedWord));
          if (hit) context = hit.trim().slice(0, 200);
        }

        const rec = await Links.create({
          sourcePostId: source.id,
          targetPostId: target.id,
          anchorText: anchor,
          contextSnippet: context,
          status: 'suggested',
        });
        created.push(rec);
        existingPairs.add(pairKey);
      }
    }

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'internal_link_scan',
      relatedPostId: blog_post_id || undefined,
      status: 'success',
      message: `Generated ${created.length} internal link suggestion(s) across ${sources.length} post(s)`,
      metadata: { created: created.length, sources: sources.length, scope: blog_post_id ? 'post' : topic_cluster_id ? 'cluster' : 'all' },
    });

    return Response.json({ success: true, created: created.length, suggestions: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});