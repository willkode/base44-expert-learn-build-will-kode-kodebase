import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const apiKeyConfigured = !!Deno.env.get('RESEND_API_KEY');
    const rows = await base44.asServiceRole.entities.EmailSettings.filter({ key: 'global' });
    const settings = rows[0] || null;

    // Keep the stored status flag in sync (status only, never the key)
    if (settings && settings.resendApiKeyConfigured !== apiKeyConfigured) {
      await base44.asServiceRole.entities.EmailSettings.update(settings.id, {
        resendApiKeyConfigured: apiKeyConfigured,
      });
    }

    const fromEmailConfigured = !!(settings && settings.resendFromEmail);

    return Response.json({
      apiKeyConfigured,
      fromEmailConfigured,
      sendingEnabled: apiKeyConfigured && fromEmailConfigured,
      webhookConfigured: !!(settings && settings.webhookConfigured),
      lastSuccessfulSendAt: settings?.lastSuccessfulSendAt || null,
      lastWebhookReceivedAt: settings?.lastWebhookReceivedAt || null,
      lastError: settings?.lastError || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});