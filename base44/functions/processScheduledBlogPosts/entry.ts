import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SLUG_RE = /^[a-z0-9-]+$/;
const LOCK_STALE_MS = 10 * 60 * 1000; // 10 min — reclaim locks from crashed runs

// Scheduled worker (runs every 5 minutes): publishes posts whose scheduledAt has passed.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow either an authenticated admin (manual trigger) or the automation runner.
    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      isAdmin = user?.role === 'admin';
    } catch (_e) {
      isAdmin = false;
    }

    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const settings = (await base44.asServiceRole.entities.BlogSettings.filter({ key: 'global' }))[0];
    const requireApproval = !!settings?.requireApprovalBeforePublish;
    const scheduled = await base44.asServiceRole.entities.BlogPost.filter({ status: 'scheduled' }, 'scheduledAt', 100);

    const due = scheduled.filter((p) => {
      if (!p.scheduledAt) return false;
      if (new Date(p.scheduledAt).getTime() > nowMs) return false;
      // Skip posts already locked by a recent run.
      if (p.publishLockAt && (nowMs - new Date(p.publishLockAt).getTime()) < LOCK_STALE_MS) return false;
      return true;
    });

    const published = [];
    const failed = [];

    for (const p of due) {
      try {
        // Claim the post with a lock to prevent double publishing.
        await base44.asServiceRole.entities.BlogPost.update(p.id, { publishLockAt: nowIso });

        // Approval gate: never auto-publish unapproved posts when approval is required.
        if (requireApproval && p.approvalStatus !== 'approved') {
          await base44.asServiceRole.entities.BlogPost.update(p.id, { status: 'failed', publishLockAt: null, lastUpdatedAt: nowIso });
          await base44.asServiceRole.entities.BlogAutomationLog.create({
            eventType: 'publish',
            relatedPostId: p.id,
            status: 'error',
            message: `Auto-publish blocked for "${p.title}": post is not approved.`,
          });
          failed.push(p.id);
          continue;
        }

        if (!p.title || !p.slug || !SLUG_RE.test(p.slug) || !p.content || p.content.trim().length < 50) {
          await base44.asServiceRole.entities.BlogPost.update(p.id, {
            status: 'failed',
            publishLockAt: null,
            lastUpdatedAt: nowIso,
          });
          await base44.asServiceRole.entities.BlogAutomationLog.create({
            eventType: 'publish',
            relatedPostId: p.id,
            status: 'error',
            message: `Auto-publish failed for "${p.title}": missing valid title, slug, or content.`,
          });
          failed.push(p.id);
          continue;
        }

        await base44.asServiceRole.entities.BlogPost.update(p.id, {
          status: 'published',
          published: true,
          publishedAt: p.publishedAt || nowIso.slice(0, 10),
          scheduledAt: null,
          publishLockAt: null,
          lastUpdatedAt: nowIso,
        });
        await base44.asServiceRole.entities.BlogAutomationLog.create({
          eventType: 'publish',
          relatedPostId: p.id,
          status: 'success',
          message: `Auto-published "${p.title}" on schedule.`,
        });
        published.push(p.id);
      } catch (err) {
        await base44.asServiceRole.entities.BlogAutomationLog.create({
          eventType: 'publish',
          relatedPostId: p.id,
          status: 'error',
          message: `Auto-publish error for "${p.title}": ${err.message}`,
        });
        failed.push(p.id);
      }
    }

    return Response.json({
      success: true,
      checked: scheduled.length,
      publishedCount: published.length,
      failedCount: failed.length,
      published,
      failed,
      triggeredByAdmin: isAdmin,
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});