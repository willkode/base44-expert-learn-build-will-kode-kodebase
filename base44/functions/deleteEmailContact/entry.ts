import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { contactId } = await req.json();
    if (!contactId) return Response.json({ error: 'contactId is required.' }, { status: 400 });

    const contact = await base44.asServiceRole.entities.EmailContact.get(contactId);
    if (!contact) return Response.json({ error: 'Contact not found.' }, { status: 404 });

    // Keep suppression records — deleting a contact must never un-suppress the address
    const memberships = await base44.asServiceRole.entities.EmailListMembership.filter({ contactId }, '-created_date', 1000);
    for (const m of memberships) {
      await base44.asServiceRole.entities.EmailListMembership.delete(m.id);
      const list = await base44.asServiceRole.entities.EmailList.get(m.listId);
      if (list) {
        await base44.asServiceRole.entities.EmailList.update(m.listId, {
          contactCount: Math.max(0, (list.contactCount || 0) - 1),
          activeContactCount: Math.max(0, (list.activeContactCount || 0) - 1),
        });
      }
    }

    await base44.asServiceRole.entities.EmailContact.delete(contactId);

    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'contact_deleted', status: 'success',
      message: `Contact ${contact.email} deleted by ${user.email} (removed from ${memberships.length} list(s))`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});