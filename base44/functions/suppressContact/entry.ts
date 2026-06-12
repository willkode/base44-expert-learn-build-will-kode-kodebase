import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const REASONS = ['unsubscribed', 'bounced', 'complained', 'manually_suppressed', 'invalid', 'blocked_domain'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { contactId, reason = 'manually_suppressed' } = await req.json();
    if (!contactId) return Response.json({ error: 'contactId is required.' }, { status: 400 });
    if (!REASONS.includes(reason)) return Response.json({ error: 'Invalid reason.' }, { status: 400 });

    const contact = await base44.asServiceRole.entities.EmailContact.get(contactId);
    if (!contact) return Response.json({ error: 'Contact not found.' }, { status: 404 });

    await base44.asServiceRole.entities.EmailContact.update(contactId, { status: 'suppressed' });

    const existing = await base44.asServiceRole.entities.EmailSuppression.filter({ email: contact.email });
    if (existing.length === 0) {
      await base44.asServiceRole.entities.EmailSuppression.create({
        email: contact.email, reason, source: 'manual',
      });
    }

    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'contact_suppressed', status: 'success', relatedContactId: contactId,
      message: `Contact ${contact.email} suppressed (${reason}) by ${user.email}`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});