import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { History, Loader2 } from "lucide-react";
import { formatDateTime } from "@/components/admin/social/socialConfig";
import { LOG_STATUS_STYLES } from "@/components/admin/social/socialConfig";
import StatusBadge from "@/components/admin/social/StatusBadge";

const APPROVAL_EVENTS = [
  "approval_submitted_for_review",
  "approval_approved",
  "approval_rejected",
  "approval_revision_requested",
];

function eventLabel(type) {
  return (type || "")
    .replace("approval_", "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ApprovalHistory() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    base44.entities.SocialAutomationLog.list("-created_date", 100).then((all) => {
      setLogs(all.filter((l) => APPROVAL_EVENTS.includes(l.event_type)));
      setLoading(false);
    });
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <h2 className="flex items-center gap-2 font-sora font-semibold mb-4">
        <History className="w-4 h-4 text-primary" /> Approval History
      </h2>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No approval activity yet.</p>
      ) : (
        <ul className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
          {logs.map((l) => (
            <li key={l.id} className="rounded-lg border border-border bg-background/40 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{eventLabel(l.event_type)}</span>
                <StatusBadge value={l.status} styleMap={LOG_STATUS_STYLES} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{l.message}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{formatDateTime(l.created_date)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}