import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { contact } = await req.json();
    const email = (contact?.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return Response.json({ error: 'A valid email is required.' }, { status: 400 });

    const existing = await base44.asServiceRole.entities.EmailContact.filter({ email });
    if (existing.length > 0) return Response.json({ error: 'A contact with this email already exists.', contactId: existing[0].id }, { status: 409 });

    const suppressed = await base44.asServiceRole.entities.EmailSuppression.filter({ email });

    const data = {
      email,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      fullName: [contact.firstName, contact.lastName].filter(Boolean).join(' '),
      company: contact.company || '',
      phone: contact.phone || '',
      source: contact.source || 'manual',
      tags: Array.isArray(contact.tags) ? contact.tags : [],
      customFields: contact.customFields || {},
      status: suppressed.length > 0 ? 'suppressed' : 'subscribed',
      consentStatus: contact.consentStatus || 'manually_added',
      consentSource: contact.consentSource || '',
      consentTimestamp: new Date().toISOString(),
      unsubscribeToken: crypto.randomUUID(),
    };

    const record = await base44.asServiceRole.entities.EmailContact.create(data);

    // Resend audience sync (non-blocking)
    let syncWarning = null;
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const settingsRows = await base44.asServiceRole.entities.EmailSettings.filter({ key: 'global' });
    const audienceId = settingsRows[0]?.resendAudienceId;
    if (apiKey && audienceId && data.status === 'subscribed') {
      try {
        const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, first_name: data.firstName, last_name: data.lastName, unsubscribed: false }),
        });
        const body = await res.json();
        if (res.ok && body?.id) {
          await base44.asServiceRole.entities.EmailContact.update(record.id, { resendContactId: body.id, resendAudienceIds: [audienceId] });
        } else {
          syncWarning = body?.message || `Resend sync returned ${res.status}`;
        }
      } catch (e) {
        syncWarning = e.message;
      }
      if (syncWarning) {
        await base44.asServiceRole.entities.EmailAutomationLog.create({
          eventType: 'resend_sync', status: 'warning', relatedContactId: record.id,
          message: `Resend sync failed for ${email}: ${syncWarning}`,
        });
      }
    }

    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'contact_created', status: 'success', relatedContactId: record.id,
      message: `Contact ${email} created by ${user.email}`,
    });

    return Response.json({ success: true, contact: record, syncWarning });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});