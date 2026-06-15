import React from "react";
import EmptyState from "@/components/shared/EmptyState";
import SecurityBadge from "@/components/admin/security/SecurityBadge";

const ACCESS_STYLES = {
  Public: "bg-green-500/15 text-green-400 border-green-500/30",
  Authenticated: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Owner Only": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Role Restricted": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Admin Only": "bg-primary/15 text-primary border-primary/30",
  "Premium Only": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Internal Only": "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export default function RegistryTab({ items, itemType, icon: Icon, emptyTitle, emptyDescription }) {
  const filtered = items.filter((i) => i.item_type === itemType);

  if (filtered.length === 0) {
    return <EmptyState icon={Icon} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="rounded-2xl border border-border bg-card/70 overflow-hidden">
      <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
        <span className="col-span-4">Name</span>
        <span className="col-span-4">{itemType === "Route" ? "Path" : itemType === "Entity" ? "Entity" : "Role"}</span>
        <span className="col-span-4">Expected Access</span>
      </div>
      {filtered.map((item) => (
        <div key={item.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 text-sm items-center border-b border-border last:border-0">
          <span className="col-span-4 font-medium truncate">{item.name || "—"}</span>
          <span className="col-span-4 text-muted-foreground truncate font-mono text-xs">
            {item.path || item.entity_name || item.role_name || "—"}
          </span>
          <span className="col-span-4">
            <SecurityBadge label={item.expected_access} styleMap={ACCESS_STYLES} />
          </span>
        </div>
      ))}
    </div>
  );
}