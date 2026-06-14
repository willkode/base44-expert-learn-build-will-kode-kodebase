import React from "react";
import { FileCheck2 } from "lucide-react";
import { SettingsCard, ToggleRow, TextField, SelectField, ListField } from "./SettingsField";

const LENGTH_OPTIONS = [
  { value: "short", label: "Short (~600 words)" },
  { value: "medium", label: "Medium (~1,000 words)" },
  { value: "long", label: "Long (~1,800 words)" },
  { value: "comprehensive", label: "Comprehensive (2,500+ words)" },
];

// Quality bar and structural requirements for blog content.
export default function ContentQualitySection({ s, set }) {
  return (
    <SettingsCard icon={FileCheck2} title="Content Quality Controls" description="Set the quality bar and required structure for posts.">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Default article length" value={s.defaultArticleLength} onChange={(v) => set("defaultArticleLength", v)} options={LENGTH_OPTIONS} />
        <TextField label="Preferred tone" value={s.defaultArticleTone} onChange={(v) => set("defaultArticleTone", v)} placeholder="Professional, helpful, authoritative" />
        <TextField label="Minimum word count" type="number" value={s.minWordCount} onChange={(v) => set("minWordCount", v)} />
        <TextField label="Maximum word count" type="number" value={s.maxWordCount} onChange={(v) => set("maxWordCount", v)} />
      </div>

      <div className="space-y-3">
        <ToggleRow label="Require CTA" hint="Posts must include a call-to-action." checked={s.requireCta} onChange={(v) => set("requireCta", v)} />
        <ToggleRow label="Require FAQ" hint="Posts must include an FAQ section." checked={s.requireFaq} onChange={(v) => set("requireFaq", v)} />
        <ToggleRow label="Require internal links" hint="Posts must link to other posts/pages." checked={s.requireInternalLinks} onChange={(v) => set("requireInternalLinks", v)} />
        <ToggleRow label="Require human review" hint="A person must review before the post can publish." checked={s.requireHumanReview} onChange={(v) => set("requireHumanReview", v)} />
      </div>

      <ListField label="Banned phrases" value={s.bannedWords} onChange={(v) => set("bannedWords", v)} placeholder="game-changer, revolutionary, guaranteed" />
      <ListField label="Required brand terms" value={s.requiredBrandTerms} onChange={(v) => set("requiredBrandTerms", v)} placeholder="KodeBase, Base44" />
    </SettingsCard>
  );
}