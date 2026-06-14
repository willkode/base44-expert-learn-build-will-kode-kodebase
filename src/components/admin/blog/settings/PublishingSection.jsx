import React from "react";
import { Send } from "lucide-react";
import { SettingsCard, SelectField, ToggleRow } from "./SettingsField";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "needs_review", label: "Needs review" },
  { value: "approved", label: "Approved" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
];

export default function PublishingSection({ s, set }) {
  return (
    <SettingsCard icon={Send} title="Publishing Controls" description="Govern how and when posts go live.">
      <SelectField label="Default post status after AI generation" value={s.defaultPostStatus} onChange={(v) => set("defaultPostStatus", v)} options={STATUS_OPTIONS} />
      <div className="space-y-3">
        <ToggleRow label="Require approval before publishing" hint="Posts must be approved before going live." checked={s.requireApprovalBeforePublish} onChange={(v) => set("requireApprovalBeforePublish", v)} />
        <ToggleRow label="Enable scheduled publishing" hint="Allow posts to be queued for a future date." checked={s.enableScheduledPublishing} onChange={(v) => set("enableScheduledPublishing", v)} />
        <ToggleRow label="Enable auto-publishing" hint="Publish scheduled posts automatically when due." checked={s.enableAutoPublishing} onChange={(v) => set("enableAutoPublishing", v)} />
        <ToggleRow label="Allow manual publish" hint="Let admins publish a post immediately." checked={s.allowManualPublish} onChange={(v) => set("allowManualPublish", v)} />
        <ToggleRow label="Notify when post is published" hint="Send a notification on publish (if a notification system exists)." checked={s.notifyOnPublish} onChange={(v) => set("notifyOnPublish", v)} />
      </div>
    </SettingsCard>
  );
}