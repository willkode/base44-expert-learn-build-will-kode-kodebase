import React from "react";
import { Facebook } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SettingsSection, ToggleRow, NumberRow } from "./settingsPrimitives";

export default function FacebookSettings({ fb, update, meta }) {
  const conn = meta?.connection?.facebook || { configured: false };
  const reviewStatus = meta?.metaAppReviewStatus;
  return (
    <SettingsSection icon={Facebook} title="Facebook settings" description="Page publishing guardrails and limits.">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="outline" className={conn.configured ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-slate-500/30 text-slate-300 bg-slate-500/10"}>
          {conn.configured ? "OAuth configured" : "Not connected"}
        </Badge>
        {reviewStatus && (
          <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">Meta app review: {reviewStatus}</Badge>
        )}
      </div>
      <ToggleRow label="Enable Facebook" checked={fb.enabled} onChange={(v) => update("enabled", v)} />
      <ToggleRow label="Posting enabled" checked={fb.postingEnabled} onChange={(v) => update("postingEnabled", v)} />
      <ToggleRow label="Analytics enabled" checked={fb.analyticsEnabled} onChange={(v) => update("analyticsEnabled", v)} />
      <ToggleRow label="Image posting enabled" checked={fb.imagePostingEnabled} onChange={(v) => update("imagePostingEnabled", v)} />
      <ToggleRow label="Video posting enabled" checked={fb.videoPostingEnabled} onChange={(v) => update("videoPostingEnabled", v)} />
      <NumberRow label="Max Facebook posts per day" value={fb.maxPostsPerDay} onChange={(v) => update("maxPostsPerDay", v)} min={0} max={100} />
      <NumberRow label="Max Facebook posts per hour" value={fb.maxPostsPerHour} onChange={(v) => update("maxPostsPerHour", v)} min={0} max={50} />
      <ToggleRow label="Require approval before Facebook publishing" checked={fb.requireApprovalBeforePublishing} onChange={(v) => update("requireApprovalBeforePublishing", v)} />
      <ToggleRow label="Block publishing without Page permission" checked={fb.blockWithoutPagePermission} onChange={(v) => update("blockWithoutPagePermission", v)} />
      <ToggleRow label="Block personal profile posting" description="Only Pages can be published to." checked={fb.blockPersonalProfilePosting} onChange={(v) => update("blockPersonalProfilePosting", v)} />
    </SettingsSection>
  );
}