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
    const memberSet = new Set(memberships.map((m) => m.contactId));

    const toAdd = [];
    for (const id of contactIds) {
      if (memberSet.has(id)) continue;
      const contact = await base44.asServiceRole.entities.EmailContact.get(id);
      if (contact) toAdd.push({ listId, contactId: id, contactEmail: contact.email });
    }

    if (toAdd.length > 0) {
      await base44.asServiceRole.entities.EmailListMembership.bulkCreate(toAdd);
      await base44.asServiceRole.entities.EmailList.update(listId, {
        contactCount: (list.contactCount || 0) + toAdd.length,
        activeContactCount: (list.activeContactCount || 0) + toAdd.length,
      });
    }

    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'contacts_added_to_list', status: 'success',
      message: `${toAdd.length} contact(s) added to list "${list.name}" by ${user.email}`,
    });

    return Response.json({ success: true, added: toAdd.length, alreadyInList: contactIds.length - toAdd.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});