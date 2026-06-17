import React from "react";
import { prettyLabel } from "./socialConfig";

export default function StatusBadge({ value, styleMap }) {
  const cls = (styleMap && styleMap[value]) || "bg-secondary text-secondary-foreground border-border";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${cls}`}>
      {prettyLabel(value)}
    </span>
  );
}