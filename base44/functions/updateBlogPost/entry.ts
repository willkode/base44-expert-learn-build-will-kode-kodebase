import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_SLUG = 60;
function slugify(input) {
  let s = (input || '').toString().toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (s.length > MAX_SLUG) s = s.slice(0, MAX_SLUG).replace(/-+$/g, '');
  return s;
}
async function uniqueSlug(Entity, base, excludeId) {
  let slug = base, n = 1;
  while (true) {
    const m = await Entity.filter({ slug });
    if (!m.find((r) => r.id !== excludeId)) break;
    n += 1; slug = `${base}-${n}`;
  }
  return slug;
}

const FIELDS = [
  'title', 'excerpt', 'content', 'coverImageUrl', 'category', 'categoryId', 'tagIds',
  'author', 'authorBio', 'authorAvatarUrl', 'featuredImageAlt', 'featuredImagePrompt',
  'metaTitle', 'metaDescription', 'canonicalUrl', 'ogTitle', 'ogDescription', 'ogImageUrl',
  'twitterTitle', 'twitterDescription', 'twitterImageUrl', 'postType', 'targetKeyword',
  'secondaryKeywords', 'searchIntent', 'topicClusterId', 'readMinutes', 'order',
  'status', 'approvalStatus', 'scheduledAt', 'revisionNotes', 'publishedAt',
];

function plainText(md) {
  return (md || '').replace(/[#>*_`~\-]+/g, ' ').replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/\s+/g, ' ').trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const input = await req.json();
    if (!input.id) return Response.json({ error: 'Post id is required.' }, { status: 400 });

    const Entity = base44.asServiceRole.entities.BlogPost;
    const existing = await Entity.filter({ id: input.id });
    if (!existing.length) return Response.json({ error: 'Post not found.' }, { status: 404 });

    const data = {};
    for (const f of FIELDS) if (f in input) data[f] = input[f];

    // Handle slug change (re-validate uniqueness, excluding this post).
    if ('slug' in input) {
      const base = slugify(input.slug);
      if (!base) return Response.json({ error: 'Could not derive a slug.' }, { status: 400 });
      data.slug = await uniqueSlug(Entity, base, input.id);
    }

    if ('content' in input) {
      const text = plainText(input.content);
      const wordCount = text ? text.split(' ').length : 0;
      data.wordCount = wordCount;
      data.contentPlainText = text.slice(0, 5000);
      if (input.readMinutes == null) data.readMinutes = Math.max(1, Math.round(wordCount / 200));
    }
    if ('status' in input) data.published = input.status === 'published';
    data.lastUpdatedAt = new Date().toISOString();

    const record = await Entity.update(input.id, data);
    return Response.json({ success: true, post: record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});