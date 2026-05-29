import React, { useState, useEffect } from "react";
import { LayoutTemplate, Plus, Pencil, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import TemplateFormDialog from "@/components/admin/TemplateFormDialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function AdminTemplates() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    base44.entities.Template.list("-created_date", 200).then((d) => { setRows(d); setLoading(false); });
  };
  useEffect(load, []);

  const toggleActive = async (t) => {
    await base44.entities.Template.update(t.id, { isPublic: !t.isPublic });
    load();
  };

  const remove = async (t) => {
    if (!confirm(`Delete template "${t.title}"?`)) return;
    await base44.entities.Template.delete(t.id);
    toast.success("Template deleted");
    load();
  };

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (t) => { setEditing(t); setDialogOpen(true); };

  return (
    <div>
      <PageHeader
        title="Templates"
        description="Manage public prompt and architecture templates."
        actions={<Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> New template</Button>}
      />
      <AdminTable
        loading={loading}
        rows={rows}
        columns={["Title", "Category", "Active", "Actions"]}
        emptyIcon={LayoutTemplate}
        emptyTitle="No templates yet"
        emptyDescription="Create reusable templates for users to start from."
        renderRow={(t) => [
          <span className="font-medium">{t.title}</span>,
          <span className="text-muted-foreground">{t.category || "—"}</span>,
          <Switch checked={!!t.isPublic} onCheckedChange={() => toggleActive(t)} />,
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openEdit(t)}><Pencil className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => remove(t)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>,
        ]}
      />
      <TemplateFormDialog open={dialogOpen} onOpenChange={setDialogOpen} template={editing} onSaved={load} />
    </div>
  );
}