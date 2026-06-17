import React from "react";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SettingsSection, ToggleRow, NumberRow, FieldRow } from "./settingsPrimitives";

const TONES = ["professional", "casual", "bold", "educational", "witty", "direct", "community_focused", "sales_driven"];

export default function AiSettings({ ai, update }) {
  return (
    <SettingsSection icon={Sparkles} title="AI settings" description="Defaults applied when generating social content.">
      <FieldRow label="Default AI tone">
        <select value={ai.defaultTone || "professional"} onChange={(e) => update("defaultTone", e.target.value)} className="h-8 rounded-md border border-input bg-transparent px-3 text-sm max-w-xs">
          {TONES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
        </select>
      </FieldRow>
      <NumberRow label="Default number of variants" value={ai.defaultVariants} onChange={(v) => update("defaultVariants", v)} min={1} max={10} />
      <NumberRow label="Default hashtag count" value={ai.defaultHashtagCount} onChange={(v) => update("defaultHashtagCount", v)} min={0} max={30} />
      <FieldRow label="Default content quality rules" description="Guidance passed to the AI on every generation.">
        <Textarea rows={2} value={ai.contentQualityRules || ""} onChange={(e) => update("contentQualityRules", e.target.value)} className="text-sm" />
      </FieldRow>
      <FieldRow label="Default image style" description="Brand style prompt for AI-generated images.">
        <Textarea rows={2} value={ai.defaultImageStyle || ""} onChange={(e) => update("defaultImageStyle", e.target.value)} className="text-sm" />
      </FieldRow>
      <ToggleRow label="Require human approval before scheduling" checked={ai.requireApprovalBeforeScheduling} onChange={(v) => update("requireApprovalBeforeScheduling", v)} />
      <ToggleRow label="Require human approval before publishing" checked={ai.requireApprovalBeforePublishing} onChange={(v) => update("requireApprovalBeforePublishing", v)} />
    </SettingsSection>
  );
}