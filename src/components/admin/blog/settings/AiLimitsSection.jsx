import React from "react";
import { Gauge } from "lucide-react";
import { SettingsCard, TextField } from "./SettingsField";

// Daily caps to keep AI usage and credit spend under control.
export default function AiLimitsSection({ s, set }) {
  return (
    <SettingsCard icon={Gauge} title="AI Usage Limits" description="Daily caps to control AI usage and cost. Use 0 to disable that action.">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Max AI posts per day" type="number" value={s.maxAiPostsPerDay} onChange={(v) => set("maxAiPostsPerDay", v)} />
        <TextField label="Max AI images per day" type="number" value={s.maxAiImagesPerDay} onChange={(v) => set("maxAiImagesPerDay", v)} />
        <TextField label="Max refresh fixes per day" type="number" value={s.maxRefreshFixesPerDay} onChange={(v) => set("maxRefreshFixesPerDay", v)} />
        <TextField label="Max repurposing generations per day" type="number" value={s.maxRepurposingPerDay} onChange={(v) => set("maxRepurposingPerDay", v)} />
        <TextField label="Max content plan posts per generation" type="number" value={s.maxContentPlanPostsPerGeneration} onChange={(v) => set("maxContentPlanPostsPerGeneration", v)} />
      </div>
    </SettingsCard>
  );
}