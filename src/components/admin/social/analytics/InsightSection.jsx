import React from "react";

// Renders a titled list of recommendation strings; hidden when empty.
export default function InsightSection({ icon: Icon, title, items, className = "" }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={`rounded-xl border border-border bg-background/40 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2.5">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <h4 className="font-sora font-semibold text-sm">{title}</h4>
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-muted-foreground flex gap-2">
            <span className="text-primary mt-1 leading-none">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}