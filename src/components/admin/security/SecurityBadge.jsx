import React from "react";
import { cn } from "@/lib/utils";

export default function SecurityBadge({ label, styleMap, className }) {
  const style = (styleMap && styleMap[label]) || "bg-secondary text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}