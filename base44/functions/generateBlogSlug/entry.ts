import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_SLUG_LENGTH = 60;

function slugify(input, maxLength = MAX_SLUG_LENGTH) {
  let s = (input || '')
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (s.length > maxLength) s = s.slice(0, maxLength).replace(/-+$/g, '');
  return s;
}

// Generates a unique slug from a title for a given entity ("BlogPost",
// "BlogCategory", "BlogTag"). Appends -2, -3, ... on collision.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, entity = 'BlogPost', excludeId = null } = await req.json();
    const base = slugify(title);
    if (!base) return Response.json({ error: 'Could not derive a slug from the title.' }, { status: 400 });

    const Entity = base44.asServiceRole.entities[entity];
    if (!Entity) return Response.json({ error: 'Unknown entity.' }, { status: 400 });

    let slug = base;
    let n = 1;
    // Loop until no other record uses the candidate slug.
    while (true) {
      const matches = await Entity.filter({ slug });
      const conflict = matches.find((m) => m.id !== excludeId);
      if (!conflict) break;
      n += 1;
      slug = `${base}-${n}`;
    }

    return Response.json({ success: true, slug });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});