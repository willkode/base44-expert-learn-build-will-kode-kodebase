import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import SecurityBadge from "@/components/admin/security/SecurityBadge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { TOGGLES_BY_TYPE } from "@/components/admin/security/registryConfig";
import RegistryFormDialog from "@/components/admin/security/registry/RegistryFormDialog";

const ACCESS_STYLES = {
  Public: "bg-green-500/15 text-green-400 border-green-500/30",
  Authenticated: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Owner Only": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Role Restricted": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Admin Only": "bg-primary/15 text-primary border-primary/30",
  "Premium Only": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Internal Only": "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

function identifier(item) {
  if (item.item_type === "Route") return item.path;
  if (item.item_type === "Entity") return item.entity_name;
  if (item.item_type === "Role") return item.role_name;
  if (item.item_type === "Action") return item.action_name;
  return item.name;
}

export default function RegistryManager({
  items,
  itemType,
  icon: Icon,
  emptyTitle,
  emptyDescription,
  onChanged,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = items.filter((i) => i.item_type === itemType);
  const toggles = TOGGLES_BY_TYPE[itemType] || [];

  const openAdd = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (item) => { setEditing(item); setDialogOpen(true); };

  const handleSave = async (data) => {
    if (data.id) {
      const { id, ...rest } = data;
      await base44.entities.SecurityRegistry.update(id, rest);
    } else {
      await base44.entities.SecurityRegistry.create({
        registry_id: `reg_${Date.now()}`,
        ...data,
      });
    }
    onChanged?.();
  };

  const handleDelete = async (item) => {
    await base44.entities.SecurityRegistry.delete(item.id);
    onChanged?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={openAdd} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Add {itemType}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Icon}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={`Add ${itemType}`}
          onAction={openAdd}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card/70 overflow-hidden">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 px-5 py-3.5 border-b border-border last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">{item.name || identifier(item) || "—"}</span>
                  <SecurityBadge label={item.expected_access} styleMap={ACCESS_STYLES} />
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                  {identifier(item) || "—"}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {toggles.filter((t) => item[t.key]).map((t) => (
                    <span
                      key={t.key}
                      className="text-[10px] uppercase tracking-wide rounded bg-secondary px-1.5 py-0.5 text-muted-foreground"
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => handleDelete(item)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RegistryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        itemType={itemType}
        item={editing}
        onSave={handleSave}
      />
    </div>
  );
}