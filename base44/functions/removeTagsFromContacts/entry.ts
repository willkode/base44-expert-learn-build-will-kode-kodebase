import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { contactIds, tags } = await req.json();
    if (!Array.isArray(contactIds) || contactIds.length === 0 || !Array.isArray(tags) || tags.length === 0) {
      return Response.json({ error: 'contactIds and tags are required.' }, { status: 400 });
    }

    const removeSet = new Set(tags.map((t) => String(t).trim()).filter(Boolean));
    let updated = 0;
    for (const id of contactIds) {
      const contact = await base44.asServiceRole.entities.EmailContact.get(id);
      if (!contact) continue;
      const remaining = (contact.tags || []).filter((t) => !removeSet.has(t));
      if (remaining.length !== (contact.tags || []).length) {
        await base44.asServiceRole.entities.EmailContact.update(id, { tags: remaining });
        updated++;
      }
    }

    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'tags_removed', status: 'success',
      message: `Tags [${[...removeSet].join(', ')}] removed from ${updated} contact(s) by ${user.email}`,
    });

    return Response.json({ success: true, updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});