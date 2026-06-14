import React from "react";
import { FileEdit, Clock, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Shared approval-status metadata used across badges, filters, and the queue.
export const APPROVAL_STATUSES = {
  draft: { label: "Draft", icon: FileEdit, variant: "outline", className: "text-muted-foreground" },
  needs_review: { label: "Needs review", icon: Clock, variant: "secondary", className: "text-amber-400" },
  approved: { label: "Approved", icon: CheckCircle2, variant: "default", className: "" },
  rejected: { label: "Rejected", icon: XCircle, variant: "destructive", className: "" },
  revision_requested: { label: "Revision requested", icon: RotateCcw, variant: "secondary", className: "text-orange-400" },
};

export const APPROVAL_FILTERS = [
  { value: "all", label: "All" },
  { value: "needs_review", label: "Needs review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "revision_requested", label: "Revision requested" },
  { value: "draft", label: "Draft" },
];

export function ApprovalBadge({ status }) {
  const cfg = APPROVAL_STATUSES[status] || APPROVAL_STATUSES.draft;
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant} className={`gap-1 text-xs ${cfg.className}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </Badge>
  );
}