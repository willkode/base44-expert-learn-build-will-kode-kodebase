import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import BrandEmptyState from "@/components/admin/social/brand/BrandEmptyState";
import BrandSetupWizard from "@/components/admin/social/brand/BrandSetupWizard";
import BrandEditForm from "@/components/admin/social/brand/BrandEditForm";
import { EMPTY_BRAND, brandToPayload, validateBrand } from "@/components/admin/social/brand/brandConfig";

// Which fields belong to which wizard step (for per-step validation).
const STEP_FIELDS = {
  basics: ["brand_name", "website_url", "short_description"],
  audience: ["audience"],
  voice: [],
  visual: [],
};

export default function SocialBrandProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null); // existing entity record or null
  const [draft, setDraft] = useState(EMPTY_BRAND);
  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState("view"); // "view" | "wizard" | "edit"

  useEffect(() => {
    trackEvent("admin_social_brand_view");
    base44.entities.BrandProfile.filter({ account_id: "global" }, "-created_date", 1).then((list) => {
      const existing = list[0] || null;
      setProfile(existing);
      if (existing) {
        setDraft({ ...EMPTY_BRAND, ...existing });
        setMode("edit");
      } else {
        setMode("empty");
      }
      setLoading(false);
    });
  }, []);

  const set = (field, value) => {
    setDraft((d) => ({ ...d, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validateStep = (stepKey) => {
    const all = validateBrand(draft);
    const fields = STEP_FIELDS[stepKey] || [];
    const stepErrors = {};
    fields.forEach((f) => {
      if (all[f]) stepErrors[f] = all[f];
    });
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSave = async () => {
    const validation = validateBrand(draft);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }
    setSaving(true);
    const payload = brandToPayload(draft);
    let saved;
    if (profile) {
      saved = await base44.entities.BrandProfile.update(profile.id, payload);
      saved = saved || { ...profile, ...payload };
    } else {
      saved = await base44.entities.BrandProfile.create(payload);
    }
    setSaving(false);
    setProfile(saved && saved.id ? saved : { ...(profile || {}), ...payload });
    trackEvent("admin_social_brand_saved", { is_new: !profile });
    toast.success("Brand profile saved.");
    setMode("edit");
  };

  if (loading) return <LoadingState label="Loading brand profile..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand Profile"
        description="Teach the AI your brand so every generated post sounds and looks like you."
        actions={
          mode === "edit" && profile ? (
            <Button variant="outline" onClick={() => setMode("wizard")}>
              <Pencil className="w-4 h-4 mr-1.5" /> Guided setup
            </Button>
          ) : null
        }
      />

      {mode === "empty" && <BrandEmptyState onStart={() => setMode("wizard")} />}

      {mode === "wizard" && (
        <BrandSetupWizard
          draft={draft}
          set={set}
          errors={errors}
          validateStep={validateStep}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {mode === "edit" && (
        <BrandEditForm draft={draft} set={set} errors={errors} onSave={handleSave} saving={saving} />
      )}
    </div>
  );
}