import React from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { formatScheduled } from "@/lib/blogSchedule";

// Shows approval metadata: approver/date, rejection reason, revision notes.
export default function ApprovalMeta({ post, compact }) {
  const status = post.approvalStatus || "draft";
  const items = [];

  if (status === "approved" && post.approvedBy) {
    items.push(
      <div key="approved" className="flex items-start gap-2 text-green-500">
        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
        <span>Approved by {post.approvedBy}{post.approvedAt ? ` · ${formatScheduled(post.approvedAt)}` : ""}</span>
      </div>
    );
  }
  if (status === "rejected" && post.rejectedReason) {
    items.push(
      <div key="rejected" className="flex items-start gap-2 text-destructive">
        <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>Rejected: {post.rejectedReason}</span>
      </div>
    );
  }
  if (status === "revision_requested" && post.revisionNotes) {
    items.push(
      <div key="revision" className="flex items-start gap-2 text-orange-400">
        <RotateCcw className="w-4 h-4 mt-0.5 shrink-0" />
        <span>Revision requested: {post.revisionNotes}</span>
      </div>
    );
  }

  if (!items.length) return null;
  return <div className={`space-y-1.5 ${compact ? "text-xs" : "text-sm"}`}>{items}</div>;
}