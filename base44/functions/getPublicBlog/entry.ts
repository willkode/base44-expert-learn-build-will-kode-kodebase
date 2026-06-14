import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// PUBLIC, read-only endpoint for the public-facing blog.
// Returns ONLY genuinely published posts, with admin-only fields stripped.
// This is the security boundary: the BlogPost entity itself is admin-read-only,
// so drafts / scheduled / needs_review / approved / rejected / archived / failed
// posts can never reach a public visitor through the SDK.

// Legacy posts may have no `status` but a boolean `published` flag.
function isPublished(p) {
  if (!p) return false;
  if (p.status) return p.status === 'published';
  return p.published === true;
}

// Public-safe projection — never expose drafts' internal/workflow fields.
function toPublic(p) {
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    coverImageUrl: p.coverImageUrl,
    category: p.category,
    tags: p.tags || [],
    author: p.author,
    authorBio: p.authorBio,
    authorAvatarUrl: p.authorAvatarUrl,
    featuredImageAlt: p.featuredImageAlt,
    readMinutes: p.readMinutes,
    publishedAt: p.publishedAt,
    lastUpdatedAt: p.lastUpdatedAt,
    created_date: p.created_date,
    updated_date: p.updated_date,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    canonicalUrl: p.canonicalUrl,
    ogTitle: p.ogTitle,
    ogDescription: p.ogDescription,
    ogImageUrl: p.ogImageUrl,
    twitterTitle: p.twitterTitle,
    twitterDescription: p.twitterDescription,
    twitterImageUrl: p.twitterImageUrl,
  };
}

// Public subset of blog settings used by the public reader (display toggles only).
function publicSettings(s) {
  if (!s) return {};
  return {
    blogEnabled: s.blogEnabled !== false,
    blogName: s.blogName,
    defaultAuthorName: s.defaultAuthorName,
    showAuthorBox: s.showAuthorBox !== false,
    showRelatedPosts: s.showRelatedPosts !== false,
    showTableOfContents: !!s.showTableOfContents,
  };
}

function sortByPublished(a, b) {
  const da = new Date(a.publishedAt || a.created_date || 0).getTime();
  const db = new Date(b.publishedAt || b.created_date || 0).getTime();
  return db - da;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { mode = 'list', slug = '', limit = 500 } = body;

    let settings = {};
    try {
      const rows = await base44.asServiceRole.entities.BlogSettings.filter({ key: 'global' });
      settings = publicSettings(rows[0]);
    } catch (_e) {
      settings = {};
    }

    // Single post by slug.
    if (mode === 'post') {
      if (!slug) return Response.json({ success: false, error: 'slug is required' }, { status: 400 });
      const rows = await base44.asServiceRole.entities.BlogPost.filter({ slug }, '', 1);
      const found = rows[0];
      if (!isPublished(found)) {
        return Response.json({ success: true, post: null, settings });
      }
      return Response.json({ success: true, post: toPublic(found), settings });
    }

    // List / taxonomy — pull a generous page and filter to published.
    const all = await base44.asServiceRole.entities.BlogPost.list('-publishedAt', Math.min(limit, 1000));
    let published = all.filter(isPublished).map(toPublic).sort(sortByPublished);

    if (mode === 'related') {
      const exclude = slug;
      published = published.filter((p) => p.slug !== exclude).slice(0, 6);
    }

    return Response.json({ success: true, posts: published, settings });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});