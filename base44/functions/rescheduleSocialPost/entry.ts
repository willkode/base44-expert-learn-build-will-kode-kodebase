import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Moves a single ScheduledPost job to a new time (used by calendar drag-and-drop and the edit dialog).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { scheduled_post_id, scheduled_at, timezone } = await req.json();
    if (!scheduled_post_id) return Response.json({ success: false, error: 'scheduled_post_id is required.' }, { status: 400 });
    if (!scheduled_at) return Response.json({ success: false, error: 'scheduled_at is required.' }, { status: 400 });

    const when = new Date(scheduled_at);
    if (isNaN(when.getTime())) return Response.json({ success: false, error: 'Invalid date.' }, { status: 400 });
    if (when.getTime() <= Date.now()) return Response.json({ success: false, error: 'Cannot reschedule to the past.' }, { status: 400 });

    const job = await base44.asServiceRole.entities.ScheduledPost.get(scheduled_post_id);
    if (!job) return Response.json({ success: false, error: 'Scheduled post not found.' }, { status: 404 });
    if (!['queued', 'failed'].includes(job.status)) {
      return Response.json({ success: false, error: `Cannot reschedule a job that is ${job.status}.` }, { status: 400 });
    }

    const patch = { scheduled_at: when.toISOString(), status: 'queued', next_retry_at: undefined };
    if (timezone) patch.timezone = timezone;
    const updated = await base44.asServiceRole.entities.ScheduledPost.update(scheduled_post_id, patch);

    // Keep the parent post's primary scheduled_at in sync if this is the earliest job.
    if (job.social_post_id) {
      const active = (await base44.asServiceRole.entities.ScheduledPost.filter({ social_post_id: job.social_post_id }))
        .filter((j) => ['queued', 'processing'].includes(j.status))
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
      await base44.asServiceRole.entities.SocialPost.update(job.social_post_id, {
        publishing_status: 'scheduled',
        scheduled_at: active.length ? active[0].scheduled_at : when.toISOString(),
      });
    }

    await base44.asServiceRole.entities.SocialAutomationLog.create({
      account_id: 'global',
      event_type: 'rescheduled',
      related_post_id: job.social_post_id,
      related_scheduled_post_id: scheduled_post_id,
      platform: job.platform,
      status: 'success',
      message: `Rescheduled ${job.platform} job to ${when.toISOString()}.`,
    });

    return Response.json({ success: true, scheduled_post: updated });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});