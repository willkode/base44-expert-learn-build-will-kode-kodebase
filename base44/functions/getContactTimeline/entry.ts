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

    const [sends, events, memberships, suppressions, logs] = await Promise.all([
      base44.asServiceRole.entities.EmailSend.filter({ contactId }, '-created_date', 200),
      base44.asServiceRole.entities.EmailEvent.filter({ contactId }, '-created_date', 200),
      base44.asServiceRole.entities.EmailListMembership.filter({ contactId }, '-created_date', 100),
      base44.asServiceRole.entities.EmailSuppression.filter({ email: contact.email }),
      base44.asServiceRole.entities.EmailAutomationLog.filter({ relatedContactId: contactId }, '-created_date', 100),
    ]);

    const lists = [];
    for (const m of memberships) {
      const list = await base44.asServiceRole.entities.EmailList.get(m.listId);
      if (list) lists.push({ id: list.id, name: list.name });
    }

    const timeline = [
      ...sends.map((s) => ({ type: 'send', date: s.sentAt || s.created_date, title: `Email ${s.status}: ${s.subject || '(no subject)'}`, status: s.status })),
      ...events.map((e) => ({ type: 'event', date: e.occurredAt || e.created_date, title: e.eventType + (e.url ? ` — ${e.url}` : ''), status: e.eventType })),
      ...logs.map((l) => ({ type: 'log', date: l.created_date, title: l.message, status: l.status })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return Response.json({
      contact,
      lists,
      suppression: suppressions[0] || null,
      sends,
      timeline,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});