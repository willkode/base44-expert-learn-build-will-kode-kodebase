import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Recommended fallback slots per platform (local hour:minute) when no schedule applies.
const RECOMMENDED = {
  twitter: ['09:00', '12:00', '17:00'],
  reddit: ['08:00', '20:00'],
  linkedin: ['08:00', '12:00'],
  facebook: ['11:00', '15:00'],
  instagram: ['11:00', '19:00'],
};

// Builds candidate Date objects from a schedule (or recommended defaults) for the next N days.
function generateSlots({ platform, schedule, fromDate, days }) {
  const slots = [];
  const times = (schedule && schedule.posting_times && schedule.posting_times.length)
    ? schedule.posting_times
    : (RECOMMENDED[platform] || ['09:00']);
  const allowedDays = schedule && schedule.days_of_week && schedule.days_of_week.length ? schedule.days_of_week : [0, 1, 2, 3, 4, 5, 6];

  for (let i = 0; i < days; i++) {
    const day = new Date(fromDate);
    day.setDate(day.getDate() + i);
    if (!allowedDays.includes(day.getDay())) continue;
    for (const t of times) {
      const [h, m] = t.split(':').map(Number);
      const slot = new Date(day);
      slot.setHours(h, m || 0, 0, 0);
      if (slot.getTime() > Date.now()) slots.push(slot);
    }
  }
  return slots.sort((a, b) => a - b);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { platform, schedule_id, days = 30, exclude_taken = true } = body || {};
    if (!platform) return Response.json({ success: false, error: 'platform is required.' }, { status: 400 });

    let schedule = null;
    if (schedule_id) {
      schedule = await base44.asServiceRole.entities.PostingSchedule.get(schedule_id);
    } else {
      const active = (await base44.asServiceRole.entities.PostingSchedule.filter({ is_active: true }))
        .filter((s) => (s.platforms || []).includes(platform));
      schedule = active[0] || null;
    }

    const slots = generateSlots({ platform, schedule, fromDate: new Date(), days });

    let takenTimes = new Set();
    if (exclude_taken) {
      const jobs = (await base44.asServiceRole.entities.ScheduledPost.filter({ platform }))
        .filter((j) => ['queued', 'processing'].includes(j.status));
      takenTimes = new Set(jobs.map((j) => new Date(j.scheduled_at).getTime()));
    }

    const next = slots.find((s) => !takenTimes.has(s.getTime()));
    return Response.json({
      success: true,
      next_slot: next ? next.toISOString() : null,
      upcoming: slots.filter((s) => !takenTimes.has(s.getTime())).slice(0, 10).map((s) => s.toISOString()),
      timezone: schedule?.timezone || 'America/Chicago',
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});