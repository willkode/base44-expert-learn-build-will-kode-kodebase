import React, { useState, useEffect } from "react";
import { Plug } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const KEY = "global";
const DEFAULTS = {
  key: KEY,
  resendApiKeyConfigured: false,
  resendFromEmail: "",
  resendFromName: "",
  resendReplyToEmail: "",
  resendDomain: "",
  defaultTimezone: "America/Chicago",
  requireApprovalBeforeSend: true,
  enableAiGeneration: true,
  enableAutoSending: false,
  enableWebhookTracking: true,
  enableClickTracking: true,
  enableOpenTracking: true,
  dailySendLimit: 2000,
  hourlySendLimit: 500,
  defaultFooterText: "",
  companyName: "",
  companyAddress: "",
  unsubscribeEnabled: true,
  suppressionEnabled: true,
};

const IDENTITY_FIELDS = [
  ["resendFromName", "From name", "KodeBlueprint"],
  ["resendFromEmail", "From email", "hello@yourdomain.com"],
  ["resendReplyToEmail", "Reply-to email", "support@yourdomain.com"],
  ["resendDomain", "Sending domain", "yourdomain.com"],
];

const COMPANY_FIELDS = [
  ["companyName", "Company name", ""],
  ["companyAddress", "Company address (required for compliance footers)", ""],
  ["defaultFooterText", "Default footer text", ""],
];

const FLAGS = [
  ["requireApprovalBeforeSend", "Require approval before send", "Campaigns must be approved before sending."],
  ["enableAiGeneration", "AI email generation", "Allow generating email content with AI."],
  ["enableAutoSending", "Auto sending", "Allow scheduled campaigns and sequences to send automatically."],
  ["enableWebhookTracking", "Webhook tracking", "Track delivery, opens and clicks via Resend webhooks."],
  ["enableOpenTracking", "Open tracking", "Track email opens."],
  ["enableClickTracking", "Click tracking", "Track link clicks."],
  ["unsubscribeEnabled", "Unsubscribe links", "Add an unsubscribe link to every marketing email."],
  ["suppressionEnabled", "Suppression list", "Never send to unsubscribed, bounced or complained contacts."],
];

export default function EmailResendSettings() {
  const [settings, setSettings] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.EmailSettings.filter({ key: KEY }, "-created_date", 1).then((rows) => {
      if (rows[0]) { setSettings({ ...DEFAULTS, ...rows[0] }); setRecordId(rows[0].id); }
      else setSettings(DEFAULTS);
    });
  }, []);

  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    const data = { ...DEFAULTS, ...settings, key: KEY };
    delete data.id;
    delete data.created_date;
    delete data.updated_date;
    delete data.created_by_id;
    if (recordId) await base44.entities.EmailSettings.update(recordId, data);
    else {
      const created = await base44.entities.EmailSettings.create(data);
      setRecordId(created.id);
    }
    setSaving(false);
    toast.success("Email settings saved");
  };

  if (!settings) return <LoadingState label="Loading settings..." />;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Resend Settings"
        description="Configure your sending identity, tracking and compliance options."
        actions={<Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>}
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Plug className="w-4 h-4 text-primary" />
              <h3 className="font-sora font-semibold">API connection</h3>
            </div>
            <Badge variant={settings.resendApiKeyConfigured ? "default" : "secondary"}>
              {settings.resendApiKeyConfigured ? "Configured" : "Not configured"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            The Resend API key is stored securely as a backend secret and is never visible here.
            Once the key is added, this status will flip to Configured and sending will be enabled.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="font-sora font-semibold mb-5">Sending identity</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {IDENTITY_FIELDS.map(([k, label, ph]) => (
              <div key={k}>
                <Label className="mb-1.5 block text-sm">{label}</Label>
                <Input value={settings[k] || ""} placeholder={ph} onChange={(e) => set(k, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="font-sora font-semibold mb-5">Compliance</h3>
          <div className="space-y-4">
            {COMPANY_FIELDS.map(([k, label, ph]) => (
              <div key={k}>
                <Label className="mb-1.5 block text-sm">{label}</Label>
                <Input value={settings[k] || ""} placeholder={ph} onChange={(e) => set(k, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="font-sora font-semibold mb-5">Send limits</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-sm">Daily send limit</Label>
              <Input type="number" min={0} value={settings.dailySendLimit} onChange={(e) => set("dailySendLimit", Number(e.target.value))} />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Hourly send limit</Label>
              <Input type="number" min={0} value={settings.hourlySendLimit} onChange={(e) => set("hourlySendLimit", Number(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="font-sora font-semibold mb-5">Features</h3>
          <div className="space-y-3">
            {FLAGS.map(([k, label, desc]) => (
              <div key={k} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <Label className="text-sm">{label}</Label>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch checked={!!settings[k]} onCheckedChange={(v) => set(k, v)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}