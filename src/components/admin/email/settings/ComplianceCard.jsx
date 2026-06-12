import React from "react";
import { ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const FLAGS = [
  ["requireUnsubscribeLink", "Require unsubscribe link", "Every marketing email must include an unsubscribe link."],
  ["includeCompanyAddress", "Include company address", "Append your mailing address to email footers (CAN-SPAM)."],
  ["suppressBounced", "Suppress bounced contacts", "Never send again to addresses that hard-bounced."],
  ["suppressComplained", "Suppress complaint contacts", "Never send again to contacts who marked spam."],
  ["suppressUnsubscribed", "Suppress unsubscribed contacts", "Never send again to unsubscribed contacts."],
  ["requireApprovalBeforeSend", "Require approval before send", "Campaigns must be approved before they can be sent."],
];

export default function ComplianceCard({ settings, set }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-center gap-2 mb-5">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <h3 className="font-sora font-semibold">Compliance Defaults</h3>
      </div>
      <div className="space-y-2 mb-4">
        {FLAGS.map(([k, label, desc]) => (
          <div key={k} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="pr-3">
              <Label className="text-sm">{label}</Label>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <Switch checked={!!settings[k]} onCheckedChange={(v) => set(k, v)} />
          </div>
        ))}
      </div>
      <Label className="mb-1.5 block text-sm">Default unsubscribe footer</Label>
      <Textarea
        value={settings.defaultUnsubscribeFooter || ""}
        placeholder="Don't want these emails? Unsubscribe here: {{unsubscribe_url}}"
        rows={2}
        onChange={(e) => set("defaultUnsubscribeFooter", e.target.value)}
      />
    </div>
  );
}