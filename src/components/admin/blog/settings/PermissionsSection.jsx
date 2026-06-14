import React from "react";
import { Lock } from "lucide-react";
import { SettingsCard, SelectField } from "./SettingsField";

const ROLE_3 = [
  { value: "admin", label: "Admins only" },
  { value: "editor", label: "Editors & admins" },
  { value: "any", label: "Any signed-in user" },
];
const ROLE_2 = [
  { value: "admin", label: "Admins only" },
  { value: "editor", label: "Editors & admins" },
];
const ADMIN_ONLY = [{ value: "admin", label: "Admins only" }];

// Role-based access for blog actions. Note: enforcement remains on the
// existing admin-gated routes/functions; these are the configured policy.
export default function PermissionsSection({ s, set }) {
  return (
    <SettingsCard icon={Lock} title="Permission Controls" description="Who can perform each blog action.">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Who can create posts" value={s.permCreatePosts} onChange={(v) => set("permCreatePosts", v)} options={ROLE_3} />
        <SelectField label="Who can edit posts" value={s.permEditPosts} onChange={(v) => set("permEditPosts", v)} options={ROLE_3} />
        <SelectField label="Who can approve posts" value={s.permApprovePosts} onChange={(v) => set("permApprovePosts", v)} options={ROLE_2} />
        <SelectField label="Who can publish posts" value={s.permPublishPosts} onChange={(v) => set("permPublishPosts", v)} options={ROLE_2} />
        <SelectField label="Who can manage settings" value={s.permManageSettings} onChange={(v) => set("permManageSettings", v)} options={ADMIN_ONLY} />
        <SelectField label="Who can view analytics" value={s.permViewAnalytics} onChange={(v) => set("permViewAnalytics", v)} options={ROLE_2} />
        <SelectField label="Who can use AI generation" value={s.permUseAiGeneration} onChange={(v) => set("permUseAiGeneration", v)} options={ROLE_2} />
      </div>
    </SettingsCard>
  );
}