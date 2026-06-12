import React from "react";
import { Gauge } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELDS = [
  ["hourlySendLimit", "Max emails per hour"],
  ["dailySendLimit", "Max emails per day"],
  ["maxRecipientsPerCampaign", "Max recipients per campaign"],
  ["maxTestSendsPerHour", "Max test sends per hour"],
  ["pauseAfterBounceCount", "Pause after bounces (per campaign)"],
  ["pauseAfterComplaintCount", "Pause after complaints (per campaign)"],
];

export default function LimitsCard({ settings, set }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Gauge className="w-4 h-4 text-primary" />
        <h3 className="font-sora font-semibold">Rate & Safety Limits</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {FIELDS.map(([k, label]) => (
          <div key={k}>
            <Label className="mb-1.5 block text-sm">{label}</Label>
            <Input
              type="number"
              min={0}
              value={settings[k] ?? ""}
              onChange={(e) => set(k, Number(e.target.value))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}