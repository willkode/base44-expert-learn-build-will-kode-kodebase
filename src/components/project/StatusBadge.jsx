import React from "react";

const STYLES = {
  draft: "bg-secondary text-muted-foreground",
  generating: "bg-chart-2/15 text-chart-2",
  completed: "bg-green-500/15 text-green-400",
  archived: "bg-secondary text-muted-foreground",
};

const DOT = {
  draft: "bg-muted-foreground",
  generating: "bg-chart-2 animate-pulse",
  completed: "bg-green-400",
  archived: "bg-muted-foreground",
};

export default function StatusBadge({ status = "draft" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full capitalize font-medium ${STYLES[status] || STYLES.draft}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT[status] || DOT.draft}`} />
      {status}
    </span>
  );
}