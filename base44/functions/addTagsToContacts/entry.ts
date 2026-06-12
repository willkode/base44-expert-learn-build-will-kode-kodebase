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

    const clean = tags.map((t) => String(t).trim()).filter(Boolean);
    let updated = 0;
    for (const id of contactIds) {
      const contact = await base44.asServiceRole.entities.EmailContact.get(id);
      if (!contact) continue;
      const merged = [...new Set([...(contact.tags || []), ...clean])];
      await base44.asServiceRole.entities.EmailContact.update(id, { tags: merged });
      updated++;
    }

    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'tags_added', status: 'success',
      message: `Tags [${clean.join(', ')}] added to ${updated} contact(s) by ${user.email}`,
    });

    return Response.json({ success: true, updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});