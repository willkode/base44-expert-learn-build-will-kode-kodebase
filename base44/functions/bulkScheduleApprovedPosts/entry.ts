import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const RECOMMENDED = {
  twitter: ['09:00', '12:00', '17:00'],
  reddit: ['08:00', '20:00'],
  linkedin: ['08:00', '12:00'],
  facebook: ['11:00', '15:00'],
  instagram: ['11:00', '19:00'],
};

function generateSlots({ platform, schedule, fromDate, toDate }) {
  const slots = [];
  const times = (schedule && schedule.posting_times && schedule.posting_times.length)
    ? schedule.posting_times
    : (RECOMMENDED[platform] || ['09:00']);
  const allowedDays = schedule && schedule.days_of_week && schedule.days_of_week.length ? schedule.days_of_week : [0, 1, 2, 3, 4, 5, 6];

  const cursor = new Date(fromDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(toDate);
  while (cursor <= end) {
    if (allowedDays.includes(cursor.getDay())) {
      for (const t of times) {
        const [h, m] = t.split(':').map(Number);
        const slot = new Date(cursor);
        slot.setHours(h, m || 0, 0, 0);
        if (slot.getTime() > Date.now()) slots.push(slot);
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return slots.sort((a, b) => a - b);
}

function defaultAccountFor(platform, accounts) {
  return accounts.find((a) => a.platform === platform && a.connection_status === 'connected') || null;
}

function validatePlatform(platform, post, account) {
  if (!account) return `${platform}: no connected account.`;
  if (platform === 'facebook' && !(account.selected_default_facebook_page_id || account.facebook_page_id)) return 'facebook: no connected Page.';
  if (platform === 'instagram') {
    const igId = account.selected_default_instagram_account_id || account.instagram_business_account_id;
    if (!igId) return 'instagram: no professional account.';
    const v = post.platform_variants || {};
    if (!((v.instagram_media_urls && v.instagram_media_urls.length) || post.image_url)) return 'instagram: missing media.';
  }
  return null;
}

// Auto-fills the calendar by spreading approved posts into available slots, avoiding same-time platform clashes.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { post_ids, campaign_id, schedule_id, start_date, end_date, timezone, mode = 'spread' } = body || {};

    const start = start_date ? new Date(start_date) : new Date();
    const end = end_date ? new Date(end_date) : new Date(Date.now() + 30 * 86400000);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return Response.json({ success: false, error: 'Invalid date range.' }, { status: 400 });
    }

    // Resolve target posts: explicit ids, or all approved/unscheduled posts (optionally by campaign).
    let posts = [];
    if (Array.isArray(post_ids) && post_ids.length) {
      for (const id of post_ids) {
        const p = await base44.asServiceRole.entities.SocialPost.get(id);
        if (p) posts.push(p);
      }
    } else {
      const filter = { approval_status: 'approved' };
      if (campaign_id) filter.campaign_id = campaign_id;
      posts = await base44.asServiceRole.entities.SocialPost.filter(filter, '-created_date', 200);
    }
    posts = posts.filter((p) => p.approval_status === 'approved' && p.publishing_status !== 'scheduled' && p.publishing_status !== 'published');
    if (posts.length === 0) return Response.json({ success: false, error: 'No eligible approved, unscheduled posts found.' }, { status: 400 });

    let schedule = null;
    if (schedule_id) schedule = await base44.asServiceRole.entities.PostingSchedule.get(schedule_id);

    const accounts = await base44.asServiceRole.entities.SocialAccount.list('-created_date', 200);

    // Track taken times per platform to avoid duplicate platform posting at the same time.
    const existing = (await base44.asServiceRole.entities.ScheduledPost.list('-scheduled_at', 1000))
      .filter((j) => ['queued', 'processing'].includes(j.status));
    const takenByPlatform = {};
    for (const j of existing) {
      takenByPlatform[j.platform] = takenByPlatform[j.platform] || new Set();
      takenByPlatform[j.platform].add(new Date(j.scheduled_at).getTime());
    }

    // Pre-generate slot pools per platform.
    const slotPools = {};
    const cursorIdx = {};

    const created = [];
    const errors = [];
    const scheduledPostIds = new Set();

    for (const post of posts) {
      const platforms = post.selected_platforms || [];
      for (const platform of platforms) {
        const account = defaultAccountFor(platform, accounts);
        const reason = validatePlatform(platform, post, account);
        if (reason) { errors.push(`"${post.title_internal || 'post'}": ${reason}`); continue; }

        if (!slotPools[platform]) {
          slotPools[platform] = generateSlots({ platform, schedule, fromDate: start, toDate: end });
          cursorIdx[platform] = 0;
        }
        const pool = slotPools[platform];
        const taken = takenByPlatform[platform] || (takenByPlatform[platform] = new Set());

        // Find the next free slot for this platform.
        let slot = null;
        while (cursorIdx[platform] < pool.length) {
          const candidate = pool[cursorIdx[platform]];
          cursorIdx[platform]++;
          if (!taken.has(candidate.getTime())) { slot = candidate; break; }
        }
        if (!slot) { errors.push(`"${post.title_internal || 'post'}" (${platform}): no free slots in range.`); continue; }
        taken.add(slot.getTime());

        const rec = await base44.asServiceRole.entities.ScheduledPost.create({
          social_post_id: post.id,
          campaign_id: post.campaign_id || undefined,
          social_account_id: account.id,
          platform,
          scheduled_at: slot.toISOString(),
          timezone: timezone || schedule?.timezone || 'America/Chicago',
          status: 'queued',
        });
        created.push(rec);
        scheduledPostIds.add(post.id);
      }
    }

    // Mark each scheduled post.
    for (const id of scheduledPostIds) {
      const jobs = (await base44.asServiceRole.entities.ScheduledPost.filter({ social_post_id: id }))
        .filter((j) => ['queued', 'processing'].includes(j.status))
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
      await base44.asServiceRole.entities.SocialPost.update(id, {
        publishing_status: 'scheduled',
        scheduled_at: jobs.length ? jobs[0].scheduled_at : undefined,
        timezone: timezone || schedule?.timezone || 'America/Chicago',
      });
    }

    await base44.asServiceRole.entities.SocialAutomationLog.create({
      account_id: 'global',
      event_type: 'bulk_scheduled',
      related_campaign_id: campaign_id || undefined,
      status: errors.length ? 'warning' : 'success',
      message: `Auto-filled ${created.length} job(s) across ${scheduledPostIds.size} post(s).`,
      metadata: { mode, errors: errors.slice(0, 20) },
    });

    return Response.json({ success: created.length > 0, created_count: created.length, post_count: scheduledPostIds.size, errors });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});