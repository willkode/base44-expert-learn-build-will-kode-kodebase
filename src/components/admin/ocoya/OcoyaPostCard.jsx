import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar } from "lucide-react";
import moment from "moment";

const STATUS_STYLES = {
  DRAFT: "bg-secondary text-secondary-foreground",
  SCHEDULED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  POSTED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  ERROR: "bg-destructive/15 text-destructive border-destructive/30",
  GENERATING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

export default function OcoyaPostCard({ post, onDelete, deleting }) {
  const caption = post.caption || post.text || post.description || "(no caption)";
  const media =
    post.mediaUrls?.[0] ||
    post.medias?.[0]?.url ||
    post.media?.[0]?.url ||
    post.imageUrl ||
    null;
  const status = (post.status || "").toUpperCase();
  const scheduledAt = post.scheduledAt || post.scheduled_at || post.publishAt;

  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4">
      {media && (
        <img src={media} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          {status && (
            <Badge variant="outline" className={STATUS_STYLES[status] || ""}>
              {status}
            </Badge>
          )}
          {scheduledAt && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" /> {moment(scheduledAt).format("MMM D, YYYY h:mm A")}
            </span>
          )}
        </div>
        <p className="text-sm text-foreground/90 whitespace-pre-line line-clamp-4">{caption}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive shrink-0"
        disabled={deleting}
        onClick={() => {
          if (window.confirm("Delete this post from Ocoya? This also cancels its schedule.")) {
            onDelete(post.id);
          }
        }}
        aria-label="Delete post"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}