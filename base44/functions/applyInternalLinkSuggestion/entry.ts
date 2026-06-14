import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only. Inserts a markdown link into the source post's content (if not already present)
// and marks the suggestion as applied.

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { internal_link_id } = await req.json();
    if (!internal_link_id) return Response.json({ error: 'internal_link_id is required' }, { status: 400 });

    const Links = base44.asServiceRole.entities.BlogInternalLink;
    const Posts = base44.asServiceRole.entities.BlogPost;

    const linkRows = await Links.filter({ id: internal_link_id });
    const link = linkRows[0];
    if (!link) return Response.json({ error: 'Suggestion not found' }, { status: 404 });

    const sourceRows = await Posts.filter({ id: link.sourcePostId });
    const targetRows = await Posts.filter({ id: link.targetPostId });
    const source = sourceRows[0];
    const target = targetRows[0];
    if (!source || !target) return Response.json({ error: 'Source or target post missing' }, { status: 404 });
    if (!target.slug) return Response.json({ error: 'Target post has no public slug' }, { status: 400 });

    const anchor = (link.anchorText || target.title || '').trim();
    const href = `/learn/blog/${target.slug}`;
    let content = source.content || '';

    // Already linked to this target? Just mark applied.
    if (content.includes(`(${href})`)) {
      await Links.update(internal_link_id, { status: 'applied' });
      return Response.json({ success: true, alreadyLinked: true, post: source });
    }

    // Try to link the first plain-text occurrence of the anchor (not already inside a link).
    let inserted = false;
    if (anchor) {
      const re = new RegExp(`(?<!\\[)\\b(${escapeRegExp(anchor)})\\b(?!\\]?\\()`, 'i');
      if (re.test(content)) {
        content = content.replace(re, `[$1](${href})`);
        inserted = true;
      }
    }

    // Fallback: append a "Related" reference at the end.
    if (!inserted) {
      const related = `\n\nRelated: [${anchor || target.title}](${href})`;
      content = `${content}${related}`;
    }

    const updatedPost = await Posts.update(link.sourcePostId, { content, lastUpdatedAt: new Date().toISOString() });
    await Links.update(internal_link_id, { status: 'applied' });

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'internal_link_applied',
      relatedPostId: link.sourcePostId,
      status: 'success',
      message: `Applied internal link "${anchor}" -> ${target.slug}`,
      metadata: { targetPostId: link.targetPostId, inserted, appended: !inserted },
    });

    return Response.json({ success: true, inserted, post: updatedPost });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});