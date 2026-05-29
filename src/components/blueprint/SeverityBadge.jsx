import React from "react";

const STYLES = {
  low: "bg-secondary text-muted-foreground",
  medium: "bg-chart-2/15 text-chart-2",
  high: "bg-primary/15 text-primary",
  critical: "bg-destructive/15 text-destructive",
};

export default function SeverityBadge({ severity }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${STYLES[severity] || STYLES.medium}`}>
      {severity}
    </span>
  );
}