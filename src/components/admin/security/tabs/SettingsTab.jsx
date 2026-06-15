import React, { useState } from "react";
import { Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { formatDate } from "@/components/admin/security/securityConfig";

const FREQUENCIES = ["Manual", "Daily", "Weekly", "Monthly"];

export default function SettingsTab({ setting, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    scan_frequency: setting?.scan_frequency || "Manual",
    notify_admins: setting?.notify_admins ?? true,
    critical_alert_enabled: setting?.critical_alert_enabled ?? true,
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    if (setting?.id) {
      await base44.entities.SecuritySetting.update(setting.id, form);
    } else {
      await base44.entities.SecuritySetting.create({ setting_id: "global", ...form });
    }
    setSaving(false);
    toast({ title: "Settings saved", description: "Your security configuration has been updated." });
    onSaved?.();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-2xl border border-border bg-card/70 p-6 space-y-6">
        <div>
          <Label className="mb-2 block">Scan Frequency</Label>
          <Select value={form.scan_frequency} onValueChange={(v) => set("scan_frequency", v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1.5">How often the security scan should run automatically.</p>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-5">
          <div>
            <Label>Notify admins</Label>
            <p className="text-xs text-muted-foreground mt-1">Email admins when a scan completes.</p>
          </div>
          <Switch checked={form.notify_admins} onCheckedChange={(v) => set("notify_admins", v)} />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-5">
          <div>
            <Label>Critical alerts</Label>
            <p className="text-xs text-muted-foreground mt-1">Send an immediate alert when a critical issue is found.</p>
          </div>
          <Switch checked={form.critical_alert_enabled} onCheckedChange={(v) => set("critical_alert_enabled", v)} />
        </div>

        {setting?.last_scan_at && (
          <p className="text-xs text-muted-foreground border-t border-border pt-5">
            Last scan: {formatDate(setting.last_scan_at)}
          </p>
        )}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
      >
        <Save className="w-4 h-4" />
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}