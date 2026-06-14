import React from "react";
import { ShieldCheck } from "lucide-react";
import { SettingsCard, ToggleRow, TextField } from "./SettingsField";

// Guardrails enforced before a post is allowed to go live.
export default function PublishingSafetySection({ s, set }) {
  return (
    <SettingsCard icon={ShieldCheck} title="Publishing Safety" description="Requirements and blocks enforced before a post can publish.">
      <div className="space-y-3">
        <ToggleRow label="Require approval before publish" hint="Posts must be approved before going live." checked={s.requireApprovalBeforePublish} onChange={(v) => set("requireApprovalBeforePublish", v)} />
        <ToggleRow label="Require SEO score before publish" hint="Block publishing until the SEO score meets the minimum." checked={s.requireSeoScoreBeforePublish} onChange={(v) => set("requireSeoScoreBeforePublish", v)} />
        {s.requireSeoScoreBeforePublish && (
          <TextField label="Minimum SEO score to publish (0–100)" type="number" value={s.minSeoScoreToPublish} onChange={(v) => set("minSeoScoreToPublish", v)} />
        )}
        <ToggleRow label="Require featured image before publish" checked={s.requireFeaturedImageBeforePublish} onChange={(v) => set("requireFeaturedImageBeforePublish", v)} />
        <ToggleRow label="Require meta title before publish" checked={s.requireMetaTitleBeforePublish} onChange={(v) => set("requireMetaTitleBeforePublish", v)} />
        <ToggleRow label="Require meta description before publish" checked={s.requireMetaDescriptionBeforePublish} onChange={(v) => set("requireMetaDescriptionBeforePublish", v)} />
        <ToggleRow label="Require category before publish" checked={s.requireCategoryBeforePublish} onChange={(v) => set("requireCategoryBeforePublish", v)} />
        <ToggleRow label="Block duplicate target keywords" hint="Prevent two published posts targeting the same primary keyword." checked={s.blockDuplicateTargetKeywords} onChange={(v) => set("blockDuplicateTargetKeywords", v)} />
        <ToggleRow label="Warn about keyword cannibalization" hint="Warn (non-blocking) when posts may compete for the same keyword." checked={s.warnKeywordCannibalization} onChange={(v) => set("warnKeywordCannibalization", v)} />
        <ToggleRow label="Block publishing with placeholder text" hint="Block lorem ipsum, TODO, and other placeholders." checked={s.blockPlaceholderText} onChange={(v) => set("blockPlaceholderText", v)} />
        <ToggleRow label="Warn about unsupported claims" hint="Flag absolute or unverifiable claims before publishing." checked={s.warnUnsupportedClaims} onChange={(v) => set("warnUnsupportedClaims", v)} />
      </div>
    </SettingsCard>
  );
}