import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Send, CheckCircle2, XCircle, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";

// Contextual approval buttons for a single post.
// `post` needs id + approvalStatus. onChange(updatedPost) refreshes the parent.
export default function ApprovalActions({ post, onChange, size = "sm" }) {
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState(null); // 'reject' | 'revision' | 'approve'
  const [text, setText] = useState("");

  const status = post.approvalStatus || "draft";

  const call = async (fn, payload, msg, event) => {
    setBusy(true);
    try {
      const res = await base44.functions.invoke(fn, payload);
      if (res.data?.success) {
        toast.success(msg);
        trackEvent(event, { post_id: post.id });
        onChange?.(res.data.post);
        setDialog(null);
        setText("");
        return true;
      }
      toast.error(res.data?.error || "Action failed");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Action failed");
    } finally {
      setBusy(false);
    }
    return false;
  };

  const submit = () => call("submitBlogPostForReview", { blog_post_id: post.id }, "Submitted for review", "blog_approval_submitted");
  const approve = () => call("approveBlogPost", { blog_post_id: post.id, notes: text.trim() || undefined }, "Post approved", "blog_approval_approved");
  const reject = () => {
    if (!text.trim()) { toast.error("A rejection reason is required"); return; }
    call("rejectBlogPost", { blog_post_id: post.id, reason: text.trim() }, "Post rejected", "blog_approval_rejected");
  };
  const requestRevision = () => {
    if (!text.trim()) { toast.error("Revision notes are required"); return; }
    call("requestBlogPostRevision", { blog_post_id: post.id, notes: text.trim() }, "Revision requested", "blog_approval_revision");
  };

  const canSubmit = ["draft", "revision_requested", "rejected"].includes(status);
  const canReview = status === "needs_review";
  // Allow re-review actions on approved posts (unapprove via revision/reject).
  const canModerate = status === "needs_review" || status === "approved";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canSubmit && (
        <Button size={size} variant="outline" onClick={submit} disabled={busy} className="gap-1.5">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Submit for review
        </Button>
      )}
      {canReview && (
        <Button size={size} onClick={() => { setText(""); setDialog("approve"); }} disabled={busy} className="gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
        </Button>
      )}
      {canModerate && (
        <>
          <Button size={size} variant="outline" onClick={() => { setText(""); setDialog("revision"); }} disabled={busy} className="gap-1.5 text-orange-400">
            <RotateCcw className="w-3.5 h-3.5" /> Request changes
          </Button>
          <Button size={size} variant="ghost" onClick={() => { setText(""); setDialog("reject"); }} disabled={busy} className="gap-1.5 text-destructive">
            <XCircle className="w-3.5 h-3.5" /> Reject
          </Button>
        </>
      )}

      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === "approve" && "Approve post"}
              {dialog === "reject" && "Reject post"}
              {dialog === "revision" && "Request revision"}
            </DialogTitle>
            <DialogDescription>
              {dialog === "approve" && "This post will be cleared for scheduling and publishing. Notes are optional."}
              {dialog === "reject" && "Rejected posts cannot be published. Explain why so the author can address it."}
              {dialog === "revision" && "The post returns to draft so the author can edit and resubmit. Describe the changes needed."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-1">
            <Label className="mb-1.5 block">
              {dialog === "approve" ? "Notes (optional)" : dialog === "reject" ? "Rejection reason" : "Revision notes"}
            </Label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} className="h-28" placeholder="Add your notes..." />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)} disabled={busy}>Cancel</Button>
            {dialog === "approve" && <Button onClick={approve} disabled={busy} className="gap-1.5">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Approve</Button>}
            {dialog === "reject" && <Button variant="destructive" onClick={reject} disabled={busy} className="gap-1.5">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Reject</Button>}
            {dialog === "revision" && <Button onClick={requestRevision} disabled={busy} className="gap-1.5">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Request changes</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}