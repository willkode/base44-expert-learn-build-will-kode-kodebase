import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Deletes a posting schedule.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { schedule_id } = await req.json();
    if (!schedule_id) return Response.json({ success: false, error: 'schedule_id is required.' }, { status: 400 });

    const existing = await base44.asServiceRole.entities.PostingSchedule.get(schedule_id);
    if (!existing) return Response.json({ success: false, error: 'Schedule not found.' }, { status: 404 });

    await base44.asServiceRole.entities.PostingSchedule.delete(schedule_id);

    await base44.asServiceRole.entities.SocialAutomationLog.create({
      account_id: 'global',
      event_type: 'posting_schedule_deleted',
      status: 'success',
      message: `Deleted posting schedule "${existing.name}".`,
      metadata: { schedule_id },
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});