import React from "react";
import { Sparkles, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BasicsSection, AudienceSection, VoiceSection, VisualSection } from "./BrandFormSections";

const CARD = "rounded-2xl border border-border bg-card/60 p-6";

// Compact edit mode for returning users — all sections on one page in cards.
export default function BrandEditForm({ draft, set, errors, onSave, saving }) {
  return (
    <div className="space-y-5">
      <section className={CARD}>
        <h2 className="font-sora font-semibold mb-4">The Basics</h2>
        <BasicsSection draft={draft} set={set} errors={errors} />
      </section>

      <section className={CARD}>
        <h2 className="font-sora font-semibold mb-4">Audience & Offer</h2>
        <AudienceSection draft={draft} set={set} errors={errors} />
      </section>

      <section className={CARD}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sora font-semibold">Voice & Words</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            title="AI voice suggestions are coming in a later step."
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate brand voice suggestion
          </Button>
        </div>
        <VoiceSection draft={draft} set={set} />
      </section>

      <section className={CARD}>
        <h2 className="font-sora font-semibold mb-4">Visual & Channels</h2>
        <VisualSection draft={draft} set={set} />
      </section>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}