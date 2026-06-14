import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Resend events webhook. Receives email.sent/delivered/opened/clicked/bounced/complained
// events and updates EmailSend, EmailEvent, EmailContact stats, and EmailSettings.
// Called without user auth — authenticity is verified via the Svix signature
// (Resend signs webhooks with Svix; secret starts with 'whsec_').

function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function isValidSvixSignature(secret, id, timestamp, rawBody, signatureHeader) {
  if (!secret || !id || !timestamp || !signatureHeader) return false;
  // Secret is base64 after the 'whsec_' prefix.
  const keyB64 = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  const keyBytes = base64ToBytes(keyB64);
  const enc = new TextEncoder();
  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBytes = await crypto.subtle.sign('HMAC', key, enc.encode(signedContent));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));
  // Header looks like "v1,<sig> v1,<sig2>" — accept if any version matches.
  const candidates = signatureHeader.split(' ').map((s) => s.split(',')[1]);
  return candidates.includes(expected);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const rawBody = await req.text();

    const secret = Deno.env.get('RESEND_WEBHOOK_SECRET');
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');
    const valid = await isValidSvixSignature(secret, svixId, svixTimestamp, rawBody, svixSignature);
    if (!valid) return Response.json({ error: 'Invalid signature' }, { status: 401 });

    const event = JSON.parse(rawBody);
    const type = event?.type; // e.g. 'email.delivered'
    const data = event?.data || {};
    const resendEmailId = data.email_id || data.id;
    const occurredAt = event?.created_at || new Date().toISOString();
    const recipientEmail = Array.isArray(data.to) ? data.to[0] : data.to;

    // Find the matching EmailSend (sent via this app).
    let send = null;
    if (resendEmailId) {
      const sends = await base44.asServiceRole.entities.EmailSend.filter({ resendEmailId });
      send = sends[0] || null;
    }

    // Record the raw event for the timeline / analytics.
    await base44.asServiceRole.entities.EmailEvent.create({
      emailSendId: send?.id || undefined,
      resendEmailId: resendEmailId || undefined,
      eventType: type,
      recipientEmail: recipientEmail || undefined,
      campaignId: send?.campaignId || undefined,
      sequenceId: send?.sequenceId || undefined,
      contactId: send?.contactId || undefined,
      url: data.click?.link || undefined,
      rawPayload: event,
      occurredAt,
    });

    // Map event type to EmailSend status + timestamp updates.
    if (send) {
      const updates = {};
      switch (type) {
        case 'email.delivered':
          updates.status = 'delivered'; updates.deliveredAt = occurredAt; break;
        case 'email.opened':
          updates.status = 'opened'; updates.openedAt = send.openedAt || occurredAt;
          updates.openCount = (send.openCount || 0) + 1; break;
        case 'email.clicked':
          updates.status = 'clicked'; updates.clickedAt = send.clickedAt || occurredAt;
          updates.clickCount = (send.clickCount || 0) + 1;
          if (data.click?.link) updates.lastClickedUrl = data.click.link; break;
        case 'email.bounced':
          updates.status = 'bounced'; updates.bouncedAt = occurredAt;
          updates.failureReason = data.bounce?.message || 'Bounced'; break;
        case 'email.complained':
          updates.status = 'complained'; updates.complainedAt = occurredAt; break;
        default: break;
      }
      if (Object.keys(updates).length > 0) {
        await base44.asServiceRole.entities.EmailSend.update(send.id, updates);
      }
    }

    // Update contact engagement stats + suppression on bounce/complaint.
    if (recipientEmail) {
      const contacts = await base44.asServiceRole.entities.EmailContact.filter({ email: recipientEmail.toLowerCase() });
      const contact = contacts[0];
      if (contact) {
        const c = {};
        if (type === 'email.opened') {
          c.totalOpens = (contact.totalOpens || 0) + 1; c.lastOpenedAt = occurredAt;
        } else if (type === 'email.clicked') {
          c.totalClicks = (contact.totalClicks || 0) + 1; c.lastClickedAt = occurredAt;
        } else if (type === 'email.bounced') {
          c.status = 'bounced';
        } else if (type === 'email.complained') {
          c.status = 'complained';
        }
        if (Object.keys(c).length > 0) {
          await base44.asServiceRole.entities.EmailContact.update(contact.id, c);
        }
      }

      // Add to suppression list on hard bounce / complaint.
      if (type === 'email.bounced' || type === 'email.complained') {
        const reason = type === 'email.bounced' ? 'bounced' : 'complained';
        const existing = await base44.asServiceRole.entities.EmailSuppression.filter({ email: recipientEmail.toLowerCase() });
        if (existing.length === 0) {
          await base44.asServiceRole.entities.EmailSuppression.create({
            email: recipientEmail.toLowerCase(),
            reason,
            source: 'webhook',
            relatedCampaignId: send?.campaignId || undefined,
            relatedEmailSendId: send?.id || undefined,
          });
        }
      }
    }

    // Keep settings status in sync — confirms the webhook is live.
    const rows = await base44.asServiceRole.entities.EmailSettings.filter({ key: 'global' });
    if (rows[0]) {
      await base44.asServiceRole.entities.EmailSettings.update(rows[0].id, {
        webhookConfigured: true,
        lastWebhookReceivedAt: occurredAt,
      });
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});