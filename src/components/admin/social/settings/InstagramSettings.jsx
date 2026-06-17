import React from "react";
import { Instagram } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SettingsSection, ToggleRow, NumberRow } from "./settingsPrimitives";

export default function InstagramSettings({ ig, update, meta }) {
  const conn = meta?.connection?.instagram || { configured: false };
  const reviewStatus = meta?.metaAppReviewStatus;
  return (
    <SettingsSection icon={Instagram} title="Instagram settings" description="Visual-first publishing guardrails and limits.">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="outline" className={conn.configured ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-slate-500/30 text-slate-300 bg-slate-500/10"}>
          {conn.configured ? "OAuth configured" : "Not connected"}
        </Badge>
        {reviewStatus && (
          <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">Meta app review: {reviewStatus}</Badge>
        )}
      </div>
      <ToggleRow label="Enable Instagram" checked={ig.enabled} onChange={(v) => update("enabled", v)} />
      <ToggleRow label="Posting enabled" checked={ig.postingEnabled} onChange={(v) => update("postingEnabled", v)} />
      <ToggleRow label="Analytics enabled" checked={ig.analyticsEnabled} onChange={(v) => update("analyticsEnabled", v)} />
      <ToggleRow label="Image posting enabled" checked={ig.imagePostingEnabled} onChange={(v) => update("imagePostingEnabled", v)} />
      <ToggleRow label="Video / Reel posting enabled" checked={ig.videoReelPostingEnabled} onChange={(v) => update("videoReelPostingEnabled", v)} />
      <ToggleRow label="Carousel posting enabled" checked={ig.carouselPostingEnabled} onChange={(v) => update("carouselPostingEnabled", v)} />
      <ToggleRow label="Story posting enabled" checked={ig.storyPostingEnabled} onChange={(v) => update("storyPostingEnabled", v)} />
      <NumberRow label="Max Instagram posts per day" value={ig.maxPostsPerDay} onChange={(v) => update("maxPostsPerDay", v)} min={0} max={100} />
      <NumberRow label="Max Instagram posts per hour" value={ig.maxPostsPerHour} onChange={(v) => update("maxPostsPerHour", v)} min={0} max={50} />
      <ToggleRow label="Require approval before Instagram publishing" checked={ig.requireApprovalBeforePublishing} onChange={(v) => update("requireApprovalBeforePublishing", v)} />
      <ToggleRow label="Block Instagram text-only posts" description="Instagram requires media." checked={ig.blockTextOnlyPosts} onChange={(v) => update("blockTextOnlyPosts", v)} />
      <ToggleRow label="Require media alt text" checked={ig.requireMediaAltText} onChange={(v) => update("requireMediaAltText", v)} />
    </SettingsSection>
  );
}