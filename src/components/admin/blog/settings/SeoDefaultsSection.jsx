import React from "react";
import { Search } from "lucide-react";
import { SettingsCard, TextField, AreaField, ToggleRow } from "./SettingsField";

export default function SeoDefaultsSection({ s, set }) {
  return (
    <SettingsCard icon={Search} title="SEO Defaults" description="Fallback metadata used when a post doesn't define its own. {{title}} and {{excerpt}} are supported tokens.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Meta title template" value={s.defaultMetaTitleTemplate} onChange={(v) => set("defaultMetaTitleTemplate", v)} placeholder="{{title}} | KodeBase" />
        <TextField label="Canonical URL base" value={s.defaultCanonicalUrlBase} onChange={(v) => set("defaultCanonicalUrlBase", v)} placeholder="https://yourdomain.com" />
      </div>
      <AreaField label="Meta description template" value={s.defaultMetaDescriptionTemplate} onChange={(v) => set("defaultMetaDescriptionTemplate", v)} placeholder="{{excerpt}}" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Default Open Graph image" value={s.defaultOgImageUrl} onChange={(v) => set("defaultOgImageUrl", v)} placeholder="https://..." />
        <TextField label="Default Twitter card image" value={s.defaultTwitterImageUrl} onChange={(v) => set("defaultTwitterImageUrl", v)} placeholder="https://..." />
      </div>
      <TextField label="Default category fallback" value={s.defaultCategoryFallback} onChange={(v) => set("defaultCategoryFallback", v)} placeholder="General" />
      <ToggleRow label="Noindex drafts & previews" hint="Prevent search engines from indexing non-published posts." checked={s.noindexDraftsAndPreviews} onChange={(v) => set("noindexDraftsAndPreviews", v)} />
    </SettingsCard>
  );
}