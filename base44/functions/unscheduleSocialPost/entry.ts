import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Cancels scheduled jobs for a post (optionally a single job). Updates the post's publishing_status.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { social_post_id, scheduled_post_id } = await req.json();
    if (!social_post_id) return Response.json({ success: false, error: 'social_post_id is required.' }, { status: 400 });

    const jobs = await base44.asServiceRole.entities.ScheduledPost.filter({ social_post_id });
    const targets = scheduled_post_id ? jobs.filter((j) => j.id === scheduled_post_id) : jobs;

    let canceled = 0;
    for (const j of targets) {
      if (['queued', 'processing'].includes(j.status)) {
        await base44.asServiceRole.entities.ScheduledPost.update(j.id, { status: 'canceled' });
        canceled++;
      }
    }

    // Recompute the post's publishing status from remaining active jobs.
    const remaining = (await base44.asServiceRole.entities.ScheduledPost.filter({ social_post_id }))
      .filter((j) => ['queued', 'processing'].includes(j.status));
    const post = await base44.asServiceRole.entities.SocialPost.get(social_post_id);
    if (post) {
      await base44.asServiceRole.entities.SocialPost.update(social_post_id, {
        publishing_status: remaining.length > 0 ? 'scheduled' : 'unscheduled',
        scheduled_at: remaining.length > 0 ? remaining[0].scheduled_at : undefined,
      });
    }

    await base44.asServiceRole.entities.SocialAutomationLog.create({
      account_id: 'global',
      event_type: 'unscheduled',
      related_post_id: social_post_id,
      status: 'success',
      message: `Canceled ${canceled} scheduled job(s).`,
      metadata: { scheduled_post_id: scheduled_post_id || null },
    });

    return Response.json({ success: true, canceled });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});