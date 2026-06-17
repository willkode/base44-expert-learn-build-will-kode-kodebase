import React from "react";
import { Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SettingsSection, ToggleRow, NumberRow, FieldRow } from "./settingsPrimitives";

export default function GeneralSettings({ settings, update }) {
  return (
    <SettingsSection icon={Settings2} title="General" description="System-wide defaults for social marketing.">
      <ToggleRow label="Enable social marketing system" description="Master switch. When off, generation, scheduling and publishing pause." checked={settings.systemEnabled} onChange={(v) => update("systemEnabled", v)} />
      <FieldRow label="Default timezone">
        <Input value={settings.defaultTimezone || ""} onChange={(e) => update("defaultTimezone", e.target.value)} placeholder="America/Chicago" className="h-8 text-sm max-w-xs" />
      </FieldRow>
      <ToggleRow label="Require approval by default" description="New posts start in review unless changed per campaign." checked={settings.defaultApprovalRequired} onChange={(v) => update("defaultApprovalRequired", v)} />
      <NumberRow label="Default posting frequency limit" description="Default max posts per day across the system." value={settings.defaultPostingFrequencyLimit} onChange={(v) => update("defaultPostingFrequencyLimit", v)} min={1} max={100} />
      <ToggleRow label="Enable AI generation" checked={settings.enableAiGeneration} onChange={(v) => update("enableAiGeneration", v)} />
      <ToggleRow label="Enable image generation" checked={settings.enableImageGeneration} onChange={(v) => update("enableImageGeneration", v)} />
      <ToggleRow label="Enable auto-posting" description="Background worker publishes scheduled posts automatically." checked={settings.enableAutoPosting} onChange={(v) => update("enableAutoPosting", v)} />
      <ToggleRow label="Enable analytics sync" description="Periodically pulls engagement metrics from each platform." checked={settings.enableAnalyticsSync} onChange={(v) => update("enableAnalyticsSync", v)} />
    </SettingsSection>
  );
}