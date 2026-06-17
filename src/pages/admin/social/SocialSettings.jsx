import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import GeneralSettings from "@/components/admin/social/settings/GeneralSettings";
import PlatformSettings from "@/components/admin/social/settings/PlatformSettings";
import FacebookSettings from "@/components/admin/social/settings/FacebookSettings";
import InstagramSettings from "@/components/admin/social/settings/InstagramSettings";
import AiSettings from "@/components/admin/social/settings/AiSettings";
import SafetySettings from "@/components/admin/social/settings/SafetySettings";
import NotificationSettings from "@/components/admin/social/settings/NotificationSettings";
import UsageLimitSettings from "@/components/admin/social/settings/UsageLimitSettings";

export default function SocialSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [meta, setMeta] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await base44.functions.invoke("getSocialSettings", {});
      if (!data?.success) { setError(data?.error || "Could not load settings."); return; }
      setSettings(data.settings);
      setMeta(data.meta);
    } catch (e) {
      setError(e.message || "Could not load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    trackEvent("admin_social_settings_view");
    load();
  }, []);

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));
  const updateGroup = (group) => (key, value) => setSettings((s) => ({ ...s, [group]: { ...s[group], [key]: value } }));
  const updatePlatform = (platform, key, value) =>
    setSettings((s) => ({ ...s, platforms: { ...s.platforms, [platform]: { ...s.platforms[platform], [key]: value } } }));

  const save = async () => {
    setSaving(true);
    trackEvent("admin_social_settings_save");
    try {
      const { data } = await base44.functions.invoke("updateSocialSettings", { settings });
      if (!data?.success) { toast.error(data?.error || "Could not save settings."); return; }
      toast.success("Settings saved.");
    } catch (e) {
      toast.error(e.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading settings…" />;
  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!settings) return null;

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Global configuration for the social marketing system."
        actions={
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
            Save settings
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <GeneralSettings settings={settings} update={update} />
        <AiSettings ai={settings.ai} update={updateGroup("ai")} />
        <PlatformSettings settings={settings} updatePlatform={updatePlatform} meta={meta} />
        <div className="space-y-5">
          <FacebookSettings fb={settings.facebook} update={updateGroup("facebook")} meta={meta} />
          <InstagramSettings ig={settings.instagram} update={updateGroup("instagram")} meta={meta} />
        </div>
        <SafetySettings safety={settings.safety} update={updateGroup("safety")} />
        <NotificationSettings notifications={settings.notifications} update={updateGroup("notifications")} />
        <UsageLimitSettings limits={settings.limits} update={updateGroup("limits")} />
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
          Save settings
        </Button>
      </div>
    </div>
  );
}