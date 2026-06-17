import React from "react";
import { Check, X, MessageSquareWarning, Send, CalendarClock, AlertTriangle, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/admin/social/StatusBadge";
import { PLATFORM_MAP, APPROVAL_STATUS_STYLES, formatDateTime } from "@/components/admin/social/socialConfig";
import { schedulingBlockReason, approvalBlockReasons, primaryPostText } from "./approvalConfig";

export default function ApprovalPostCard({ post, metaAccounts, onSubmit, onApprove, onReject, onRevision, onSchedule, busyAction }) {
  const platforms = post.selected_platforms || [];
  const text = primaryPostText(post);
  const blockReason = schedulingBlockReason(post, metaAccounts);
  const approveBlocks = approvalBlockReasons(post, metaAccounts);
  const busy = busyAction != null;

  const canSubmit = ["draft", "revision_requested"].includes(post.approval_status);
  const canApprove = ["needs_review", "revision_requested"].includes(post.approval_status);
  const canReject = ["needs_review", "revision_requested", "approved"].includes(post.approval_status);
  const canRevision = ["needs_review", "approved"].includes(post.approval_status);

  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border bg-background/40">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{post.title_internal || "Untitled post"}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {platforms.map((p) => {
              const P = PLATFORM_MAP[p];
              return P?.icon ? <P.icon key={p} className="w-3.5 h-3.5 text-muted-foreground" /> : null;
            })}
            <span className="text-xs text-muted-foreground ml-1">{formatDateTime(post.created_date)}</span>
          </div>
        </div>
        <StatusBadge value={post.approval_status} styleMap={APPROVAL_STATUS_STYLES} />
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{text || "No content yet."}</p>

        {post.approved_by && post.approval_status === "approved" && (
          <p className="flex items-center gap-1.5 text-xs text-green-400">
            <UserCheck className="w-3.5 h-3.5" /> Approved by {post.approved_by} • {formatDateTime(post.approved_at)}
          </p>
        )}

        {post.approval_status === "rejected" && post.rejected_reason && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
            <p className="text-xs font-medium text-red-400 mb-0.5">Rejected</p>
            <p className="text-xs text-muted-foreground">{post.rejected_reason}</p>
          </div>
        )}

        {post.approval_status === "revision_requested" && post.revision_notes && (
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2">
            <p className="text-xs font-medium text-blue-400 mb-0.5">Revision requested</p>
            <p className="text-xs text-muted-foreground">{post.revision_notes}</p>
          </div>
        )}

        {canApprove && approveBlocks.length > 0 && (
          <div className="space-y-1">
            {approveBlocks.map((b, i) => (
              <p key={i} className="flex items-start gap-1.5 text-xs text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {b}
              </p>
            ))}
          </div>
        )}

        {/* Scheduling readiness */}
        {blockReason ? (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" /> {blockReason}
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-green-400">
            <CalendarClock className="w-3.5 h-3.5" /> Ready to schedule.
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {canSubmit && (
            <Button size="sm" variant="outline" onClick={() => onSubmit(post)} disabled={busy}>
              {busyAction === "submit" ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1" />}
              Submit for review
            </Button>
          )}
          {canApprove && (
            <Button size="sm" onClick={() => onApprove(post)} disabled={busy || approveBlocks.length > 0}>
              {busyAction === "approve" ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1" />}
              Approve
            </Button>
          )}
          {canRevision && (
            <Button size="sm" variant="outline" onClick={() => onRevision(post)} disabled={busy}>
              <MessageSquareWarning className="w-3.5 h-3.5 mr-1" /> Request revision
            </Button>
          )}
          {canReject && (
            <Button size="sm" variant="outline" className="text-red-400 hover:text-red-300" onClick={() => onReject(post)} disabled={busy}>
              <X className="w-3.5 h-3.5 mr-1" /> Reject
            </Button>
          )}
          {onSchedule && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSchedule(post)}
              disabled={busy || !!blockReason}
              title={blockReason || "Schedule this post"}
            >
              <CalendarClock className="w-3.5 h-3.5 mr-1" /> Schedule
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}