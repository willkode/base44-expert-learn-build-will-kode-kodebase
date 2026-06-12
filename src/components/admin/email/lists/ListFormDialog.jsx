import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ListFormDialog({ open, onOpenChange, list, onSaved }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = !!list;

  useEffect(() => {
    if (open) {
      setName(list?.name || "");
      setDescription(list?.description || "");
    }
  }, [open, list]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await base44.entities.EmailList.update(list.id, { name: name.trim(), description });
        toast.success("List updated");
      } else {
        await base44.entities.EmailList.create({ name: name.trim(), description, listType: "manual" });
        toast.success("List created");
      }
      onOpenChange(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sora">{isEdit ? "Rename List" : "New List"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1.5 block text-sm">Name *</Label>
            <Input value={name} placeholder="Newsletter subscribers" onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Description</Label>
            <Textarea value={description} rows={2} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? "Save" : "Create list"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}