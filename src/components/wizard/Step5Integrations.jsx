import React from "react";
import { AreaField } from "./WizardField";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card/40 px-4 py-3">
      <Label className="cursor-pointer">{label}</Label>
      <Switch checked={!!checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function Step5Integrations({ data, set }) {
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-3">
        <Toggle label="Email integration" checked={data.emailIntegration} onChange={(v) => set("emailIntegration", v)} />
        <Toggle label="Payment integration" checked={data.paymentIntegration} onChange={(v) => set("paymentIntegration", v)} />
        <Toggle label="Webhooks" checked={data.webhooks} onChange={(v) => set("webhooks", v)} />
        <Toggle label="Automations" checked={data.automations} onChange={(v) => set("automations", v)} />
      </div>
      <AreaField label="AI features" value={data.aiFeatures} onChange={(v) => set("aiFeatures", v)} placeholder="Any AI-powered features? e.g. smart matching, content generation, summaries" />
      <AreaField label="External APIs" value={data.externalApis} onChange={(v) => set("externalApis", v)} placeholder="Any third-party services to connect? e.g. Google Maps, Stripe, Twilio" />
    </div>
  );
}