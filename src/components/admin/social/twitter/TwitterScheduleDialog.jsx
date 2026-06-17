import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, CalendarClock, Twitter } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TwitterSetupForm from "./TwitterSetupForm";
import TwitterAssistantPanel from "./TwitterAssistantPanel";
import TwitterPreview from "./TwitterPreview";
import { EMPTY_TWITTER_PAYLOAD, validateTwitterPayload } from "./twitterConfig";

function seedFromPost(post) {
  const v = (post && post.platform_variants) || {};
  return {
    ...EMPTY_TWITTER_PAYLOAD,
    text: v.twitter_text || post?.content || "",
    thread: Array.isArray(v.twitter_thread) ? v.twitter_thread : [],
    media_url: post?.image_url || "",
  };
}

// Combines X/Twitter setup, AI assistant, and preview, then schedules the post.
export default function TwitterScheduleDialog({ open, onOpenChange, post, onScheduled }) {
  const [tw, setTw] = useState(EMPTY_TWITTER_PAYLOAD);
  const [account, setAccount] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !post) return;
    base44.entities.SocialAccount.filter({ account_id: "global", platform: "twitter" }, "-last_connected_at", 1)
      .then((accs) => {
        setAccount(accs[0] || null);
        setTw(seedFromPost(post));
      });
    setScheduledAt("");
  }, [open, post]);

  const { errors } = validateTwitterPayload(tw);
  const noAccount = !account || account.connection_status !== "connected";

  const submit = async () => {
    if (!scheduledAt) { toast.error("Pick a date and time."); return; }
    if (new Date(scheduledAt).getTime() <= Date.now()) { toast.error("Cannot schedule in the past."); return; }
    if (errors.length) { toast.error("Fix the required fields first."); return; }

    setSubmitting(true);
    try {
      const overrides = {
        text: tw.text,
        thread: (tw.thread || []).filter((t) => (t || "").trim()),
        media_url: tw.media_url || "",
        reply_settings: tw.reply_settings || "everyone",
        quote_post_id: tw.quote_post_id || "",
        poll_options: (tw.poll_options || []).filter((o) => (o || "").trim()),
      };
      const res = await base44.functions.invoke("scheduleSocialPost", {
        social_post_id: post.id,
        platform_jobs: [{
          platform: "twitter",
          social_account_id: account.id,
          scheduled_at: new Date(scheduledAt).toISOString(),
          overrides,
        }],
        timezone: post.timezone || "America/Chicago",
      });
      const data = res?.data || {};
      if (data.error) throw new Error(data.error);
      if (!data.success) throw new Error((data.errors && data.errors[0]) || "Could not schedule.");
      toast.success("X post scheduled.");
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
            <Twitter className="w-4 h-4 text-primary" /> Schedule X / Twitter post
          </DialogTitle>
          <DialogDescription>
            Set up the tweet or thread, refine it with AI, and review the preview before scheduling.
          </DialogDescription>
        </DialogHeader>

        {noAccount && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
            No connected X account found. Connect X before scheduling.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-5">
            <TwitterSetupForm tw={tw} onChange={setTw} />
            <TwitterAssistantPanel
              tw={tw}
              campaignId={post?.campaign_id}
              onApply={(patch) => setTw((t) => ({ ...t, ...patch }))}
            />
          </div>
          <div className="space-y-4">
            <TwitterPreview tw={tw} />
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