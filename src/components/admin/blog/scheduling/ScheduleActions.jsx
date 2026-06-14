import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { CalendarClock, Rocket, X, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import PublishReadiness from "./PublishReadiness";
import { trackEvent } from "@/lib/analytics";
import { formatScheduled, localTimezone } from "@/lib/blogSchedule";

// Reusable scheduling/publishing controls for a single post.
// `post` must include id, status, scheduledAt, scheduledTimezone.
export default function ScheduleActions({ post, onChange, validation, validating, size = "sm" }) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [when, setWhen] = useState(post.scheduledAt ? post.scheduledAt.slice(0, 16) : "");
  const [busy, setBusy] = useState(false);

  const tz = localTimezone();
  const blocked = (validation?.errors?.length || 0) > 0;
  const isScheduled = post.status === "scheduled";
  const isPublished = post.status === "published";

  const call = async (fn, payload, successMsg, event) => {
    setBusy(true);
    try {
      const res = await base44.functions.invoke(fn, payload);
      if (res.data?.success) {
        toast.success(successMsg);
        trackEvent(event, { post_id: post.id });
        onChange?.(res.data.post);
        return true;
      }
      toast.error(res.data?.error || "Action failed");
      return false;
    } catch (err) {
      toast.error(err?.response?.data?.error || "Action failed");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitSchedule = async () => {
    if (!when) { toast.error("Pick a date and time"); return; }
    const iso = new Date(when).toISOString();
    const fn = isScheduled ? "rescheduleBlogPost" : "scheduleBlogPost";
    const ok = await call(
      fn,
      { blog_post_id: post.id, scheduled_at: iso, timezone: tz },
      isScheduled ? "Post rescheduled" : "Post scheduled",
      isScheduled ? "blog_post_rescheduled" : "blog_post_scheduled"
    );
    if (ok) setScheduleOpen(false);
  };

  const publishNow = async () => {
    const ok = await call(
      "publishBlogPostNow",
      { blog_post_id: post.id },
      "Post published",
      "blog_post_published_now"
    );
    if (ok) setConfirmPublish(false);
  };

  const cancelSchedule = () =>
    call("cancelScheduledBlogPost", { blog_post_id: post.id }, "Schedule cancelled", "blog_post_schedule_cancelled");

  if (isPublished) {
    return <span className="text-xs text-green-500">Published</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isScheduled ? (
        <>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <CalendarClock className="w-3.5 h-3.5 text-primary" />
            {formatScheduled(post.scheduledAt, post.scheduledTimezone)}
          </span>
          <Button variant="outline" size={size} onClick={() => { setWhen(post.scheduledAt?.slice(0, 16) || ""); setScheduleOpen(true); }} className="gap-1.5">
            <Pencil className="w-3.5 h-3.5" /> Reschedule
          </Button>
          <Button variant="ghost" size={size} onClick={cancelSchedule} disabled={busy} className="gap-1.5 text-muted-foreground">
            <X className="w-3.5 h-3.5" /> Cancel
          </Button>
        </>
      ) : (
        <Button variant="outline" size={size} onClick={() => setScheduleOpen(true)} className="gap-1.5">
          <CalendarClock className="w-3.5 h-3.5" /> Schedule
        </Button>
      )}
      <Button size={size} onClick={() => setConfirmPublish(true)} disabled={busy} className="gap-1.5">
        <Rocket className="w-3.5 h-3.5" /> Publish now
      </Button>

      {/* Schedule / reschedule modal */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isScheduled ? "Reschedule post" : "Schedule post"}</DialogTitle>
            <DialogDescription>
              The post will publish automatically at this time. Times use your timezone ({tz}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">Publish date &amp; time</Label>
              <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </div>
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <p className="text-sm font-medium mb-2">Publish readiness</p>
              <PublishReadiness validation={validation} loading={validating} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={submitSchedule} disabled={busy || blocked} className="gap-1.5">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarClock className="w-4 h-4" />}
              {isScheduled ? "Reschedule" : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish now confirmation */}
      <AlertDialog open={confirmPublish} onOpenChange={setConfirmPublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this post now?</AlertDialogTitle>
            <AlertDialogDescription>
              It will go live on your public blog immediately and become visible to all visitors.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-sm font-medium mb-2">Publish readiness</p>
            <PublishReadiness validation={validation} loading={validating} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); publishNow(); }} disabled={busy || blocked}>
              {busy ? "Publishing..." : "Publish now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}