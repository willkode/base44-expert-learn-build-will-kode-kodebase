import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { recipient_email, subject, html_content, text_content } = await req.json();

    if (!recipient_email || !EMAIL_RE.test(recipient_email)) {
      return Response.json({ error: 'A valid recipient email is required.' }, { status: 400 });
    }
    if (!subject) {
      return Response.json({ error: 'Subject is required.' }, { status: 400 });
    }
    if (!html_content && !text_content) {
      return Response.json({ error: 'Email content is required.' }, { status: 400 });
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Resend is not configured. Add the RESEND_API_KEY backend secret first.' }, { status: 400 });
    }

    const rows = await base44.asServiceRole.entities.EmailSettings.filter({ key: 'global' });
    const settings = rows[0];
    if (!settings?.resendFromEmail) {
      return Response.json({ error: 'No from email configured. Set your sending identity in Resend Settings first.' }, { status: 400 });
    }

    // Rate limit test sends per hour
    const maxPerHour = settings.maxTestSendsPerHour || 10;
    const recentTests = await base44.asServiceRole.entities.EmailSend.filter({ campaignId: 'test' }, '-created_date', maxPerHour);
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentCount = recentTests.filter((s) => new Date(s.created_date).getTime() > oneHourAgo).length;
    if (recentCount >= maxPerHour) {
      return Response.json({ error: `Test send limit reached (${maxPerHour}/hour). Try again later.` }, { status: 429 });
    }

    const from = settings.resendFromName
      ? `${settings.resendFromName} <${settings.resendFromEmail}>`
      : settings.resendFromEmail;

    const payload = {
      from,
      to: [recipient_email],
      subject: `[TEST] ${subject}`,
    };
    if (html_content) payload.html = html_content;
    if (text_content) payload.text = text_content;
    if (settings.resendReplyToEmail) payload.reply_to = settings.resendReplyToEmail;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    const now = new Date().toISOString();

    if (!res.ok) {
      const errMsg = body?.message || `Resend API returned ${res.status}`;
      await base44.asServiceRole.entities.EmailSend.create({
        campaignId: 'test',
        contactId: 'test',
        recipientEmail: recipient_email,
        subject: payload.subject,
        status: 'failed',
        failedAt: now,
        failureReason: errMsg,
        metadata: { isTest: true, sentBy: user.email },
      });
      await base44.asServiceRole.entities.EmailSettings.update(settings.id, { lastError: errMsg });
      await base44.asServiceRole.entities.EmailAutomationLog.create({
        eventType: 'test_send',
        status: 'error',
        message: `Test email to ${recipient_email} failed: ${errMsg}`,
      });
      return Response.json({ success: false, error: errMsg });
    }

    await base44.asServiceRole.entities.EmailSend.create({
      campaignId: 'test',
      contactId: 'test',
      recipientEmail: recipient_email,
      subject: payload.subject,
      status: 'sent',
      sentAt: now,
      resendEmailId: body?.id,
      metadata: { isTest: true, sentBy: user.email },
    });
    await base44.asServiceRole.entities.EmailSettings.update(settings.id, {
      lastSuccessfulSendAt: now,
      lastError: '',
    });
    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'test_send',
      status: 'success',
      message: `Test email sent to ${recipient_email} by ${user.email}`,
    });

    return Response.json({ success: true, resendEmailId: body?.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});