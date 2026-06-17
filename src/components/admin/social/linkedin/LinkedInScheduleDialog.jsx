import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, CalendarClock, Linkedin } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LinkedInSetupForm from "./LinkedInSetupForm";
import LinkedInAssistantPanel from "./LinkedInAssistantPanel";
import LinkedInPreview from "./LinkedInPreview";
import { EMPTY_LINKEDIN_PAYLOAD, validateLinkedInPayload } from "./linkedinConfig";

function seedFromPost(post, account) {
  const v = (post && post.platform_variants) || {};
  const defaultUrn = account?.selected_default_author_urn || account?.linkedin_person_urn || "";
  const isOrg = !!defaultUrn && (account?.linkedin_organization_urns || []).includes(defaultUrn);
  return {
    ...EMPTY_LINKEDIN_PAYLOAD,
    author_urn: defaultUrn,
    author_type: isOrg ? "organization" : "person",
    commentary: v.linkedin_text || post?.content || "",
    media_url: post?.image_url || "",
    media_title: post?.image_alt_text || "",
  };
}

// Combines LinkedIn setup, AI assistant, and preview, then schedules the post.
export default function LinkedInScheduleDialog({ open, onOpenChange, post, onScheduled }) {
  const [linkedin, setLinkedin] = useState(EMPTY_LINKEDIN_PAYLOAD);
  const [account, setAccount] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !post) return;
    base44.entities.SocialAccount.filter({ account_id: "global", platform: "linkedin" }, "-last_connected_at", 1)
      .then((accs) => {
        const acc = accs[0] || null;
        setAccount(acc);
        setLinkedin(seedFromPost(post, acc));
      });
    setScheduledAt("");
  }, [open, post]);

  const { errors } = validateLinkedInPayload(linkedin, account);
  const noAccount = !account || account.connection_status !== "connected";

  const submit = async () => {
    if (!scheduledAt) { toast.error("Pick a date and time."); return; }
    if (new Date(scheduledAt).getTime() <= Date.now()) { toast.error("Cannot schedule in the past."); return; }
    if (errors.length) { toast.error("Fix the required fields first."); return; }

    setSubmitting(true);
    try {
      const overrides = {
        author_urn: linkedin.author_urn,
        author_type: linkedin.author_type,
        commentary: linkedin.commentary,
        visibility: linkedin.visibility,
        media_url: linkedin.media_url,
        media_title: linkedin.media_title,
        organization_role_confirmed: linkedin.organization_role_confirmed,
      };
      const res = await base44.functions.invoke("scheduleSocialPost", {
        social_post_id: post.id,
        platform_jobs: [{
          platform: "linkedin",
          social_account_id: account.id,
          scheduled_at: new Date(scheduledAt).toISOString(),
          overrides,
        }],
        timezone: post.timezone || "America/Chicago",
      });
      const data = res?.data || {};
      if (data.error) throw new Error(data.error);
      if (!data.success) throw new Error((data.errors && data.errors[0]) || "Could not schedule.");
      toast.success("LinkedIn post scheduled.");
      onOpenChange(false);
      onScheduled?.();
    } catch (e) {
      toast.error(e.message || "Scheduling failed.");
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Linkedin className="w-4 h-4 text-primary" /> Schedule LinkedIn post
          </DialogTitle>
          <DialogDescription>
            Choose who posts (you or a page), refine the copy with AI, and review before scheduling.
          </DialogDescription>
        </DialogHeader>

        {noAccount && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
            No connected LinkedIn account found. Connect LinkedIn before scheduling.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-5">
            <LinkedInSetupForm linkedin={linkedin} onChange={setLinkedin} account={account} />
            <LinkedInAssistantPanel
              linkedin={linkedin}
              topic={post?.ai_generation_input || post?.title_internal || ""}
              campaignId={post?.campaign_id}
              onApply={(patch) => setLinkedin((l) => ({ ...l, ...patch }))}
            />
          </div>
          <div className="space-y-4">
            <LinkedInPreview linkedin={linkedin} account={account} />
            <div>
              <Label className="mb-1 block text-xs text-muted-foreground">Schedule for</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={submit} disabled={submitting || noAccount || errors.length > 0}>
            {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CalendarClock className="w-4 h-4 mr-1" />}
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}