import React from "react";
import { Plug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SettingsSection, ToggleRow, NumberRow } from "./settingsPrimitives";
import { PLATFORMS } from "@/components/admin/social/socialConfig";

// Per-platform settings (Facebook & Instagram get dedicated sections; here we cover all five at a glance).
export default function PlatformSettings({ settings, updatePlatform, meta }) {
  const platformMeta = meta?.platformMeta || {};
  const connection = meta?.connection || {};

  return (
    <SettingsSection icon={Plug} title="Platform settings" description="Per-platform posting, analytics, and rate limits.">
      <div className="space-y-4">
        {PLATFORMS.map(({ key, label, icon: Icon }) => {
          const p = settings.platforms?.[key] || {};
          const pm = platformMeta[key] || {};
          const conn = connection[key] || { configured: false, status: "disconnected" };
          return (
            <div key={key} className="rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{label}</span>
                </div>
                <Badge variant="outline" className={conn.configured ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-slate-500/30 text-slate-300 bg-slate-500/10"}>
                  {conn.configured ? "OAuth configured" : "Not connected"}
                </Badge>
              </div>

              {pm.requiredScopes?.length > 0 && (
                <p className="text-[11px] text-muted-foreground mb-1">
                  <span className="font-medium">Required scopes:</span> {pm.requiredScopes.join(", ")}
                </p>
              )}
              {pm.rateLimitNotes && (
                <p className="text-[11px] text-muted-foreground mb-2"><span className="font-medium">Rate limits:</span> {pm.rateLimitNotes}</p>
              )}

              <ToggleRow label="Enabled" checked={p.enabled} onChange={(v) => updatePlatform(key, "enabled", v)} />
              <ToggleRow label="Posting enabled" checked={p.postingEnabled} onChange={(v) => updatePlatform(key, "postingEnabled", v)} />
              <ToggleRow label="Analytics enabled" checked={p.analyticsEnabled} onChange={(v) => updatePlatform(key, "analyticsEnabled", v)} />
              <ToggleRow label="Image posting enabled" checked={p.imagePostingEnabled} onChange={(v) => updatePlatform(key, "imagePostingEnabled", v)} />
              <NumberRow label="Max posts per day" value={p.maxPostsPerDay} onChange={(v) => updatePlatform(key, "maxPostsPerDay", v)} min={0} max={100} />
              <NumberRow label="Max posts per hour" value={p.maxPostsPerHour} onChange={(v) => updatePlatform(key, "maxPostsPerHour", v)} min={0} max={50} />
            </div>
          );
        })}
      </div>
    </SettingsSection>
  );
}