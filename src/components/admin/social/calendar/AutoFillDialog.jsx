import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Wand2, Loader2, ArrowLeft, CalendarPlus, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PLATFORMS } from "@/components/admin/social/socialConfig";
import { CONTENT_MIX_OPTIONS, DEFAULT_AUTOFILL } from "./autoFillConfig";
import AutoFillPlanRow from "./AutoFillPlanRow";
import { trackEvent } from "@/lib/analytics";

export default function AutoFillDialog({ open, onOpenChange, onScheduled }) {
  const [step, setStep] = useState("config"); // config | preview
  const [form, setForm] = useState(DEFAULT_AUTOFILL());
  const [campaigns, setCampaigns] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [plan, setPlan] = useState([]);
  const [accountWarnings, setAccountWarnings] = useState([]);
  const [tz, setTz] = useState("America/Chicago");

  useEffect(() => {
    if (!open) return;
    setStep("config");
    setPlan([]);
    Promise.all([
      base44.entities.SocialCampaign.list("-created_date", 200),
      base44.entities.PostingSchedule.filter({ is_active: true }, "-created_date", 50),
    ]).then(([c, s]) => { setCampaigns(c); setSchedules(s); });
  }, [open]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const togglePlatform = (key) =>
    set("selected_platforms", form.selected_platforms.includes(key)
      ? form.selected_platforms.filter((p) => p !== key)
      : [...form.selected_platforms, key]);
  const toggleMix = (key) =>
    set("content_mix", form.content_mix.includes(key)
      ? form.content_mix.filter((m) => m !== key)
      : [...form.content_mix, key]);

  const generatePlan = async () => {
    if (!form.campaign_id) { toast.error("Choose a campaign."); return; }
    if (form.selected_platforms.length === 0) { toast.error("Select at least one platform."); return; }
    setGenerating(true);
    trackEvent("admin_social_autofill_generate", { posts: form.number_of_posts });
    try {
      const { data } = await base44.functions.invoke("generateAndScheduleCampaignContent", { ...form, mode: "plan" });
      if (!data?.success) { toast.error(data?.error || "Could not build a plan."); return; }
      setPlan(data.plan || []);
      setAccountWarnings(data.account_warnings || []);
      setTz(data.timezone || "America/Chicago");
      setStep("preview");
    } catch (e) {
      toast.error(e.message || "Could not build a plan.");
    } finally {
      setGenerating(false);
    }
  };

  const confirmSchedule = async () => {
    if (plan.length === 0) { toast.error("The plan is empty."); return; }
    setConfirming(true);
    trackEvent("admin_social_autofill_confirm", { posts: plan.length, approval_mode: form.approval_mode });
    try {
      const { data } = await base44.functions.invoke("generateAndScheduleCampaignContent", { ...form, mode: "confirm", plan, timezone: tz });
      if (!data?.success) { toast.error(data?.error || "Could not schedule the plan."); return; }
      toast.success(`Created ${data.created_count} post(s), scheduled ${data.scheduled_count}.${data.approval_status !== "approved" ? " Posts await review." : ""}`);
      onOpenChange(false);
      onScheduled?.();
    } catch (e) {
      toast.error(e.message || "Could not schedule the plan.");
    } finally {
      setConfirming(false);
    }
  };

  const updateItem = (idx, next) => setPlan((p) => p.map((it, i) => (i === idx ? next : it)));
  const removeItem = (idx) => setPlan((p) => p.filter((_, i) => i !== idx));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            {step === "config" ? "Auto-Fill Calendar" : "Review & edit plan"}
          </DialogTitle>
        </DialogHeader>

        {step === "config" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Campaign <span className="text-primary">*</span></Label>
                <select value={form.campaign_id} onChange={(e) => set("campaign_id", e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="">Select a campaign…</option>
                  {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block">Posting schedule</Label>
                <select value={form.posting_schedule_id} onChange={(e) => set("posting_schedule_id", e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="">Recommended times</option>
                  {schedules.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block">Start date</Label>
                <Input type="date" value={form.date_range_start} onChange={(e) => set("date_range_start", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 block">End date</Label>
                <Input type="date" value={form.date_range_end} onChange={(e) => set("date_range_end", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 block">Number of posts</Label>
                <Input type="number" min={1} max={30} value={form.number_of_posts} onChange={(e) => set("number_of_posts", Number(e.target.value))} />
              </div>
              <div>
                <Label className="mb-1.5 block">Approval mode</Label>
                <select value={form.approval_mode} onChange={(e) => set("approval_mode", e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="require_review">Require review</option>
                  <option value="auto_approve">Auto-approve (if campaign allows)</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(({ key, label, icon: Icon }) => (
                  <button key={key} type="button" onClick={() => togglePlatform(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${form.selected_platforms.includes(key) ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Content mix</Label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_MIX_OPTIONS.map((o) => (
                  <button key={o.key} type="button" onClick={() => toggleMix(o.key)}
                    className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${form.content_mix.includes(o.key) ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">Custom instructions</Label>
              <Textarea rows={2} value={form.custom_instructions} onChange={(e) => set("custom_instructions", e.target.value)} placeholder="Extra angle, must-include points, things to avoid…" />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2">
              <div>
                <span className="text-sm">Generate images on schedule</span>
                <p className="text-[11px] text-muted-foreground">Creates on-brand images for visual posts when confirmed.</p>
              </div>
              <Switch checked={form.generate_images} onCheckedChange={(v) => set("generate_images", v)} />
            </div>

            <DialogFooter>
              <Button onClick={generatePlan} disabled={generating} className="w-full sm:w-auto">
                {generating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1.5" />}
                Generate plan
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review, edit, or remove posts before scheduling. Auto-filled posts are scheduled for future times only and respect the approval workflow.
            </p>

            {accountWarnings.length > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
                {accountWarnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {w}
                  </div>
                ))}
              </div>
            )}

            {plan.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No posts left in the plan.</p>
            ) : (
              <div className="space-y-3">
                {plan.map((item, idx) => (
                  <AutoFillPlanRow key={idx} item={item} onChange={(next) => updateItem(idx, next)} onRemove={() => removeItem(idx)} />
                ))}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("config")} disabled={confirming}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
              <Button onClick={confirmSchedule} disabled={confirming || plan.length === 0}>
                {confirming ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <CalendarPlus className="w-4 h-4 mr-1.5" />}
                Confirm & schedule {plan.length} post{plan.length === 1 ? "" : "s"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}