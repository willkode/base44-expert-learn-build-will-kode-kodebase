import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX = 60;
function slugify(input) {
  let s = (input || '').toString().toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (s.length > MAX) s = s.slice(0, MAX).replace(/-+$/g, '');
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

const FIELDS = ['name', 'description', 'isActive'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { id, ...input } = await req.json();
    if (!id) return Response.json({ error: 'Tag id is required.' }, { status: 400 });
    const Entity = base44.asServiceRole.entities.BlogTag;

    const data = {};
    for (const f of FIELDS) if (f in input) data[f] = input[f];
    if ('name' in data) data.name = String(data.name).trim();
    if (input.slug) data.slug = await uniqueSlug(Entity, slugify(input.slug), id);

    const record = await Entity.update(id, data);
    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'tag_updated', status: 'success',
      message: `Tag "${record.name}" updated by ${user.email}`,
      metadata: { tagId: id, updatedFields: Object.keys(data) },
    });
    return Response.json({ success: true, tag: record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});