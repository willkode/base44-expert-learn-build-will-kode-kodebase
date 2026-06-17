import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, CalendarClock, Instagram } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InstagramAccountSelector from "./InstagramAccountSelector";
import InstagramSetupForm from "./InstagramSetupForm";
import InstagramAssistantPanel from "./InstagramAssistantPanel";
import InstagramPreview from "./InstagramPreview";
import InstagramEmptyState from "./InstagramEmptyState";
import { EMPTY_INSTAGRAM_PAYLOAD, validateInstagramPayload } from "./instagramConfig";

function seedFromPost(post, account) {
  const v = (post && post.platform_variants) || {};
  const media = (v.instagram_media_urls && v.instagram_media_urls.length)
    ? v.instagram_media_urls
    : (post?.image_url ? [post.image_url] : []);
  return {
    ...EMPTY_INSTAGRAM_PAYLOAD,
    instagram_business_account_id:
      account?.selected_default_instagram_account_id || account?.instagram_business_account_id || "",
    media_type: v.instagram_media_type || "image",
    media_urls: media,
    caption: v.instagram_caption || post?.content || "",
    hashtags: v.instagram_hashtags || [],
    first_comment: v.instagram_first_comment || "",
    alt_text: v.instagram_alt_text || post?.image_alt_text || "",
  };
}

// Combines Instagram account selection, composer, AI assistant, and preview, then schedules.
export default function InstagramScheduleDialog({ open, onOpenChange, post, onScheduled }) {
  const [ig, setIg] = useState(EMPTY_INSTAGRAM_PAYLOAD);
  const [account, setAccount] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !post) return;
    base44.entities.SocialAccount.filter({ account_id: "global", platform: "instagram" }, "-last_connected_at", 1)
      .then((accs) => {
        const acc = accs[0] || null;
        setAccount(acc);
        setIg(seedFromPost(post, acc));
      });
    setScheduledAt("");
  }, [open, post]);

  const { errors } = validateInstagramPayload(ig);
  const igId = ig.instagram_business_account_id
    || account?.selected_default_instagram_account_id
    || account?.instagram_business_account_id
    || "";
  const noAccount = !account || account.connection_status !== "connected" || !igId;

  const submit = async () => {
    if (!scheduledAt) { toast.error("Pick a date and time."); return; }
    if (new Date(scheduledAt).getTime() <= Date.now()) { toast.error("Cannot schedule in the past."); return; }
    if (errors.length) { toast.error("Fix the required fields first."); return; }

    setSubmitting(true);
    try {
      const overrides = {
        instagram_business_account_id: igId,
        media_type: ig.media_type || "image",
        media_urls: (ig.media_urls || []).filter((m) => (m || "").trim()),
        caption: ig.caption || "",
        hashtags: (ig.hashtags || []).filter((h) => (h || "").trim()),
        first_comment: ig.first_comment || "",
        alt_text: ig.alt_text || "",
        share_to_feed: ig.share_to_feed !== false,
      };
      const res = await base44.functions.invoke("scheduleSocialPost", {
        social_post_id: post.id,
        platform_jobs: [{
          platform: "instagram",
          social_account_id: account.id,
          scheduled_at: new Date(scheduledAt).toISOString(),
          overrides,
        }],
        timezone: post.timezone || "America/Chicago",
      });
      const data = res?.data || {};
      if (data.error) throw new Error(data.error);
      if (!data.success) throw new Error((data.errors && data.errors[0]) || "Could not schedule.");
      toast.success("Instagram post scheduled.");
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
            <Instagram className="w-4 h-4 text-primary" /> Schedule Instagram post
          </DialogTitle>
          <DialogDescription>
            Build the visual post, refine the caption with AI, and review the preview before scheduling.
          </DialogDescription>
        </DialogHeader>

        {noAccount && <InstagramEmptyState />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-5">
            <InstagramAccountSelector
              account={account}
              value={ig.instagram_business_account_id}
              onChange={(id) => setIg((s) => ({ ...s, instagram_business_account_id: id }))}
            />
            <InstagramSetupForm ig={ig} onChange={setIg} />
            <InstagramAssistantPanel
              ig={ig}
              campaignId={post?.campaign_id}
              onApply={(patch) => setIg((s) => ({ ...s, ...patch }))}
            />
          </div>
          <div className="space-y-4">
            <InstagramPreview ig={ig} account={account} />
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