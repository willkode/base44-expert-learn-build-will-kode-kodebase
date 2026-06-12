import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return Response.json({ success: false, configured: false, error: 'RESEND_API_KEY is not set in backend secrets.' });
    }

    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const body = await res.json();

    const rows = await base44.asServiceRole.entities.EmailSettings.filter({ key: 'global' });
    const settingsId = rows[0]?.id;

    if (!res.ok) {
      const errMsg = body?.message || `Resend API returned ${res.status}`;
      if (settingsId) {
        await base44.asServiceRole.entities.EmailSettings.update(settingsId, { lastError: errMsg });
      }
      await base44.asServiceRole.entities.EmailAutomationLog.create({
        eventType: 'resend_connection_test',
        status: 'error',
        message: `Resend connection test failed: ${errMsg}`,
      });
      return Response.json({ success: false, configured: true, error: errMsg });
    }

    const domains = (body?.data || []).map((d) => ({
      name: d.name,
      status: d.status,
      region: d.region,
      records: (d.records || []).map((r) => ({ record: r.record, type: r.type, status: r.status, name: r.name })),
    }));

    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'resend_connection_test',
      status: 'success',
      message: `Resend connection test succeeded (${domains.length} domain${domains.length === 1 ? '' : 's'} found)`,
    });

    return Response.json({ success: true, configured: true, domains });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});