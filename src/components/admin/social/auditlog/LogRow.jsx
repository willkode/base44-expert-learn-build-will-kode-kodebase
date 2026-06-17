import React, { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Copy, RotateCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/admin/social/StatusBadge";
import { PLATFORM_MAP, LOG_STATUS_STYLES, prettyLabel, formatDateTime } from "@/components/admin/social/socialConfig";
import { EVENT_TO_GROUP, isRetryable } from "./logsConfig";

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-muted-foreground w-36 shrink-0">{label}</span>
      <span className="font-mono break-all text-foreground/90">{value}</span>
    </div>
  );
}

export default function LogRow({ log, campaignName, userName, onRetry }) {
  const [expanded, setExpanded] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const P = PLATFORM_MAP[log.platform];
  const retryable = isRetryable(log);

  const copyError = () => {
    const payload = [
      `Event: ${log.event_type}`,
      `Status: ${log.status}`,
      `Platform: ${log.platform || "—"}`,
      `Time: ${log.created_date}`,
      `Message: ${log.message || ""}`,
      log.related_post_id ? `Post: ${log.related_post_id}` : "",
      log.related_scheduled_post_id ? `Scheduled job: ${log.related_scheduled_post_id}` : "",
      log.metadata ? `Metadata: ${JSON.stringify(log.metadata, null, 2)}` : "",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(payload);
    toast.success("Error details copied.");
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await onRetry(log);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <>
      <tr className="border-b border-border hover:bg-secondary/30 cursor-pointer" onClick={() => setExpanded((e) => !e)}>
        <td className="px-3 py-2.5 align-top">
          <button className="text-muted-foreground" aria-label="Toggle details">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </td>
        <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap align-top">{formatDateTime(log.created_date)}</td>
        <td className="px-3 py-2.5 align-top">
          <div className="text-sm">{prettyLabel(log.event_type)}</div>
          <div className="text-[10px] text-muted-foreground">{EVENT_TO_GROUP[log.event_type] || "Other"}</div>
        </td>
        <td className="px-3 py-2.5 align-top">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {P?.icon && <P.icon className="w-4 h-4" />}
            {P?.label || "—"}
          </div>
        </td>
        <td className="px-3 py-2.5 align-top"><StatusBadge value={log.status} styleMap={LOG_STATUS_STYLES} /></td>
        <td className="px-3 py-2.5 text-sm text-muted-foreground max-w-md truncate align-top">{log.message}</td>
      </tr>
      {expanded && (
        <tr className="border-b border-border bg-background/40">
          <td colSpan={6} className="px-6 py-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
                <DetailRow label="Event type" value={log.event_type} />
                <DetailRow label="Account / workspace" value={log.account_id} />
                <DetailRow label="User" value={userName || log.user_id} />
                <DetailRow label="Campaign" value={campaignName || log.related_campaign_id} />
                <DetailRow label="Related post ID" value={log.related_post_id} />
                <DetailRow label="Scheduled job ID" value={log.related_scheduled_post_id} />
                <DetailRow label="Logged at" value={formatDateTime(log.created_date)} />
              </div>

              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">Metadata (sensitive values redacted)</div>
                  <pre className="text-[11px] font-mono bg-secondary/40 border border-border rounded-lg p-3 overflow-x-auto max-h-60">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                {log.status === "error" && (
                  <Button variant="outline" size="sm" onClick={copyError}>
                    <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy error details
                  </Button>
                )}
                {retryable && (
                  <Button size="sm" onClick={handleRetry} disabled={retrying}>
                    {retrying ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5 mr-1.5" />}
                    Retry publishing
                  </Button>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}