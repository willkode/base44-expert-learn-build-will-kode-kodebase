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

const FIELDS = ['name', 'description', 'metaTitle', 'metaDescription', 'displayOrder', 'isActive'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const input = await req.json();
    if (!input.name || !String(input.name).trim()) {
      return Response.json({ error: 'Category name is required.' }, { status: 400 });
    }
    const Entity = base44.asServiceRole.entities.BlogCategory;
    const base = slugify(input.slug || input.name);
    if (!base) return Response.json({ error: 'Could not derive a slug.' }, { status: 400 });
    const slug = await uniqueSlug(Entity, base, null);

    const data = { slug, isActive: true };
    for (const f of FIELDS) if (f in input) data[f] = input[f];
    data.name = String(input.name).trim();

    const record = await Entity.create(data);
    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'category_created', status: 'success',
      message: `Category "${record.name}" created by ${user.email}`,
      metadata: { categoryId: record.id, slug },
    });
    return Response.json({ success: true, category: record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});