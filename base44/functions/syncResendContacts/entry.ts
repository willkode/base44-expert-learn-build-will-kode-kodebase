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

    // Fetch ALL contacts from the Resend audience, paginating until exhausted.
    // Resend caps each response, so a single request won't return large audiences.
    const remoteContacts = [];
    const seenIds = new Set();
    let after = null;
    let lastErr = null;

    // Hard cap on pages to avoid runaway loops; 100 pages covers very large audiences.
    for (let page = 0; page < 100; page++) {
      const url = new URL(`https://api.resend.com/audiences/${audienceId}/contacts`);
      url.searchParams.set('limit', '100');
      if (after) url.searchParams.set('after', after);

      let res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      // Respect Resend's rate limit: back off and retry once on 429.
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 1200));
        res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
      }
      const body = await res.json();

      if (!res.ok) {
        lastErr = body?.message || `Resend API returned ${res.status}`;
        break;
      }

      // Gentle pacing between page fetches to stay under Resend's rate limit.
      await new Promise((r) => setTimeout(r, 600));

      const pageContacts = body?.data || [];
      let addedThisPage = 0;
      for (const rc of pageContacts) {
        if (rc?.id && seenIds.has(rc.id)) continue;
        if (rc?.id) seenIds.add(rc.id);
        remoteContacts.push(rc);
        addedThisPage++;
      }

      // Resolve the cursor for the next page from common Resend response shapes.
      const nextCursor =
        body?.next_page_token || body?.next || body?.pagination?.next ||
        (pageContacts.length > 0 ? pageContacts[pageContacts.length - 1]?.id : null);

      // Stop when the page wasn't full, nothing new was added, or no cursor advanced.
      if (pageContacts.length < 100 || addedThisPage === 0 || !nextCursor || nextCursor === after) break;
      after = nextCursor;
    }

    // If the very first request failed (no contacts fetched), surface the error.
    if (lastErr && remoteContacts.length === 0) {
      await base44.asServiceRole.entities.EmailAutomationLog.create({
        eventType: 'resend_sync', status: 'error',
        message: `Resend contact import failed: ${lastErr}`,
      });
      return Response.json({ error: lastErr }, { status: 502 });
    }

    // Load ALL existing contacts ONCE into an email->record map, instead of
    // querying Resend audience contacts one-by-one (which trips the rate limiter).
    const existingByEmail = new Map();
    for (let p = 0; p < 200; p++) {
      const rows = await base44.asServiceRole.entities.EmailContact.list('-created_date', 200, p * 200);
      for (const row of rows) {
        const e = (row?.email || '').trim().toLowerCase();
        if (e && !existingByEmail.has(e)) existingByEmail.set(e, row);
      }
      if (rows.length < 200) break;
    }

    let created = 0, updated = 0, skipped = 0;

    for (const rc of remoteContacts) {
      const email = (rc?.email || '').trim().toLowerCase();
      if (!email) { skipped++; continue; }

      const isUnsub = !!rc.unsubscribed;
      const existing = existingByEmail.get(email);

      if (existing) {
        const patch = {};
        if (existing.resendContactId !== rc.id) patch.resendContactId = rc.id;
        const audIds = Array.isArray(existing.resendAudienceIds) ? existing.resendAudienceIds : [];
        if (!audIds.includes(audienceId)) patch.resendAudienceIds = [...audIds, audienceId];
        // Only flip to unsubscribed from Resend; never silently re-subscribe a local opt-out.
        if (isUnsub && existing.status === 'subscribed') patch.status = 'unsubscribed';
        // Skip the write entirely if nothing actually changed — saves API calls.
        if (Object.keys(patch).length === 0) { skipped++; continue; }
        await base44.asServiceRole.entities.EmailContact.update(existing.id, patch);
        updated++;
      } else {
        const newRow = await base44.asServiceRole.entities.EmailContact.create({
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
        existingByEmail.set(email, newRow);
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