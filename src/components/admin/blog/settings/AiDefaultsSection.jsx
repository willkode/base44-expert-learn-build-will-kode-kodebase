import React from "react";
import { Sparkles } from "lucide-react";
import { SettingsCard, TextField, AreaField, ListField, SelectField, ToggleRow } from "./SettingsField";

const LENGTH_OPTIONS = [
  { value: "short", label: "Short (~600 words)" },
  { value: "medium", label: "Medium (~1,000 words)" },
  { value: "long", label: "Long (~1,800 words)" },
  { value: "comprehensive", label: "Comprehensive (2,500+ words)" },
];

export default function AiDefaultsSection({ s, set }) {
  return (
    <SettingsCard icon={Sparkles} title="AI Defaults" description="Defaults applied to AI-generated articles.">
      <ToggleRow label="Enable AI blog generation" hint="Allow AI to draft blog posts." checked={s.enableAiGeneration} onChange={(v) => set("enableAiGeneration", v)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Default article tone" value={s.defaultArticleTone} onChange={(v) => set("defaultArticleTone", v)} />
        <SelectField label="Default article length" value={s.defaultArticleLength} onChange={(v) => set("defaultArticleLength", v)} options={LENGTH_OPTIONS} />
      </div>
      <AreaField label="Default featured image style" value={s.defaultFeaturedImageStyle} onChange={(v) => set("defaultFeaturedImageStyle", v)} />
      <AreaField label="Default content structure" value={s.defaultContentStructure} onChange={(v) => set("defaultContentStructure", v)} placeholder="e.g. Intro → key points → examples → conclusion → CTA" />
      <AreaField label="Default CTA" value={s.defaultCta} onChange={(v) => set("defaultCta", v)} placeholder="Default call-to-action appended to posts" />
      <AreaField label="Default brand voice" value={s.defaultBrandVoice} onChange={(v) => set("defaultBrandVoice", v)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ListField label="Banned words/phrases" value={s.bannedWords} onChange={(v) => set("bannedWords", v)} placeholder="cheap, guru, hack" />
        <ListField label="Preferred words/phrases" value={s.preferredWords} onChange={(v) => set("preferredWords", v)} placeholder="build, ship, blueprint" />
      </div>
    </SettingsCard>
  );
}