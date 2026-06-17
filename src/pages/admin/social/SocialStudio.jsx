import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Sparkles, RefreshCw, Save, Send, Check, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import StudioGeneratorForm from "@/components/admin/social/studio/StudioGeneratorForm";
import PlatformVariantEditor from "@/components/admin/social/studio/PlatformVariantEditor";
import GlobalAssetsPanel from "@/components/admin/social/studio/GlobalAssetsPanel";
import StudioImagePanel from "@/components/admin/social/studio/StudioImagePanel";
import { EMPTY_STUDIO_FORM } from "@/components/admin/social/studio/studioConfig";
import { saveStudioPosts } from "@/components/admin/social/studio/studioSave";
import { trackEvent } from "@/lib/analytics";

export default function SocialStudio() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState(EMPTY_STUDIO_FORM);
  const [result, setResult] = useState(null);
  const [selectedIndexes, setSelectedIndexes] = useState({});
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState(null); // "all" | platform key | asset target
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    trackEvent("admin_social_studio_view");
    base44.entities.SocialCampaign.list("-created_date", 100).then((c) => {
      setCampaigns(c);
      setLoading(false);
    });
  }, []);

  const selectedCampaign = campaigns.find((c) => c.id === form.campaign_id) || null;

  const callGenerate = async (overrides = {}) => {
    const res = await base44.functions.invoke("generateSocialContent", {
      campaign_id: form.campaign_id || undefined,
      selected_platforms: form.selected_platforms,
      topic: form.topic,
      content_type: form.content_type,
      tone: form.tone,
      number_of_variations: form.number_of_variations,
      include_hashtags: form.include_hashtags,
      include_image_prompt: form.include_image_prompt,
      include_call_to_action: form.include_call_to_action,
      custom_instructions: form.custom_instructions,
      source_text: form.source_text,
      ...overrides,
    });
    if (res?.data?.error) throw new Error(res.data.error);
    return res.data.result;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const r = await callGenerate();
      setResult(r);
      // Default-select first variant per platform.
      const defaults = {};
      Object.keys(r.platform_variants || {}).forEach((p) => { defaults[p] = 0; });
      setSelectedIndexes(defaults);
      trackEvent("admin_social_content_generated", { platforms: form.selected_platforms.join(",") });
      toast.success("Content generated.");
    } catch (e) {
      toast.error(e.message || "Generation failed.");
    }
    setGenerating(false);
  };

  const handleRegenerateAll = async () => {
    setRegenerating("all");
    try {
      const r = await callGenerate();
      setResult(r);
      const defaults = {};
      Object.keys(r.platform_variants || {}).forEach((p) => { defaults[p] = 0; });
      setSelectedIndexes(defaults);
      toast.success("Regenerated all content.");
    } catch (e) {
      toast.error(e.message || "Regeneration failed.");
    }
    setRegenerating(null);
  };

  const handleRegeneratePlatform = async (platform) => {
    setRegenerating(platform);
    try {
      const r = await callGenerate({ only_platforms: [platform], regenerate_target: platform });
      setResult((prev) => ({
        ...prev,
        platform_variants: { ...prev.platform_variants, [platform]: r.platform_variants?.[platform] || [] },
      }));
      setSelectedIndexes((prev) => ({ ...prev, [platform]: 0 }));
      toast.success(`Regenerated ${platform} content.`);
    } catch (e) {
      toast.error(e.message || "Regeneration failed.");
    }
    setRegenerating(null);
  };

  const handleRegenerateAsset = async (target) => {
    setRegenerating(target);
    try {
      const r = await callGenerate({ regenerate_target: target });
      setResult((prev) => {
        const next = { ...prev };
        if (target === "hashtags") next.global_hashtags = r.global_hashtags || prev.global_hashtags;
        if (target === "cta") next.cta = r.cta || prev.cta;
        if (target === "image_prompt") {
          next.image_prompt = r.image_prompt || prev.image_prompt;
          next.image_alt_text = r.image_alt_text || prev.image_alt_text;
        }
        return next;
      });
      toast.success("Regenerated.");
    } catch (e) {
      toast.error(e.message || "Regeneration failed.");
    }
    setRegenerating(null);
  };

  const handleVariantChange = (platform, variants) => {
    setResult((prev) => ({
      ...prev,
      platform_variants: { ...prev.platform_variants, [platform]: variants },
    }));
  };

  const handleSelect = (platform, idx) => {
    setSelectedIndexes((prev) => ({ ...prev, [platform]: idx }));
  };

  const doSave = async (approvalStatus, successMsg) => {
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const created = await saveStudioPosts({
        result,
        selectedIndexes,
        form,
        campaign: selectedCampaign,
        user,
        approvalStatus,
      });
      trackEvent("admin_social_content_saved", { approval_status: approvalStatus, count: created.length });
      toast.success(`${successMsg} (${created.length} post${created.length === 1 ? "" : "s"})`);
    } catch (e) {
      toast.error(e.message || "Save failed.");
    }
    setSaving(false);
  };

  if (loading) return <LoadingState label="Loading content studio..." />;

  const platformKeys = result ? Object.keys(result.platform_variants || {}) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Studio"
        description="Generate platform-specific posts, refine every field, and send for approval."
        actions={
          result && (
            <Button variant="outline" onClick={handleRegenerateAll} disabled={!!regenerating}>
              {regenerating === "all" ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
              Regenerate all
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: generator + shared assets */}
        <div className="xl:col-span-2 space-y-6">
          <StudioGeneratorForm
            form={form}
            setForm={setForm}
            campaigns={campaigns}
            onGenerate={handleGenerate}
            generating={generating}
          />
          {result && (
            <GlobalAssetsPanel
              result={result}
              onChange={setResult}
              onRegenerate={handleRegenerateAsset}
              regenerating={regenerating}
            />
          )}
          {result && (
            <StudioImagePanel
              result={result}
              onChange={setResult}
              selectedPlatforms={form.selected_platforms}
              includeTextOnImage={false}
            />
          )}
        </div>

        {/* Right: per-platform variants */}
        <div className="xl:col-span-3 space-y-4">
          {!result ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 flex flex-col items-center justify-center text-center py-20 px-6">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-5">
                <Sparkles className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-sora font-semibold text-lg mb-2">No content yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Fill in a topic, pick your platforms, and hit Generate to create tailored variants for each network.
              </p>
            </div>
          ) : (
            <>
              {platformKeys.map((platform) => (
                <PlatformVariantEditor
                  key={platform}
                  platform={platform}
                  variants={result.platform_variants[platform]}
                  selectedIndex={selectedIndexes[platform]}
                  onSelect={handleSelect}
                  onChange={handleVariantChange}
                  onRegenerate={handleRegeneratePlatform}
                  regenerating={regenerating === platform}
                />
              ))}

              <div className="sticky bottom-0 rounded-2xl border border-border bg-card/95 backdrop-blur p-4 flex flex-wrap gap-2">
                <Button onClick={() => doSave("draft", "Saved as draft")} disabled={saving} variant="outline">
                  {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                  Save as draft
                </Button>
                <Button onClick={() => doSave("needs_review", "Submitted for approval")} disabled={saving}>
                  <Send className="w-4 h-4 mr-1.5" /> Submit for approval
                </Button>
                <Button onClick={() => doSave("approved", "Approved")} disabled={saving} variant="outline">
                  <Check className="w-4 h-4 mr-1.5" /> Approve now
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}