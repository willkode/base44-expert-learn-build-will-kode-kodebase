import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_SLUG_LENGTH = 60;

function checkFormat(slug) {
  const errors = [];
  if (!slug || !String(slug).trim()) {
    errors.push('Slug is required.');
    return errors;
  }
  if (slug !== slug.toLowerCase()) errors.push('Slug must be lowercase.');
  if (/\s/.test(slug)) errors.push('Slug cannot contain spaces.');
  if (!/^[a-z0-9-]+$/.test(slug)) errors.push('Slug can only contain letters, numbers, and hyphens.');
  if (/^-|-$/.test(slug)) errors.push('Slug cannot start or end with a hyphen.');
  if (slug.length > MAX_SLUG_LENGTH) errors.push(`Slug should be ${MAX_SLUG_LENGTH} characters or fewer.`);
  return errors;
}

// Validates slug format AND uniqueness within the given entity.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { slug, entity = 'BlogPost', excludeId = null } = await req.json();
    const errors = checkFormat(slug);

    if (errors.length === 0) {
      const Entity = base44.asServiceRole.entities[entity];
      if (!Entity) return Response.json({ error: 'Unknown entity.' }, { status: 400 });
      const matches = await Entity.filter({ slug });
      const conflict = matches.find((m) => m.id !== excludeId);
      if (conflict) errors.push('This slug is already in use. Choose a unique slug.');
    }

    return Response.json({ success: true, valid: errors.length === 0, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});