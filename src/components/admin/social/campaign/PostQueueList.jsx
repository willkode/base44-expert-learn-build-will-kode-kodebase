import React from "react";
import { PLATFORM_MAP, APPROVAL_STATUS_STYLES, formatDateTime } from "@/components/admin/social/socialConfig";
import StatusBadge from "@/components/admin/social/StatusBadge";

// Generic list of SocialPost items for the content-queue section.
export default function PostQueueList({ posts, emptyText }) {
  if (!posts || posts.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">{emptyText || "Nothing here yet."}</p>;
  }
  return (
    <ul className="space-y-2">
      {posts.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-sm truncate">{p.title_internal || p.content || "Untitled post"}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {(p.selected_platforms || []).map((pl) => {
                const P = PLATFORM_MAP[pl];
                return P?.icon ? <P.icon key={pl} className="w-3.5 h-3.5 text-muted-foreground" /> : null;
              })}
              {p.scheduled_at && (
                <span className="text-xs text-muted-foreground ml-1">{formatDateTime(p.scheduled_at)}</span>
              )}
            </div>
          </div>
          <StatusBadge value={p.approval_status} styleMap={APPROVAL_STATUS_STYLES} />
        </li>
      ))}
    </ul>
  );
}