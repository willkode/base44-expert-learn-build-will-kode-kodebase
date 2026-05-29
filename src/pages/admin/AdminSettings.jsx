import React, { useState, useEffect } from "react";
import { Cog } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const KEY = "global";
const DEFAULTS = {
  key: KEY,
  freeBlueprintLimit: 3,
  proBlueprintLimit: 25,
  agencyBlueprintLimit: 100,
  securityReviewEnabled: true,
  qaChecklistEnabled: true,
  promptPackEnabled: true,
  maintenanceMode: false,
};

const LIMITS = [
  ["freeBlueprintLimit", "Free plan blueprint limit"],
  ["proBlueprintLimit", "Pro plan blueprint limit"],
  ["agencyBlueprintLimit", "Agency plan blueprint limit"],
];

const FLAGS = [
  ["securityReviewEnabled", "Security Review", "Allow users to run security reviews."],
  ["qaChecklistEnabled", "QA Checklist", "Allow users to generate QA checklists."],
  ["promptPackEnabled", "Prompt Packs", "Allow prompt pack generation."],
  ["maintenanceMode", "Maintenance Mode", "Temporarily restrict app usage."],
];

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.AppSetting.filter({ key: KEY }, "-created_date", 1).then((rows) => {
      if (rows[0]) { setSettings({ ...DEFAULTS, ...rows[0] }); setRecordId(rows[0].id); }
      else setSettings(DEFAULTS);
    });
  }, []);

  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    const data = { ...DEFAULTS, ...settings, key: KEY };
    delete data.id;
    if (recordId) await base44.entities.AppSetting.update(recordId, data);
    else {
      const created = await base44.entities.AppSetting.create(data);
      setRecordId(created.id);
    }
    setSaving(false);
    toast.success("Settings saved");
  };

  if (!settings) return <LoadingState />;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="System Settings"
        description="Platform-wide configuration, plan limits, and feature flags."
        actions={<Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>}
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Cog className="w-4.5 h-4.5 text-primary" />
            <h3 className="font-sora font-semibold">Blueprint limits by plan</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {LIMITS.map(([k, label]) => (
              <div key={k}>
                <Label className="mb-1.5 block text-sm">{label}</Label>
                <Input type="number" min={0} value={settings[k]} onChange={(e) => set(k, Number(e.target.value))} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="font-sora font-semibold mb-5">Feature flags</h3>
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