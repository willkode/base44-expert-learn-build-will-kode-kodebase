import React from "react";

// A compact ranked list card: title + a right-aligned metric, optional sub-line.
export default function RankedList({ title, icon: Icon, items, empty = "No data yet", renderMeta }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <h3 className="font-sora font-semibold text-sm">{title}</h3>
      </div>
      {(!items || items.length === 0) ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it, i) => (
            <li key={it.id || it.name || i} className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-2.5">
                <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                <span className="text-sm truncate">{it.label || it.title || it.name}</span>
              </div>
              <span className="text-sm font-medium text-foreground shrink-0">{renderMeta(it)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}