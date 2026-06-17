import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, CalendarClock, MessageSquare } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RedditSetupForm from "./RedditSetupForm";
import RedditAssistantPanel from "./RedditAssistantPanel";
import RedditPreview from "./RedditPreview";
import { EMPTY_REDDIT_PAYLOAD, validateRedditPayload, cleanSubreddit } from "./redditConfig";

function seedFromPost(post, account) {
  const v = (post && post.platform_variants) || {};
  return {
    ...EMPTY_REDDIT_PAYLOAD,
    subreddit: cleanSubreddit(account?.platform_username || ""),
    title: v.reddit_title || post?.title_internal || "",
    body: v.reddit_body || post?.content || "",
    media_url: post?.image_url || "",
  };
}

// Combines Reddit setup, AI assistant, and preview, then schedules the post.
export default function RedditScheduleDialog({ open, onOpenChange, post, onScheduled }) {
  const [reddit, setReddit] = useState(EMPTY_REDDIT_PAYLOAD);
  const [account, setAccount] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !post) return;
    base44.entities.SocialAccount.filter({ account_id: "global", platform: "reddit" }, "-last_connected_at", 1)
      .then((accs) => {
        const acc = accs[0] || null;
        setAccount(acc);
        setReddit(seedFromPost(post, acc));
      });
    setScheduledAt("");
  }, [open, post]);

  const { errors } = validateRedditPayload(reddit);
  const noAccount = !account || account.connection_status !== "connected";

  const submit = async () => {
    if (!scheduledAt) { toast.error("Pick a date and time."); return; }
    if (new Date(scheduledAt).getTime() <= Date.now()) { toast.error("Cannot schedule in the past."); return; }
    if (errors.length) { toast.error("Fix the required fields first."); return; }

    setSubmitting(true);
    try {
      const overrides = {
        subreddit: reddit.subreddit,
        reddit_post_kind: reddit.reddit_post_kind,
        title: reddit.title,
        body: reddit.body,
        link_url: reddit.link_url,
        media_urls: reddit.media_url ? [reddit.media_url] : [],
        flair_id: reddit.flair_id,
        flair_text: reddit.flair_text,
        nsfw: reddit.nsfw,
        spoiler: reddit.spoiler,
        send_replies: reddit.send_replies !== false,
        suggested_comment: reddit.suggested_comment,
        promotion_disclosure: reddit.promotion_disclosure,
        subreddit_rules_notes: reddit.subreddit_rules_notes,
      };
      const res = await base44.functions.invoke("scheduleSocialPost", {
        social_post_id: post.id,
        platform_jobs: [{
          platform: "reddit",
          social_account_id: account.id,
          scheduled_at: new Date(scheduledAt).toISOString(),
          overrides,
        }],
        timezone: post.timezone || "America/Chicago",
      });
      const data = res?.data || {};
      if (data.error) throw new Error(data.error);
      if (!data.success) throw new Error((data.errors && data.errors[0]) || "Could not schedule.");
      toast.success("Reddit post scheduled.");
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
            <MessageSquare className="w-4 h-4 text-primary" /> Schedule Reddit post
          </DialogTitle>
          <DialogDescription>
            Reddit communities have unique rules and dislike ads. Set up the submission, refine it with AI, and review before scheduling.
          </DialogDescription>
        </DialogHeader>

        {noAccount && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
            No connected Reddit account found. Connect Reddit before scheduling.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-5">
            <RedditSetupForm reddit={reddit} onChange={setReddit} />
            <RedditAssistantPanel
              reddit={reddit}
              topic={post?.ai_generation_input || post?.title_internal || ""}
              campaignId={post?.campaign_id}
              onApply={(patch) => setReddit((r) => ({ ...r, ...patch }))}
            />
          </div>
          <div className="space-y-4">
            <RedditPreview reddit={reddit} />
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