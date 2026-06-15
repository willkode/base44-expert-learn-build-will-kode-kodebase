import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Pulls contacts FROM a Resend audience INTO the EmailContact entity so they can
// be used by the email marketing system. New contacts are created; existing ones
// (matched by email) are linked to their Resend id and have unsubscribe status synced.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'RESEND_API_KEY is not set in backend secrets.' }, { status: 400 });
    }

    const settingsRows = await base44.asServiceRole.entities.EmailSettings.filter({ key: 'global' });
    const settings = settingsRows[0] || null;
    const audienceId = settings?.resendAudienceId;
    if (!audienceId) {
      return Response.json({ error: 'No Resend audience is configured. Set a Resend Audience ID in settings first.' }, { status: 400 });
    }

    // Fetch contacts from the Resend audience.
    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const body = await res.json();

    if (!res.ok) {
      const errMsg = body?.message || `Resend API returned ${res.status}`;
      await base44.asServiceRole.entities.EmailAutomationLog.create({
        eventType: 'resend_sync', status: 'error',
        message: `Resend contact import failed: ${errMsg}`,
      });
      return Response.json({ error: errMsg }, { status: 502 });
    }

    const remoteContacts = body?.data || [];
    let created = 0, updated = 0, skipped = 0;

    for (const rc of remoteContacts) {
      const email = (rc?.email || '').trim().toLowerCase();
      if (!email) { skipped++; continue; }

      const isUnsub = !!rc.unsubscribed;
      const existingRows = await base44.asServiceRole.entities.EmailContact.filter({ email });

      if (existingRows.length > 0) {
        const existing = existingRows[0];
        const patch = { resendContactId: rc.id };
        const audIds = Array.isArray(existing.resendAudienceIds) ? existing.resendAudienceIds : [];
        if (!audIds.includes(audienceId)) patch.resendAudienceIds = [...audIds, audienceId];
        // Only flip to unsubscribed from Resend; never silently re-subscribe a local opt-out.
        if (isUnsub && existing.status === 'subscribed') patch.status = 'unsubscribed';
        await base44.asServiceRole.entities.EmailContact.update(existing.id, patch);
        updated++;
      } else {
        await base44.asServiceRole.entities.EmailContact.create({
          email,
          firstName: rc.first_name || '',
          lastName: rc.last_name || '',
          fullName: [rc.first_name, rc.last_name].filter(Boolean).join(' '),
          source: 'resend_import',
          status: isUnsub ? 'unsubscribed' : 'subscribed',
          consentStatus: 'imported',
          consentSource: 'resend_audience',
          consentTimestamp: new Date().toISOString(),
          resendContactId: rc.id,
          resendAudienceIds: [audienceId],
          unsubscribeToken: crypto.randomUUID(),
        });
        created++;
      }
    }

    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'resend_sync', status: 'success',
      message: `Resend contact import by ${user.email}: ${created} created, ${updated} updated, ${skipped} skipped (${remoteContacts.length} total)`,
    });

    return Response.json({ success: true, total: remoteContacts.length, created, updated, skipped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});