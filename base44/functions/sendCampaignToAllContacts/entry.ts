import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Sends a campaign email to every subscribed contact via Resend.
// Appends an unsubscribe footer, paces requests to respect rate limits, and logs each send.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { subject, html_content, text_content, campaign_id } = await req.json();
    if (!subject) return Response.json({ error: 'Subject is required.' }, { status: 400 });
    if (!html_content && !text_content) {
      return Response.json({ error: 'Email content is required.' }, { status: 400 });
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Resend is not configured. Add the RESEND_API_KEY backend secret first.' }, { status: 400 });
    }

    const settingsRows = await base44.asServiceRole.entities.EmailSettings.filter({ key: 'global' });
    const settings = settingsRows[0];
    if (!settings?.resendFromEmail) {
      return Response.json({ error: 'No from email configured. Set your sending identity in Resend Settings first.' }, { status: 400 });
    }
    const from = settings.resendFromName
      ? `${settings.resendFromName} <${settings.resendFromEmail}>`
      : settings.resendFromEmail;
    const appUrl = Deno.env.get('APP_PUBLIC_URL') || '';

    // Load all subscribed contacts (paginated).
    const contacts = [];
    let skip = 0;
    const pageSize = 200;
    while (true) {
      const page = await base44.asServiceRole.entities.EmailContact.filter({ status: 'subscribed' }, '-created_date', pageSize, skip);
      contacts.push(...page);
      if (page.length < pageSize) break;
      skip += pageSize;
    }

    if (contacts.length === 0) {
      return Response.json({ error: 'No subscribed contacts to send to.' }, { status: 400 });
    }

    let sent = 0;
    let failed = 0;
    const now = () => new Date().toISOString();

    for (const contact of contacts) {
      const unsubUrl = appUrl && contact.unsubscribeToken
        ? `${appUrl}/unsubscribe?token=${contact.unsubscribeToken}`
        : '';
      const footerHtml = unsubUrl
        ? `<div style="text-align:center;color:#64748b;font-size:12px;padding:16px;">You're receiving this because you subscribed. <a href="${unsubUrl}" style="color:#94a3b8;">Unsubscribe</a></div>`
        : '';
      const footerText = unsubUrl ? `\n\nUnsubscribe: ${unsubUrl}` : '';

      const payload = { from, to: [contact.email], subject };
      if (html_content) payload.html = html_content + footerHtml;
      if (text_content) payload.text = text_content + footerText;
      if (settings.resendReplyToEmail) payload.reply_to = settings.resendReplyToEmail;

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const body = await res.json();
        if (res.ok) {
          sent++;
          await base44.asServiceRole.entities.EmailSend.create({
            campaignId: campaign_id || 'broadcast',
            contactId: contact.id,
            recipientEmail: contact.email,
            subject,
            status: 'sent',
            sentAt: now(),
            resendEmailId: body?.id,
          });
        } else {
          failed++;
          await base44.asServiceRole.entities.EmailSend.create({
            campaignId: campaign_id || 'broadcast',
            contactId: contact.id,
            recipientEmail: contact.email,
            subject,
            status: 'failed',
            failedAt: now(),
            failureReason: body?.message || `Resend returned ${res.status}`,
          });
        }
      } catch (e) {
        failed++;
      }

      // Pace requests to stay under Resend rate limits (~2/sec).
      await new Promise((r) => setTimeout(r, 600));
    }

    if (campaign_id) {
      await base44.asServiceRole.entities.EmailCampaign.update(campaign_id, {
        sendStatus: failed === 0 ? 'sent' : 'partially_sent',
        totalRecipients: contacts.length,
        sentAt: now(),
      });
    }

    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'campaign_send',
      status: failed === 0 ? 'success' : 'partial',
      message: `Broadcast "${subject}" sent to ${sent}/${contacts.length} contacts by ${user.email}${failed ? ` (${failed} failed)` : ''}`,
    });

    return Response.json({ success: true, total: contacts.length, sent, failed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});