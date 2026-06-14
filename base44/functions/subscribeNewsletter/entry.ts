import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public newsletter subscribe endpoint. No user auth — anyone can subscribe.
// Records the subscriber locally (NewsletterSubscriber + EmailContact) and syncs
// to Resend using the CURRENT model: global Contacts (POST /contacts) with an
// optional Segment assignment. Audiences are deprecated and no longer used here.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const email = String(body.email || '').trim().toLowerCase();
    const firstName = String(body.firstName || '').trim().slice(0, 100);
    const source = String(body.source || 'popup').slice(0, 50);
    if (!EMAIL_RE.test(email)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // 1) Record the lightweight newsletter subscriber (dedupe by email).
    const existingSub = await base44.asServiceRole.entities.NewsletterSubscriber.filter({ email });
    if (existingSub.length === 0) {
      await base44.asServiceRole.entities.NewsletterSubscriber.create({ email, source });
    }

    // 2) Upsert into the marketing EmailContact list (skip if suppressed).
    const suppressed = await base44.asServiceRole.entities.EmailSuppression.filter({ email });
    let contact = (await base44.asServiceRole.entities.EmailContact.filter({ email }))[0] || null;
    if (!contact) {
      contact = await base44.asServiceRole.entities.EmailContact.create({
        email,
        firstName,
        fullName: firstName,
        source,
        status: suppressed.length > 0 ? 'suppressed' : 'subscribed',
        consentStatus: 'opted_in',
        consentSource: source,
        consentTimestamp: new Date().toISOString(),
        unsubscribeToken: crypto.randomUUID(),
      });
    }

    // 3) Sync to Resend Contacts (global) + optional Segment.
    let syncWarning = null;
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const settings = (await base44.asServiceRole.entities.EmailSettings.filter({ key: 'global' }))[0] || {};
    const segmentId = settings.resendSegmentId || '';

    if (apiKey && suppressed.length === 0) {
      try {
        const createRes = await fetch('https://api.resend.com/contacts', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            firstName,
            unsubscribed: false,
            ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
          }),
        });
        const created = await createRes.json();

        if (createRes.ok && created?.id) {
          await base44.asServiceRole.entities.EmailContact.update(contact.id, { resendContactId: created.id });
        } else {
          // Contact may already exist in Resend — fall back to adding to the segment by email.
          if (segmentId) {
            const segRes = await fetch(
              `https://api.resend.com/contacts/${encodeURIComponent(email)}/segments/${segmentId}`,
              { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` } }
            );
            if (!segRes.ok) syncWarning = created?.message || `Resend sync returned ${createRes.status}`;
          } else {
            syncWarning = created?.message || `Resend sync returned ${createRes.status}`;
          }
        }
      } catch (e) {
        syncWarning = e.message;
      }

      if (syncWarning) {
        await base44.asServiceRole.entities.EmailAutomationLog.create({
          eventType: 'resend_sync', status: 'warning', relatedContactId: contact.id,
          message: `Newsletter Resend sync for ${email}: ${syncWarning}`,
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});