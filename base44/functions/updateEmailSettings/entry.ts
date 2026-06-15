import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Whitelist of fields admins may update. API keys are NEVER accepted here —
// the Resend key lives only in backend secret storage.
const ALLOWED_FIELDS = [
  'resendFromEmail', 'resendFromName', 'resendReplyToEmail', 'resendDomain', 'resendAudienceId',
  'domainVerified', 'spfConfigured', 'dkimConfigured', 'dmarcConfigured', 'trackingConfigured',
  'defaultTimezone', 'requireApprovalBeforeSend', 'enableAiGeneration', 'enableAutoSending',
  'enableWebhookTracking', 'enableClickTracking', 'enableOpenTracking',
  'dailySendLimit', 'hourlySendLimit', 'maxRecipientsPerCampaign', 'maxTestSendsPerHour',
  'pauseAfterBounceCount', 'pauseAfterComplaintCount',
  'requireUnsubscribeLink', 'defaultUnsubscribeFooter', 'includeCompanyAddress',
  'suppressBounced', 'suppressComplained', 'suppressUnsubscribed',
  'defaultFooterText', 'companyName', 'companyAddress',
  'unsubscribeEnabled', 'suppressionEnabled',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = await req.json();
    const input = payload?.settings || {};

    if (typeof input !== 'object' || Array.isArray(input)) {
      return Response.json({ error: 'Invalid settings payload' }, { status: 400 });
    }
    const blocked = Object.keys(input).find((k) =>
      /api[_-]?key|secret|token|password/i.test(k)
    );
    if (blocked) {
      return Response.json({ error: `Field "${blocked}" is not allowed. API keys must be set as backend secrets.` }, { status: 400 });
    }

    const data = {};
    for (const k of ALLOWED_FIELDS) {
      if (k in input) data[k] = input[k];
    }

    const rows = await base44.asServiceRole.entities.EmailSettings.filter({ key: 'global' });
    let record;
    if (rows[0]) {
      record = await base44.asServiceRole.entities.EmailSettings.update(rows[0].id, data);
    } else {
      record = await base44.asServiceRole.entities.EmailSettings.create({ key: 'global', ...data });
    }

    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'settings_updated',
      status: 'success',
      message: `Email settings updated by ${user.email} (${Object.keys(data).length} fields)`,
      metadata: { updatedFields: Object.keys(data) },
    });

    return Response.json({ success: true, settings: record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});