import React, { useState, useEffect } from "react";
import { Video as VideoIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import VideoFormDialog from "@/components/admin/VideoFormDialog";
import { Button } from "@/components/ui/button";

export default function AdminVideos() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    base44.entities.Video.list("order", 200).then((d) => { setRows(d); setLoading(false); });
  };
  useEffect(load, []);

  const remove = async (v) => {
    if (!confirm(`Delete video "${v.title}"?`)) return;
    await base44.entities.Video.delete(v.id);
    toast.success("Video deleted");
    load();
  };

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (v) => { setEditing(v); setDialogOpen(true); };

  return (
    <div>
      <PageHeader
        title="Videos"
        description="Add YouTube videos with a cover image and category for the public Videos page."
        actions={<Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add video</Button>}
      />
      <AdminTable
        loading={loading}
        rows={rows}
        columns={["Cover", "Title", "Category", "Actions"]}
        emptyIcon={VideoIcon}
        emptyTitle="No videos yet"
        emptyDescription="Add your first YouTube video."
        renderRow={(v) => [
          v.coverImageUrl
            ? <img src={v.coverImageUrl} alt={v.title} className="w-20 h-12 object-cover rounded border border-border" />
            : <span className="text-muted-foreground">—</span>,
          <span className="font-medium">{v.title}</span>,
          <span className="text-muted-foreground">{v.category || "—"}</span>,
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openEdit(v)}><Pencil className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => remove(v)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>,
        ]}
      />
      <VideoFormDialog open={dialogOpen} onOpenChange={setDialogOpen} video={editing} onSaved={load} />
    </div>
  );
}