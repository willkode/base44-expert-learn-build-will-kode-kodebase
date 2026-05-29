import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const EMPTY = { title: "", category: "", description: "", templateContent: "", isPublic: true };

export default function TemplateFormDialog({ open, onOpenChange, template, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(template ? { ...EMPTY, ...template } : EMPTY);
  }, [template, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    const data = {
      title: form.title,
      category: form.category,
      description: form.description,
      templateContent: form.templateContent,
      isPublic: form.isPublic,
    };
    if (template?.id) await base44.entities.Template.update(template.id, data);
    else await base44.entities.Template.create(data);
    setSaving(false);
    toast.success(template ? "Template updated" : "Template created");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Edit template" : "New template"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1.5 block">Title</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Category</Label>
            <Input value={form.category} onChange={(e) => set("category", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Description</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="h-20" />
          </div>
          <div>
            <Label className="mb-1.5 block">Template content</Label>
            <Textarea value={form.templateContent} onChange={(e) => set("templateContent", e.target.value)} className="h-40 font-mono text-xs" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label>Active (public)</Label>
              <p className="text-xs text-muted-foreground">Visible to all users.</p>
            </div>
            <Switch checked={!!form.isPublic} onCheckedChange={(v) => set("isPublic", v)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}