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

    await base44.asServiceRole.entities.EmailContact.update(contactId, { status: 'unsubscribed' });

    const existing = await base44.asServiceRole.entities.EmailSuppression.filter({ email: contact.email });
    if (existing.length === 0) {
      await base44.asServiceRole.entities.EmailSuppression.create({
        email: contact.email, reason: 'unsubscribed', source: 'manual',
      });
    }

    // Resend sync (non-blocking)
    let syncWarning = null;
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const settingsRows = await base44.asServiceRole.entities.EmailSettings.filter({ key: 'global' });
    const audienceId = settingsRows[0]?.resendAudienceId;
    if (apiKey && audienceId && contact.resendContactId) {
      try {
        const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts/${contact.resendContactId}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ unsubscribed: true }),
        });
        if (!res.ok) syncWarning = `Resend sync returned ${res.status}`;
      } catch (e) {
        syncWarning = e.message;
      }
      if (syncWarning) {
        await base44.asServiceRole.entities.EmailAutomationLog.create({
          eventType: 'resend_sync', status: 'warning', relatedContactId: contactId,
          message: `Resend unsubscribe sync failed for ${contact.email}: ${syncWarning}`,
        });
      }
    }

    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'contact_unsubscribed', status: 'success', relatedContactId: contactId,
      message: `Contact ${contact.email} unsubscribed by ${user.email}`,
    });

    return Response.json({ success: true, syncWarning });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});