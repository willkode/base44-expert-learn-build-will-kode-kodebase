import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_SLUG = 60;
function slugify(input) {
  let s = (input || '').toString().toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (s.length > MAX_SLUG) s = s.slice(0, MAX_SLUG).replace(/-+$/g, '');
  return s;
}
async function uniqueSlug(Entity, base) {
  let slug = base, n = 1;
  while (true) {
    const m = await Entity.filter({ slug });
    if (!m.length) break;
    n += 1; slug = `${base}-${n}`;
  }
  return slug;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await req.json();
    if (!id) return Response.json({ error: 'Post id is required.' }, { status: 400 });

    const Entity = base44.asServiceRole.entities.BlogPost;
    const matches = await Entity.filter({ id });
    if (!matches.length) return Response.json({ error: 'Post not found.' }, { status: 404 });
    const src = matches[0];

    const { id: _id, created_date, updated_date, created_by_id, created_by, is_sample, ...rest } = src;
    const title = `${src.title} (Copy)`;
    const slug = await uniqueSlug(Entity, slugify(title));

    const record = await Entity.create({
      ...rest,
      title,
      slug,
      status: 'draft',
      approvalStatus: 'draft',
      published: false,
      publishedAt: null,
      scheduledAt: null,
      approvedBy: null,
      approvedAt: null,
      lastUpdatedAt: new Date().toISOString(),
    });

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'post_duplicated', relatedPostId: record.id, status: 'success',
      message: `Post "${src.title}" duplicated by ${user.email}`,
      metadata: { sourceId: id, slug },
    });
    return Response.json({ success: true, post: record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});