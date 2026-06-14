import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Save, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

import GeneralSection from "@/components/admin/blog/settings/GeneralSection";
import FeatureTogglesSection from "@/components/admin/blog/settings/FeatureTogglesSection";
import PublishingSection from "@/components/admin/blog/settings/PublishingSection";
import PublishingSafetySection from "@/components/admin/blog/settings/PublishingSafetySection";
import AuthorSection from "@/components/admin/blog/settings/AuthorSection";
import AiDefaultsSection from "@/components/admin/blog/settings/AiDefaultsSection";
import AiLimitsSection from "@/components/admin/blog/settings/AiLimitsSection";
import ContentQualitySection from "@/components/admin/blog/settings/ContentQualitySection";
import SeoDefaultsSection from "@/components/admin/blog/settings/SeoDefaultsSection";
import SeoAutomationSection from "@/components/admin/blog/settings/SeoAutomationSection";
import NotificationsSection from "@/components/admin/blog/settings/NotificationsSection";
import PermissionsSection from "@/components/admin/blog/settings/PermissionsSection";

export default function BlogSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    base44.functions
      .invoke("getBlogSettings", {})
      .then((res) => {
        setSettings(res.data?.settings || {});
        setLoading(false);
        trackEvent("admin_view_blog_settings");
      })
      .catch(() => {
        toast.error("Could not load blog settings.");
        setLoading(false);
      });
  }, []);

  const set = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setWarnings([]);
    try {
      const res = await base44.functions.invoke("updateBlogSettings", { settings });
      if (res.data?.success) {
        setSettings(res.data.settings || settings);
        setWarnings(res.data.warnings || []);
        toast.success("Blog settings saved.");
        trackEvent("admin_save_blog_settings");
      } else {
        toast.error(res.data?.error || "Could not save settings.");
        if (res.data?.errors?.length) res.data.errors.forEach((e) => toast.error(e));
      }
    } catch (err) {
      const data = err?.response?.data;
      toast.error(data?.error || "Could not save settings.");
      if (data?.errors?.length) data.errors.forEach((e) => toast.error(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20">
        <LoadingState label="Loading settings..." />
      </div>
    );
  }

  const s = settings || {};

  return (
    <div>
      <PageHeader
        title="Blog Settings"
        description="Configure how the blog publishes, generates content, and stays safe."
        actions={
          <Button className="gap-2" onClick={save} disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save settings"}
          </Button>
        }
      />

      {warnings.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 text-amber-400 font-medium text-sm mb-1">
            <AlertTriangle className="w-4 h-4" /> Saved with warnings
          </div>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-0.5">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="author">Author</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSection s={s} set={set} />
        </TabsContent>
        <TabsContent value="features" className="space-y-6">
          <FeatureTogglesSection s={s} set={set} />
        </TabsContent>
        <TabsContent value="publishing" className="space-y-6">
          <PublishingSection s={s} set={set} />
        </TabsContent>
        <TabsContent value="safety" className="space-y-6">
          <PublishingSafetySection s={s} set={set} />
        </TabsContent>
        <TabsContent value="ai" className="space-y-6">
          <AiDefaultsSection s={s} set={set} />
          <AiLimitsSection s={s} set={set} />
        </TabsContent>
        <TabsContent value="quality" className="space-y-6">
          <ContentQualitySection s={s} set={set} />
        </TabsContent>
        <TabsContent value="seo" className="space-y-6">
          <SeoDefaultsSection s={s} set={set} />
          <SeoAutomationSection s={s} set={set} />
        </TabsContent>
        <TabsContent value="author" className="space-y-6">
          <AuthorSection s={s} set={set} />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-6">
          <NotificationsSection s={s} set={set} />
        </TabsContent>
        <TabsContent value="permissions" className="space-y-6">
          <PermissionsSection s={s} set={set} />
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button className="gap-2" onClick={save} disabled={saving}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </div>
  );
}