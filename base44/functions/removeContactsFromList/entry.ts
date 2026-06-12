import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { listId, contactIds } = await req.json();
    if (!listId || !Array.isArray(contactIds) || contactIds.length === 0) {
      return Response.json({ error: 'listId and contactIds are required.' }, { status: 400 });
    }

    const list = await base44.asServiceRole.entities.EmailList.get(listId);
    if (!list) return Response.json({ error: 'List not found.' }, { status: 404 });

    const memberships = await base44.asServiceRole.entities.EmailListMembership.filter({ listId }, '-created_date', 10000);
    const idsSet = new Set(contactIds);
    const toRemove = memberships.filter((m) => idsSet.has(m.contactId));

    for (const m of toRemove) {
      await base44.asServiceRole.entities.EmailListMembership.delete(m.id);
    }
    if (toRemove.length > 0) {
      await base44.asServiceRole.entities.EmailList.update(listId, {
        contactCount: Math.max(0, (list.contactCount || 0) - toRemove.length),
        activeContactCount: Math.max(0, (list.activeContactCount || 0) - toRemove.length),
      });
    }

    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'contacts_removed_from_list', status: 'success',
      message: `${toRemove.length} contact(s) removed from list "${list.name}" by ${user.email}`,
    });

    return Response.json({ success: true, removed: toRemove.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});