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

// Editable fields the editor can write. Built-ins and lifecycle metadata excluded.
const FIELDS = [
  'title', 'excerpt', 'content', 'coverImageUrl', 'category', 'categoryId', 'tagIds',
  'author', 'authorBio', 'authorAvatarUrl', 'featuredImageAlt', 'featuredImagePrompt',
  'metaTitle', 'metaDescription', 'canonicalUrl', 'ogTitle', 'ogDescription', 'ogImageUrl',
  'twitterTitle', 'twitterDescription', 'twitterImageUrl', 'postType', 'targetKeyword',
  'secondaryKeywords', 'searchIntent', 'topicClusterId', 'readMinutes', 'order',
  'status', 'approvalStatus', 'scheduledAt', 'revisionNotes',
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
    if (!input.title || !String(input.title).trim()) {
      return Response.json({ error: 'Title is required.' }, { status: 400 });
    }

    const Entity = base44.asServiceRole.entities.BlogPost;
    const base = slugify(input.slug || input.title);
    if (!base) return Response.json({ error: 'Could not derive a slug.' }, { status: 400 });
    const slug = await uniqueSlug(Entity, base, null);

    const data = { slug, status: 'draft', approvalStatus: 'draft' };
    for (const f of FIELDS) if (f in input) data[f] = input[f];
    data.title = String(input.title).trim();

    const text = plainText(data.content);
    const wordCount = text ? text.split(' ').length : 0;
    data.wordCount = wordCount;
    data.contentPlainText = text.slice(0, 5000);
    if (!data.readMinutes) data.readMinutes = Math.max(1, Math.round(wordCount / 200));
    data.published = data.status === 'published';
    data.lastUpdatedAt = new Date().toISOString();
    data.aiModelUsed = data.aiModelUsed || 'manual';

    const record = await Entity.create(data);
    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'post_created', relatedPostId: record.id, status: 'success',
      message: `Post "${record.title}" created manually by ${user.email}`,
      metadata: { slug },
    });
    return Response.json({ success: true, post: record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});