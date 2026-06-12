import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import SetupInstructions from "@/components/admin/email/settings/SetupInstructions";
import ConnectionStatusCard from "@/components/admin/email/settings/ConnectionStatusCard";
import SenderIdentityCard from "@/components/admin/email/settings/SenderIdentityCard";
import DeliverabilityCard from "@/components/admin/email/settings/DeliverabilityCard";
import ComplianceCard from "@/components/admin/email/settings/ComplianceCard";
import LimitsCard from "@/components/admin/email/settings/LimitsCard";
import TestEmailCard from "@/components/admin/email/settings/TestEmailCard";

export default function EmailResendSettings() {
  const [settings, setSettings] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [domains, setDomains] = useState(null);

  const loadStatus = () => {
    base44.functions.invoke("checkResendConfiguration", {}).then((res) => {
      if (!res.data?.error) setStatus(res.data);
    });
  };

  useEffect(() => {
    base44.entities.EmailSettings.filter({ key: "global" }, "-created_date", 1).then((rows) => {
      setSettings(rows[0] || { key: "global" });
    });
    loadStatus();
  }, []);

  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const { id, key, created_date, updated_date, created_by_id, resendApiKeyConfigured, ...safe } = settings;
      const res = await base44.functions.invoke("updateEmailSettings", { settings: safe });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success("Email settings saved");
      loadStatus();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await base44.functions.invoke("testResendConnection", {});
      if (res.data?.success) {
        setDomains(res.data.domains || []);
        toast.success(`Connection OK — ${res.data.domains?.length || 0} domain(s) found`);
      } else {
        toast.error(res.data?.error || "Connection test failed");
      }
      loadStatus();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  if (!settings) return <LoadingState label="Loading settings..." />;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Resend Settings"
        description="Configure sending identity, deliverability, compliance and safety limits."
        actions={<Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>}
      />
      <div className="space-y-6">
        {!status?.apiKeyConfigured && <SetupInstructions />}
        <ConnectionStatusCard status={status} onTestConnection={handleTestConnection} testing={testing} />
        <SenderIdentityCard settings={settings} set={set} />
        <DeliverabilityCard settings={settings} set={set} domains={domains} />
        <ComplianceCard settings={settings} set={set} />
        <LimitsCard settings={settings} set={set} />
        <TestEmailCard sendingEnabled={!!status?.sendingEnabled} onSent={loadStatus} />
      </div>
    </div>
  );
}