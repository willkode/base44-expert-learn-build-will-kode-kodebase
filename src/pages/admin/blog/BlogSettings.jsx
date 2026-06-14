import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Save } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

import GeneralSection from "@/components/admin/blog/settings/GeneralSection";
import FeatureTogglesSection from "@/components/admin/blog/settings/FeatureTogglesSection";
import PublishingSafetySection from "@/components/admin/blog/settings/PublishingSafetySection";
import AiDefaultsSection from "@/components/admin/blog/settings/AiDefaultsSection";
import AiLimitsSection from "@/components/admin/blog/settings/AiLimitsSection";
import ContentQualitySection from "@/components/admin/blog/settings/ContentQualitySection";
import SeoAutomationSection from "@/components/admin/blog/settings/SeoAutomationSection";
import NotificationsSection from "@/components/admin/blog/settings/NotificationsSection";
import PermissionsSection from "@/components/admin/blog/settings/PermissionsSection";

export default function BlogSettings() {
  const { toast } = useToast();
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.functions
      .invoke("getBlogSettings", {})
      .then((res) => setS(res.data?.settings || {}))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, value) => setS((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await base44.functions.invoke("updateBlogSettings", { settings: s });
      if (res.data?.settings) setS(res.data.settings);
      toast({ title: "Settings saved", description: "Your blog settings have been updated." });
    } catch (err) {
      const data = err?.response?.data;
      toast({
        variant: "destructive",
        title: "Couldn't save settings",
        description: (data?.errors || [data?.error || "Please review your changes and try again."]).join(" "),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !s) return <LoadingState label="Loading blog settings..." />;

  return (
    <div>
      <PageHeader
        title="Blog Settings"
        description="Configure publishing safety, AI limits, content quality, notifications, and permissions."
        actions={
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save changes
          </Button>
        }
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="safety">Publishing Safety</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="quality">Content Quality</TabsTrigger>
          <TabsTrigger value="seo">SEO Automation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSection s={s} set={set} />
        </TabsContent>
        <TabsContent value="features" className="space-y-6">
          <FeatureTogglesSection s={s} set={set} />
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
          <SeoAutomationSection s={s} set={set} />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-6">
          <NotificationsSection s={s} set={set} />
        </TabsContent>
        <TabsContent value="permissions" className="space-y-6">
          <PermissionsSection s={s} set={set} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}