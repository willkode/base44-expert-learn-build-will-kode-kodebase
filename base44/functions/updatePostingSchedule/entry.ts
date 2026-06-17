import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALLOWED = ['name', 'platforms', 'days_of_week', 'posting_times', 'timezone', 'default_campaign_id', 'is_active'];

// Updates an existing posting schedule.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { schedule_id, updates } = body || {};
    if (!schedule_id) return Response.json({ success: false, error: 'schedule_id is required.' }, { status: 400 });

    const existing = await base44.asServiceRole.entities.PostingSchedule.get(schedule_id);
    if (!existing) return Response.json({ success: false, error: 'Schedule not found.' }, { status: 404 });

    const patch = {};
    for (const key of ALLOWED) {
      if (updates && updates[key] !== undefined) patch[key] = updates[key];
    }
    if (patch.name !== undefined && !String(patch.name).trim()) {
      return Response.json({ success: false, error: 'Schedule name cannot be empty.' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.PostingSchedule.update(schedule_id, patch);

    await base44.asServiceRole.entities.SocialAutomationLog.create({
      account_id: 'global',
      event_type: 'posting_schedule_updated',
      status: 'success',
      message: `Updated posting schedule "${updated.name}".`,
      metadata: { schedule_id, changed: Object.keys(patch) },
    });

    return Response.json({ success: true, schedule: updated });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});