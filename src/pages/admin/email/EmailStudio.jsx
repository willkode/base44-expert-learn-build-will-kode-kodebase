import React, { useState, useEffect } from "react";
import { Save, Send, AlertTriangle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import StudioGenerator from "@/components/admin/email/studio/StudioGenerator";
import StudioEditor from "@/components/admin/email/studio/StudioEditor";
import StudioPreview from "@/components/admin/email/studio/StudioPreview";
import TestSendDialog from "@/components/admin/email/studio/TestSendDialog";

const EMPTY_DRAFT = {
  name: "",
  subject: "",
  previewText: "",
  htmlContent: "",
  textContent: "",
  campaignType: "newsletter",
  aiPromptInput: "",
};

export default function EmailStudio() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingEnabled, setSendingEnabled] = useState(true);
  const [testOpen, setTestOpen] = useState(false);

  useEffect(() => {
    base44.analytics.track({ eventName: "email_studio_viewed" });
    base44.functions.invoke("checkResendConfiguration", {}).then((res) => {
      if (!res.data?.error) setSendingEnabled(!!res.data.sendingEnabled);
    });
  }, []);

  const handleGenerate = async ({ prompt, tone, campaignType }) => {
    setGenerating(true);
    const res = await base44.functions.invoke("generateEmailContent", { prompt, tone, campaignType });
    setGenerating(false);
    if (res.data?.error) {
      toast.error(res.data.error);
      return;
    }
    base44.analytics.track({ eventName: "email_studio_generated", properties: { campaign_type: campaignType } });
    setDraft((d) => ({
      ...d,
      name: d.name || prompt.slice(0, 60),
      subject: res.data.subject || "",
      previewText: res.data.previewText || "",
      htmlContent: res.data.htmlContent || "",
      textContent: res.data.textContent || "",
      campaignType,
      aiPromptInput: prompt,
    }));
    toast.success("Email generated — edit and preview below.");
  };

  const handleSaveDraft = async () => {
    if (!draft.subject && !draft.htmlContent) {
      toast.error("Generate or write an email before saving.");
      return;
    }
    setSaving(true);
    const campaign = await base44.entities.EmailCampaign.create({
      name: draft.name || draft.subject || "Untitled draft",
      campaignType: draft.campaignType,
      subject: draft.subject,
      previewText: draft.previewText,
      htmlContent: draft.htmlContent,
      textContent: draft.textContent,
      aiPromptInput: draft.aiPromptInput,
      sendStatus: "draft",
      approvalStatus: "draft",
    });
    setSaving(false);
    base44.analytics.track({ eventName: "email_studio_draft_saved" });
    toast.success("Saved as campaign draft.");
    navigate("/admin/marketing/email/campaigns");
    return campaign;
  };

  return (
    <div>
      <PageHeader
        title="Email Studio"
        description="Generate, edit, preview, test and approve emails with AI."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" disabled={!sendingEnabled || !draft.subject} onClick={() => setTestOpen(true)}>
              <Send className="w-4 h-4 mr-2" /> Test send
            </Button>
            <Button disabled={saving} onClick={handleSaveDraft}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save as draft
            </Button>
          </div>
        }
      />

      {!sendingEnabled && (
        <div className="flex items-start gap-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-5">
          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-200">
            Test sending is disabled — Resend is not fully configured (API key and from email required).{" "}
            <Link to="/admin/marketing/email/settings" className="underline font-medium">Configure Resend</Link>
            . You can still generate, edit and save drafts.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <StudioGenerator onGenerate={handleGenerate} generating={generating} />
          <StudioEditor draft={draft} onChange={setDraft} />
        </div>
        <div className="lg:sticky lg:top-4 self-start">
          <StudioPreview draft={draft} />
        </div>
      </div>

      <TestSendDialog open={testOpen} onOpenChange={setTestOpen} draft={draft} />
    </div>
  );
}