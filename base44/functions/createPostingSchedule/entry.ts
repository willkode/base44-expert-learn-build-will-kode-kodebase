import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Creates a default posting schedule (recurring slots) for the workspace.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { name, platforms, days_of_week, posting_times, timezone, default_campaign_id, is_active } = body || {};

    if (!name || !name.trim()) return Response.json({ success: false, error: 'Schedule name is required.' }, { status: 400 });
    if (!Array.isArray(platforms) || platforms.length === 0) return Response.json({ success: false, error: 'Select at least one platform.' }, { status: 400 });
    if (!Array.isArray(days_of_week) || days_of_week.length === 0) return Response.json({ success: false, error: 'Select at least one day of week.' }, { status: 400 });
    if (!Array.isArray(posting_times) || posting_times.length === 0) return Response.json({ success: false, error: 'Add at least one posting time.' }, { status: 400 });

    const created = await base44.asServiceRole.entities.PostingSchedule.create({
      account_id: 'global',
      user_id: user.id,
      name: name.trim(),
      platforms,
      days_of_week,
      posting_times,
      timezone: timezone || 'America/Chicago',
      default_campaign_id: default_campaign_id || undefined,
      is_active: is_active !== false,
      created_by: user.email,
    });

    await base44.asServiceRole.entities.SocialAutomationLog.create({
      account_id: 'global',
      event_type: 'posting_schedule_created',
      status: 'success',
      message: `Created posting schedule "${created.name}".`,
      metadata: { schedule_id: created.id, platforms, days_of_week, posting_times },
    });

    return Response.json({ success: true, schedule: created });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});