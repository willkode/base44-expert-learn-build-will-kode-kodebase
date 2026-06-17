import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { XCircle, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/admin/social/StatusBadge";
import { PLATFORM_MAP, JOB_STATUS_STYLES, formatDateTime } from "@/components/admin/social/socialConfig";
import SocialErrorCard from "@/components/admin/social/errors/SocialErrorCard";

export default function ScheduledPostRow({ job, post, onRetry, onCancel, busyId }) {
  const navigate = useNavigate();
  const P = PLATFORM_MAP[job.platform];
  const busy = busyId === job.id;
  const isFailed = job.status === "failed";
  const canCancel = ["queued", "failed", "processing"].includes(job.status);

  // Wire the error card's in-app actions to this row's handlers; navigation
  // actions (reconnect, viewLogs, support, connect*) are handled by the card.
  const handleErrorAction = (key) => {
    if (key === "retry") { onRetry(job); return true; }
    if (key === "edit" || key === "reschedule") {
      if (post?.id) navigate(`/admin/marketing/social/studio?post=${post.id}`);
      else navigate("/admin/marketing/social/approvals");
      return true;
    }
    return false;
  };

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
        <div className="mt-3">
          <SocialErrorCard
            code={job.error_code}
            message={job.error_message}
            platform={P?.label || job.platform}
            busy={busy ? "retry" : null}
            onAction={handleErrorAction}
            compact
          />
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Attempt {job.attempt_count || 0}/{job.max_attempts || 3}
          </p>
        </div>
      )}

      {job.status === "published" && job.platform_post_url && (
        <a href={job.platform_post_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
          <ExternalLink className="w-3 h-3" /> View on {P?.label || job.platform}
        </a>
      )}

      {canCancel && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => onCancel(job)} disabled={busy}>
            <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
          </Button>
        </div>
      )}
    </div>
  );
}