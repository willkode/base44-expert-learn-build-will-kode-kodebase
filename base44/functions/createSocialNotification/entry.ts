import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Default severity per event when not explicitly provided.
const EVENT_SEVERITY = {
  account_connected: 'success', account_disconnected: 'warning', account_token_expired: 'error',
  post_generated: 'info', post_needs_approval: 'warning', post_approved: 'success', post_rejected: 'warning',
  post_scheduled: 'success', post_rescheduled: 'info', post_canceled: 'warning',
  post_published: 'success', post_failed: 'error', analytics_sync_completed: 'info',
  campaign_completed: 'success', campaign_paused_failures: 'error',
  facebook_page_connected: 'success', facebook_page_disconnected: 'warning', facebook_token_expired: 'error',
  facebook_post_published: 'success', facebook_post_failed: 'error', facebook_analytics_synced: 'info',
  instagram_account_connected: 'success', instagram_account_disconnected: 'warning', instagram_token_expired: 'error',
  instagram_post_published: 'success', instagram_post_failed: 'error', instagram_limit_reached: 'warning',
  instagram_analytics_synced: 'info',
};

// Which notification setting (if any) gates emailing for this event.
function emailGateForEvent(eventType, notifSettings) {
  if (!notifSettings) return true;
  if (eventType.includes('published') || eventType === 'post_published') return notifSettings.notifyOnPublish !== false;
  if (eventType.includes('failed') || eventType === 'post_failed') return notifSettings.notifyOnFailure !== false;
  if (eventType.includes('token_expired')) return notifSettings.notifyOnTokenExpiry !== false;
  if (eventType === 'post_needs_approval') return notifSettings.notifyOnApprovalNeeded !== false;
  if (eventType === 'analytics_sync_completed' || eventType.includes('analytics_synced')) return notifSettings.notifyWeeklyAnalyticsSummary === true;
  if (eventType.startsWith('facebook_') || eventType.startsWith('instagram_account') || eventType.includes('disconnected')) {
    return notifSettings.notifyOnMetaConnectionAttention !== false;
  }
  return false; // info-level events don't email by default
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const {
      user_id = null,
      account_id = 'global',
      event_type,
      title,
      message = '',
      platform = null,
      related_record_type = null,
      related_record_id = null,
      severity = null,
    } = body || {};

    if (!event_type || !title) {
      return Response.json({ success: false, error: 'event_type and title are required.' }, { status: 400 });
    }

    const finalSeverity = severity || EVENT_SEVERITY[event_type] || 'info';

    const notification = await base44.asServiceRole.entities.SocialNotification.create({
      account_id,
      user_id: user_id || user.id,
      event_type,
      title,
      message,
      platform: platform || undefined,
      related_record_type: related_record_type || undefined,
      related_record_id: related_record_id || undefined,
      severity: finalSeverity,
      read: false,
      emailed: false,
    });

    // Optional email channel — respect SocialSettings notification preferences.
    let emailed = false;
    try {
      const settingsRows = await base44.asServiceRole.entities.SocialSettings.filter({ key: 'global' }, '-created_date', 1);
      const notifSettings = settingsRows && settingsRows[0] ? settingsRows[0].notifications : null;
      const shouldEmail = (finalSeverity === 'error' || finalSeverity === 'warning' || finalSeverity === 'success')
        && emailGateForEvent(event_type, notifSettings);

      if (shouldEmail) {
        const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' }, '-created_date', 25);
        const recipients = [...new Set(admins.map((a) => a.email).filter(Boolean))];
        if (recipients.length > 0) {
          await Promise.all(recipients.map((to) =>
            base44.integrations.Core.SendEmail({
              to,
              subject: `[Social] ${title}`,
              body: `${message}\n\n— Social Marketing automation`,
            }).catch(() => {})
          ));
          emailed = true;
          await base44.asServiceRole.entities.SocialNotification.update(notification.id, { emailed: true });
        }
      }
    } catch (_e) { /* email is best-effort */ }

    return Response.json({ success: true, notification, emailed });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});