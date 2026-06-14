import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Save, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import GeneralSection from "@/components/admin/blog/settings/GeneralSection";
import AuthorSection from "@/components/admin/blog/settings/AuthorSection";
import SeoDefaultsSection from "@/components/admin/blog/settings/SeoDefaultsSection";
import AiDefaultsSection from "@/components/admin/blog/settings/AiDefaultsSection";
import PublishingSection from "@/components/admin/blog/settings/PublishingSection";
import SeoAutomationSection from "@/components/admin/blog/settings/SeoAutomationSection";

export default function BlogSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    base44.functions.invoke("getBlogSettings", {}).then((res) => {
      setSettings(res.data?.settings || { key: "global" });
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setSettings((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    setWarnings([]);
    try {
      const { id, created_date, updated_date, created_by_id, created_by, ...data } = settings;
      const res = await base44.functions.invoke("updateBlogSettings", { settings: data });
      if (res.data?.success) {
        setSettings((prev) => ({ ...prev, ...res.data.settings }));
        setWarnings(res.data.warnings || []);
        toast.success("Blog settings saved");
      } else {
        const errs = res.data?.errors || [res.data?.error || "Could not save settings"];
        errs.forEach((e) => toast.error(e));
      }
    } catch (err) {
      const errs = err?.response?.data?.errors || [err?.response?.data?.error || "Could not save settings"];
      errs.forEach((e) => toast.error(e));
    }
    setSaving(false);
  };

  if (loading) return <LoadingState label="Loading blog settings..." />;

  return (
    <div>
      <PageHeader
        title="Blog Settings"
        description="General, author, SEO, AI, publishing, and automation defaults for your blog."
        actions={
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save settings"}
          </Button>
        }
      />

      {warnings.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 text-amber-500 text-sm font-medium mb-1">
            <AlertTriangle className="w-4 h-4" /> Saved with warnings
          </div>
          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="space-y-6 max-w-3xl">
        <GeneralSection s={settings} set={set} />
        <AuthorSection s={settings} set={set} />
        <SeoDefaultsSection s={settings} set={set} />
        <AiDefaultsSection s={settings} set={set} />
        <PublishingSection s={settings} set={set} />
        <SeoAutomationSection s={settings} set={set} />
      </div>
    </div>
  );
}