import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, RotateCcw, Image as ImageIcon, Loader2 } from "lucide-react";
import { eventLabel, STATUS_VARIANT } from "./logConfig";
import { mapBlogError } from "@/lib/blogErrors";

// Self-contained recovery actions available for an error log, keyed by event type.
// (SEO and internal-link re-runs live directly in the post editor.)
const RECOVERY_BY_EVENT = {
  publish: { tool: "retry_publish", label: "Retry publishing", icon: RotateCcw },
  publish_failed: { tool: "retry_publish", label: "Retry publishing", icon: RotateCcw },
  publishing_started: { tool: "retry_publish", label: "Retry publishing", icon: RotateCcw },
  image_generated: { tool: "rerun_image", label: "Re-run image generation", icon: ImageIcon },
};

export default function LogDetailDialog({ log, open, onOpenChange, onRecover, recovering }) {
  if (!log) return null;
  const isError = log.status === "error";
  const friendly = isError ? mapBlogError(log.message) : null;
  const recovery = log.relatedPostId ? RECOVERY_BY_EVENT[log.eventType] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sora flex items-center gap-2">
            {eventLabel(log.eventType)}
            <Badge variant={STATUS_VARIANT[log.status] || "outline"} className="text-xs capitalize">{log.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Message</p>
            <p className="text-sm">{log.message || "—"}</p>
          </div>

          {isError && friendly && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-sm font-medium">{friendly.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{friendly.explanation}</p>
              <p className="text-xs mt-2"><span className="font-medium">Next step:</span> {friendly.nextStep}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">When</p>
              <p>{log.created_date ? format(new Date(log.created_date), "MMM d, yyyy HH:mm:ss") : "—"}</p>
            </div>
            {log.relatedPostId && (
              <div>
                <p className="text-muted-foreground">Related post</p>
                <Link to={`/admin/marketing/blog/posts/${log.relatedPostId}/edit`} className="text-primary hover:underline">Open editor</Link>
              </div>
            )}
          </div>

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Details</p>
              <pre className="text-[11px] bg-secondary/40 border border-border rounded-lg p-3 overflow-x-auto">{JSON.stringify(log.metadata, null, 2)}</pre>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {recovery && (
              <Button size="sm" onClick={() => onRecover(recovery.tool, log.relatedPostId)} disabled={recovering}
                className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {recovering ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <recovery.icon className="w-4 h-4 mr-2" />}
                {recovery.label}
              </Button>
            )}
            {log.relatedPostId && (
              <Button asChild size="sm" variant="outline">
                <Link to={`/admin/marketing/blog/posts/${log.relatedPostId}/edit`}><Pencil className="w-4 h-4 mr-2" />Edit post</Link>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}