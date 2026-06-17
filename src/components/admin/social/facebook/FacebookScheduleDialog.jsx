import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, CalendarClock, Facebook } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FacebookSetupForm from "./FacebookSetupForm";
import FacebookAssistantPanel from "./FacebookAssistantPanel";
import FacebookPreview from "./FacebookPreview";
import { EMPTY_FACEBOOK_PAYLOAD, validateFacebookPayload } from "./facebookConfig";

function seedFromPost(post, account) {
  const v = (post && post.platform_variants) || {};
  const media = (v.facebook_media_urls && v.facebook_media_urls.length)
    ? v.facebook_media_urls
    : (post?.image_url ? [post.image_url] : []);
  return {
    ...EMPTY_FACEBOOK_PAYLOAD,
    facebook_page_id: account?.selected_default_facebook_page_id || account?.facebook_page_id || "",
    post_type: v.facebook_post_type || (media.length ? "photo" : (v.facebook_link_url ? "link" : "text")),
    message: v.facebook_text || post?.content || "",
    link_url: v.facebook_link_url || "",
    media_urls: media,
    call_to_action: v.facebook_cta || "",
  };
}

// Combines the Facebook composer, AI assistant, and preview, then schedules the post.
export default function FacebookScheduleDialog({ open, onOpenChange, post, onScheduled }) {
  const [fb, setFb] = useState(EMPTY_FACEBOOK_PAYLOAD);
  const [account, setAccount] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !post) return;
    base44.entities.SocialAccount.filter({ account_id: "global", platform: "facebook" }, "-last_connected_at", 1)
      .then((accs) => {
        const acc = accs[0] || null;
        setAccount(acc);
        setFb(seedFromPost(post, acc));
      });
    setScheduledAt("");
    setConfirmDuplicate(false);
  }, [open, post]);

  const { errors } = validateFacebookPayload(fb, account);
  const noAccount = !account || account.connection_status !== "connected";

  const submit = async () => {
    if (!scheduledAt) { toast.error("Pick a date and time."); return; }
    if (new Date(scheduledAt).getTime() <= Date.now()) { toast.error("Cannot schedule in the past."); return; }
    if (errors.length) { toast.error("Fix the required fields first."); return; }

    setSubmitting(true);
    try {
      const overrides = {
        facebook_page_id: fb.facebook_page_id || account.selected_default_facebook_page_id || account.facebook_page_id || "",
        message: fb.message || "",
        link_url: fb.link_url || "",
        media_urls: (fb.media_urls || []).filter(Boolean),
        post_type: fb.post_type || "text",
        call_to_action: fb.call_to_action || "",
      };
      const res = await base44.functions.invoke("scheduleSocialPost", {
        social_post_id: post.id,
        platform_jobs: [{
          platform: "facebook",
          social_account_id: account.id,
          scheduled_at: new Date(scheduledAt).toISOString(),
          overrides,
        }],
        timezone: post.timezone || "America/Chicago",
        allow_duplicates: confirmDuplicate,
      });
      const data = res?.data || {};
      if (data.error) throw new Error(data.error);
      if (!data.success) throw new Error((data.errors && data.errors[0]) || "Could not schedule.");
      toast.success("Facebook post scheduled.");
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
            <Facebook className="w-4 h-4 text-primary" /> Schedule Facebook Page post
          </DialogTitle>
          <DialogDescription>
            Set up the Page post, refine it with AI, and review the preview before scheduling.
          </DialogDescription>
        </DialogHeader>

        {noAccount && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
            No connected Facebook Page found. Connect a Page before scheduling.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-5">
            <FacebookSetupForm fb={fb} onChange={setFb} account={account} />
            <FacebookAssistantPanel
              fb={fb}
              topic={post?.ai_generation_input || post?.title_internal || ""}
              campaignId={post?.campaign_id}
              onApply={(patch) => setFb((f) => ({ ...f, ...patch }))}
            />
          </div>
          <div className="space-y-4">
            <FacebookPreview fb={fb} account={account} />
            <div>
              <Label className="mb-1 block text-xs text-muted-foreground">Schedule for</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox checked={confirmDuplicate} onCheckedChange={(v) => setConfirmDuplicate(!!v)} className="mt-0.5" />
              Allow a duplicate job for this Page (if one is already scheduled).
            </label>
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