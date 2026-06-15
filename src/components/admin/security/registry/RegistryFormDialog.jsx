import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACCESS_OPTIONS, TOGGLES_BY_TYPE } from "@/components/admin/security/registryConfig";

// Per-type text fields rendered before the toggles.
const TEXT_FIELDS = {
  Route: [
    { key: "path", label: "Route path", placeholder: "/admin/users" },
    { key: "name", label: "Route name", placeholder: "Admin Users" },
  ],
  Entity: [
    { key: "entity_name", label: "Entity name", placeholder: "Payment" },
    { key: "name", label: "Display name", placeholder: "Payment" },
  ],
  Role: [
    { key: "role_name", label: "Role name", placeholder: "admin" },
    { key: "name", label: "Display name", placeholder: "admin" },
    { key: "description", label: "Description", placeholder: "Full administrator" },
  ],
  Action: [
    { key: "action_name", label: "Action name", placeholder: "Delete user" },
    { key: "name", label: "Display name", placeholder: "Delete user" },
    { key: "related_route", label: "Related route", placeholder: "/admin/users" },
    { key: "related_entity", label: "Related entity", placeholder: "User" },
    { key: "expected_role", label: "Expected role", placeholder: "admin" },
  ],
};

export default function RegistryFormDialog({ open, onOpenChange, itemType, item, onSave }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        item || {
          item_type: itemType,
          expected_access: itemType === "Route" ? "Public" : "Authenticated",
        }
      );
    }
  }, [open, item, itemType]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...form, item_type: itemType });
    setSaving(false);
    onOpenChange(false);
  };

  const textFields = TEXT_FIELDS[itemType] || [];
  const toggles = TOGGLES_BY_TYPE[itemType] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit" : "Add"} {itemType}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {textFields.map((f) => (
            <div key={f.key}>
              <Label className="mb-1.5 block">{f.label}</Label>
              <Input
                value={form[f.key] || ""}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </div>
          ))}

          <div>
            <Label className="mb-1.5 block">Expected access</Label>
            <Select value={form.expected_access || "Authenticated"} onValueChange={(v) => set("expected_access", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ACCESS_OPTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-border pt-4">
            {toggles.map((t) => (
              <div key={t.key} className="flex items-center justify-between">
                <Label className="font-normal">{t.label}</Label>
                <Switch checked={!!form[t.key]} onCheckedChange={(v) => set(t.key, v)} />
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4">
            <Label className="mb-1.5 block">Notes</Label>
            <Textarea
              value={form.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Optional notes about this item"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}