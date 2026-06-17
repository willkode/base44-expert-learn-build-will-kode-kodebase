import React from "react";
import { Bell } from "lucide-react";
import { SettingsSection, ToggleRow } from "./settingsPrimitives";

export default function NotificationSettings({ notifications, update }) {
  return (
    <SettingsSection icon={Bell} title="Notification settings" description="When the team gets alerted.">
      <ToggleRow label="Notify when a post publishes" checked={notifications.notifyOnPublish} onChange={(v) => update("notifyOnPublish", v)} />
      <ToggleRow label="Notify when a post fails" checked={notifications.notifyOnFailure} onChange={(v) => update("notifyOnFailure", v)} />
      <ToggleRow label="Notify when a token expires" checked={notifications.notifyOnTokenExpiry} onChange={(v) => update("notifyOnTokenExpiry", v)} />
      <ToggleRow label="Notify when approval is needed" checked={notifications.notifyOnApprovalNeeded} onChange={(v) => update("notifyOnApprovalNeeded", v)} />
      <ToggleRow label="Notify weekly analytics summary" checked={notifications.notifyWeeklyAnalyticsSummary} onChange={(v) => update("notifyWeeklyAnalyticsSummary", v)} />
      <ToggleRow label="Notify when Meta connection needs attention" checked={notifications.notifyOnMetaConnectionAttention} onChange={(v) => update("notifyOnMetaConnectionAttention", v)} />
    </SettingsSection>
  );
}