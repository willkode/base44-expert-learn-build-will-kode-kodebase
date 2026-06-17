import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FieldGroup from "./FieldGroup";
import TagInput from "./TagInput";
import ColorInput from "./ColorInput";
import { TONE_OPTIONS } from "./brandConfig";

// Each section is a pure presentational block driven by `draft` + `set(field, value)`.
// `errors` is a map of field -> message. `only` optionally limits which sections render
// (used by the guided wizard).

export function BasicsSection({ draft, set, errors }) {
  return (
    <div className="space-y-4">
      <FieldGroup label="Brand name" required error={errors.brand_name}>
        <Input value={draft.brand_name} onChange={(e) => set("brand_name", e.target.value)} placeholder="KodeBase" />
      </FieldGroup>
      <FieldGroup label="Website URL" error={errors.website_url}>
        <Input value={draft.website_url} onChange={(e) => set("website_url", e.target.value)} placeholder="https://kodebase.com" />
      </FieldGroup>
      <FieldGroup label="Short brand description" required error={errors.short_description} hint="One or two sentences about your brand.">
        <Textarea rows={3} value={draft.short_description} onChange={(e) => set("short_description", e.target.value)} placeholder="We help builders ship apps faster..." />
      </FieldGroup>
      <FieldGroup label="What the business / app does" hint="Explain the product in plain language.">
        <Textarea rows={3} value={draft.products_services} onChange={(e) => set("products_services", e.target.value)} placeholder="An AI blueprint and prompt tool for app builders..." />
      </FieldGroup>
    </div>
  );
}

export function AudienceSection({ draft, set, errors }) {
  return (
    <div className="space-y-4">
      <FieldGroup label="Target audience" required error={errors.audience}>
        <Textarea rows={2} value={draft.audience} onChange={(e) => set("audience", e.target.value)} placeholder="Indie founders, no-code builders, agencies..." />
      </FieldGroup>
      <FieldGroup label="Customer pain points" hint="The problems your audience struggles with.">
        <Textarea rows={2} value={draft.pain_points} onChange={(e) => set("pain_points", e.target.value)} placeholder="Slow to launch, unclear scope, security worries..." />
      </FieldGroup>
      <FieldGroup label="Products / services / offers">
        <Textarea rows={2} value={draft.products_services} onChange={(e) => set("products_services", e.target.value)} placeholder="Prompt packs, blueprint generator, security audits..." />
      </FieldGroup>
      <TagInput
        label="Unique value propositions"
        value={draft.value_propositions}
        onChange={(v) => set("value_propositions", v)}
        placeholder="Add a value prop and press Enter"
        hint="What sets you apart. Press Enter after each."
      />
      <FieldGroup label="Competitors or inspiration">
        <Textarea rows={2} value={draft.competitor_notes} onChange={(e) => set("competitor_notes", e.target.value)} placeholder="Brands you admire or compete with..." />
      </FieldGroup>
    </div>
  );
}

export function VoiceSection({ draft, set }) {
  return (
    <div className="space-y-4">
      <FieldGroup label="Brand voice" hint="Describe how your brand sounds in its own words.">
        <Textarea rows={2} value={draft.tone_of_voice} onChange={(e) => set("tone_of_voice", e.target.value)} placeholder="Confident, helpful, a little playful..." />
      </FieldGroup>
      <FieldGroup label="Preferred tone">
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => set("preferred_tone", draft.preferred_tone === t.key ? "" : t.key)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                draft.preferred_tone === t.key
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FieldGroup>
      <TagInput label="Words / phrases to use" value={draft.preferred_words} onChange={(v) => set("preferred_words", v)} placeholder="ship, build, launch" />
      <TagInput label="Words / phrases to avoid" value={draft.banned_words} onChange={(v) => set("banned_words", v)} placeholder="cheap, hack, guru" />
      <FieldGroup label="Default call to action">
        <Input value={draft.default_call_to_action} onChange={(e) => set("default_call_to_action", e.target.value)} placeholder="Start building free →" />
      </FieldGroup>
      <TagInput label="Default hashtags" value={draft.default_hashtags} onChange={(v) => set("default_hashtags", v)} placeholder="#buildinpublic" hint="Used as defaults when generating posts." />
    </div>
  );
}

export function VisualSection({ draft, set }) {
  return (
    <div className="space-y-4">
      <FieldGroup label="Visual style for generated images" hint="Style guidance applied when generating post images.">
        <Textarea rows={2} value={draft.visual_style} onChange={(e) => set("visual_style", e.target.value)} placeholder="Dark tech aesthetic, deep navy, orange-to-amber gradients, flat vector..." />
      </FieldGroup>
      <FieldGroup label="Logo URL" hint="Paste a hosted logo URL.">
        <Input value={draft.logo_url} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://.../logo.png" />
      </FieldGroup>
      {draft.logo_url ? (
        <img src={draft.logo_url} alt="Brand logo preview" className="h-12 rounded-md border border-border bg-background/40 p-1 object-contain" />
      ) : null}
      <ColorInput label="Brand colors" value={draft.brand_colors} onChange={(v) => set("brand_colors", v)} />
      <FieldGroup label="Facebook Page content style" hint="How posts should read on Facebook.">
        <Textarea rows={2} value={draft.facebook_content_style} onChange={(e) => set("facebook_content_style", e.target.value)} placeholder="Friendly, community-first, longer captions with a clear CTA..." />
      </FieldGroup>
      <FieldGroup label="Instagram visual / caption style" hint="How posts should look and read on Instagram.">
        <Textarea rows={2} value={draft.instagram_style} onChange={(e) => set("instagram_style", e.target.value)} placeholder="Bold visuals, punchy first line, hashtags in first comment..." />
      </FieldGroup>
    </div>
  );
}

export const SECTION_COMPONENTS = {
  basics: BasicsSection,
  audience: AudienceSection,
  voice: VoiceSection,
  visual: VisualSection,
};