import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALLOWED = ['firstName', 'lastName', 'company', 'phone', 'tags', 'source', 'consentStatus', 'consentSource', 'customFields'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { contactId, updates } = await req.json();
    if (!contactId || !updates) return Response.json({ error: 'contactId and updates are required.' }, { status: 400 });

    const contact = await base44.asServiceRole.entities.EmailContact.get(contactId);
    if (!contact) return Response.json({ error: 'Contact not found.' }, { status: 404 });

    const data = {};
    for (const k of ALLOWED) if (k in updates) data[k] = updates[k];
    if ('firstName' in data || 'lastName' in data) {
      data.fullName = [data.firstName ?? contact.firstName, data.lastName ?? contact.lastName].filter(Boolean).join(' ');
    }

    const record = await base44.asServiceRole.entities.EmailContact.update(contactId, data);

    // Resend sync (non-blocking)
    let syncWarning = null;
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const settingsRows = await base44.asServiceRole.entities.EmailSettings.filter({ key: 'global' });
    const audienceId = settingsRows[0]?.resendAudienceId;
    if (apiKey && audienceId && contact.resendContactId && ('firstName' in data || 'lastName' in data)) {
      try {
        const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts/${contact.resendContactId}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ first_name: record.firstName, last_name: record.lastName }),
        });
        if (!res.ok) syncWarning = `Resend sync returned ${res.status}`;
      } catch (e) {
        syncWarning = e.message;
      }
      if (syncWarning) {
        await base44.asServiceRole.entities.EmailAutomationLog.create({
          eventType: 'resend_sync', status: 'warning', relatedContactId: contactId,
          message: `Resend update sync failed for ${contact.email}: ${syncWarning}`,
        });
      }
    }

    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'contact_updated', status: 'success', relatedContactId: contactId,
      message: `Contact ${contact.email} updated by ${user.email}`,
    });

    return Response.json({ success: true, contact: record, syncWarning });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});