import React from "react";

const STYLES = {
  draft: "bg-secondary text-muted-foreground",
  generating: "bg-chart-2/15 text-chart-2",
  completed: "bg-green-500/15 text-green-400",
  archived: "bg-secondary text-muted-foreground",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${STYLES[status] || STYLES.draft}`}>
      {status}
    </span>
  );
}