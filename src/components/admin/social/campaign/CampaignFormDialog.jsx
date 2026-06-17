import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import FieldGroup from "@/components/admin/social/brand/FieldGroup";
import TagInput from "@/components/admin/social/brand/TagInput";
import { PLATFORMS } from "@/components/admin/social/socialConfig";
import {
  EMPTY_CAMPAIGN, CAMPAIGN_GOALS, CAMPAIGN_STATUSES, FREQUENCY_OPTIONS,
  campaignToPayload, validateCampaign,
} from "./campaignConfig";
import { trackEvent } from "@/lib/analytics";

export default function CampaignFormDialog({ open, onOpenChange, campaign, onSaved }) {
  const [draft, setDraft] = useState(EMPTY_CAMPAIGN);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const editing = !!campaign;

  useEffect(() => {
    if (open) {
      setDraft(campaign ? { ...EMPTY_CAMPAIGN, ...campaign } : EMPTY_CAMPAIGN);
      setErrors({});
    }
  }, [open, campaign]);

  const set = (field, value) => {
    setDraft((d) => ({ ...d, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const togglePlatform = (key) =>
    set("default_platforms", draft.default_platforms.includes(key)
      ? draft.default_platforms.filter((p) => p !== key)
      : [...draft.default_platforms, key]);

  const handleSubmit = async () => {
    const validation = validateCampaign(draft);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    const payload = campaignToPayload(draft);
    let saved;
    if (editing) {
      saved = await base44.entities.SocialCampaign.update(campaign.id, payload);
      saved = saved && saved.id ? saved : { ...campaign, ...payload };
    } else {
      saved = await base44.entities.SocialCampaign.create(payload);
    }
    setSaving(false);
    trackEvent(editing ? "admin_social_campaign_updated" : "admin_social_campaign_created", { goal: payload.goal });
    toast.success(editing ? "Campaign updated." : "Campaign created.");
    onSaved && onSaved(saved);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Campaign" : "New Campaign"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <FieldGroup label="Campaign name" required error={errors.name}>
            <Input value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="Spring Launch 2026" />
          </FieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Campaign goal">
              <select
                value={draft.goal}
                onChange={(e) => set("goal", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {CAMPAIGN_GOALS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Status">
              <select
                value={draft.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {CAMPAIGN_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </FieldGroup>
          </div>

          <FieldGroup label="Campaign description">
            <Textarea rows={2} value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="What this campaign is about and why it matters." />
          </FieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Start date">
              <Input type="date" value={draft.start_date || ""} onChange={(e) => set("start_date", e.target.value)} />
            </FieldGroup>
            <FieldGroup label="End date" error={errors.end_date}>
              <Input type="date" value={draft.end_date || ""} onChange={(e) => set("end_date", e.target.value)} />
            </FieldGroup>
          </div>

          <FieldGroup label="Target audience">
            <Textarea rows={2} value={draft.target_audience} onChange={(e) => set("target_audience", e.target.value)} placeholder="Who this campaign speaks to." />
          </FieldGroup>

          <FieldGroup label="Offer / product being promoted">
            <Textarea rows={2} value={draft.offer_details} onChange={(e) => set("offer_details", e.target.value)} placeholder="The product, offer, or discount featured." />
          </FieldGroup>

          <FieldGroup label="Landing page URL" error={errors.landing_page_url}>
            <Input value={draft.landing_page_url} onChange={(e) => set("landing_page_url", e.target.value)} placeholder="https://..." />
          </FieldGroup>

          <FieldGroup label="Key message" hint="The core idea every post should reinforce.">
            <Textarea rows={2} value={draft.key_message} onChange={(e) => set("key_message", e.target.value)} placeholder="Ship production apps in days, not months." />
          </FieldGroup>

          <TagInput
            label="Content themes"
            value={draft.content_themes}
            onChange={(v) => set("content_themes", v)}
            placeholder="Add a theme and press Enter"
            hint="Recurring angles, e.g. tips, case studies, behind-the-scenes."
          />

          <FieldGroup label="Default platforms" required error={errors.default_platforms}>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePlatform(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    draft.default_platforms.includes(key)
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup label="Posting frequency">
            <select
              value={draft.posting_frequency}
              onChange={(e) => set("posting_frequency", e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {FREQUENCY_OPTIONS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </FieldGroup>

          <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-4 py-3">
            <div>
              <Label className="block">Approval required</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Posts must be approved before publishing.</p>
            </div>
            <Switch checked={draft.approval_required !== false} onCheckedChange={(v) => set("approval_required", v)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
            {editing ? "Save changes" : "Create campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}