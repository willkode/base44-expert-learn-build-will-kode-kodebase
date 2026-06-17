import React from "react";
import { Link } from "react-router-dom";
import { RefreshCw, XCircle, ExternalLink, AlertTriangle, Loader2, PlugZap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/admin/social/StatusBadge";
import { PLATFORM_MAP, JOB_STATUS_STYLES, formatDateTime } from "@/components/admin/social/socialConfig";
import { errorInfo } from "./publishingConfig";

export default function ScheduledPostRow({ job, post, onRetry, onCancel, busyId }) {
  const P = PLATFORM_MAP[job.platform];
  const busy = busyId === job.id;
  const isFailed = job.status === "failed";
  const canCancel = ["queued", "failed", "processing"].includes(job.status);
  const info = isFailed && job.error_code ? errorInfo(job.error_code) : null;

  return (
    <div className="rounded-xl border border-border bg-background/40 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {P?.icon && <P.icon className="w-4 h-4 text-muted-foreground shrink-0" />}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{post?.title_internal || "Untitled post"}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(job.scheduled_at)}</p>
          </div>
        </div>
        <StatusBadge value={job.status} styleMap={JOB_STATUS_STYLES} />
      </div>

      {isFailed && (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-red-400">
            <AlertTriangle className="w-3.5 h-3.5" /> {info?.label || "Failed"}
          </p>
          {(info?.hint || job.error_message) && (
            <p className="text-xs text-muted-foreground mt-0.5">{job.error_message || info?.hint}</p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1">
            Attempt {job.attempt_count || 0}/{job.max_attempts || 3}
          </p>
        </div>
      )}

      {job.status === "published" && job.platform_post_url && (
        <a href={job.platform_post_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
          <ExternalLink className="w-3 h-3" /> View on {P?.label || job.platform}
        </a>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {isFailed && info?.retry !== false && (
          <Button size="sm" variant="outline" onClick={() => onRetry(job)} disabled={busy}>
            {busy ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
            Retry
          </Button>
        )}
        {isFailed && info?.reconnect && (
          <Link to="/admin/marketing/social/connections">
            <Button size="sm" variant="outline" className="text-amber-400 hover:text-amber-300">
              <PlugZap className="w-3.5 h-3.5 mr-1" /> Reconnect account
            </Button>
          </Link>
        )}
        {canCancel && (
          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => onCancel(job)} disabled={busy}>
            <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
          </Button>
        )}
        {isFailed && (
          <Link to="/admin/marketing/social/logs" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <FileText className="w-3 h-3" /> View log
          </Link>
        )}
      </div>
    </div>
  );
}