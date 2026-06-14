import React from "react";
import { Bell } from "lucide-react";
import { SettingsCard, ToggleRow, TextField } from "./SettingsField";

// Admin notification preferences for blog lifecycle events.
export default function NotificationsSection({ s, set }) {
  return (
    <SettingsCard icon={Bell} title="Notifications" description="Choose which blog events send an admin notification.">
      <TextField label="Notification email" type="email" value={s.notificationEmail} onChange={(v) => set("notificationEmail", v)} placeholder="team@kodebase.com" />
      <div className="space-y-3">
        <ToggleRow label="Notify when a post needs review" checked={s.notifyOnNeedsReview} onChange={(v) => set("notifyOnNeedsReview", v)} />
        <ToggleRow label="Notify when a post is approved" checked={s.notifyOnApproved} onChange={(v) => set("notifyOnApproved", v)} />
        <ToggleRow label="Notify when a post publishes" checked={s.notifyOnPublish} onChange={(v) => set("notifyOnPublish", v)} />
        <ToggleRow label="Notify when publishing fails" checked={s.notifyOnPublishingFailed} onChange={(v) => set("notifyOnPublishingFailed", v)} />
        <ToggleRow label="Notify when a content refresh is recommended" checked={s.notifyOnRefreshRecommended} onChange={(v) => set("notifyOnRefreshRecommended", v)} />
        <ToggleRow label="Notify when an SEO score is low" checked={s.notifyOnLowSeoScore} onChange={(v) => set("notifyOnLowSeoScore", v)} />
      </div>
    </SettingsCard>
  );
}