import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALLOWED_KEYS = [
  "systemEnabled", "defaultTimezone", "defaultApprovalRequired", "defaultPostingFrequencyLimit",
  "enableAiGeneration", "enableImageGeneration", "enableAutoPosting", "enableAnalyticsSync",
  "platforms", "facebook", "instagram", "ai", "safety", "notifications", "limits",
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Only admins can edit global social settings.' }, { status: 403 });

    const body = await req.json();
    const updates = body?.settings || {};

    // Whitelist top-level keys only.
    const clean = {};
    for (const k of ALLOWED_KEYS) {
      if (updates[k] !== undefined) clean[k] = updates[k];
    }

    const existing = await base44.asServiceRole.entities.SocialSettings.filter({ key: 'global' }, '-created_date', 1);
    let saved;
    if (existing && existing[0]) {
      saved = await base44.asServiceRole.entities.SocialSettings.update(existing[0].id, clean);
    } else {
      saved = await base44.asServiceRole.entities.SocialSettings.create({ key: 'global', ...clean });
    }

    await base44.asServiceRole.entities.SocialAutomationLog.create({
      account_id: 'global',
      user_id: user.id,
      event_type: 'settings_updated',
      status: 'success',
      message: `Social marketing settings updated by ${user.email}.`,
      metadata: { keys: Object.keys(clean) },
    }).catch(() => {});

    return Response.json({ success: true, settings: saved });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});