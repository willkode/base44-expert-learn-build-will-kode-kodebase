import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Library, Plus, Pencil, Trash2, ExternalLink, Star, Sparkles } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PromptPostFormDialog from "@/components/admin/marketing/PromptPostFormDialog";
import ManualPromptFormDialog from "@/components/admin/marketing/ManualPromptFormDialog";

export default function AdminPromptLibrary() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.LibraryPrompt.list("order");
    setPrompts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNewAi = () => { setEditing(null); setDialogOpen(true); };
  const openAiRewrite = (p) => { setEditing(p); setDialogOpen(true); };
  const openNewManual = () => { setEditing(null); setManualOpen(true); };
  const openEdit = (p) => { setEditing(p); setManualOpen(true); };

  const confirmDelete = async () => {
    await base44.entities.LibraryPrompt.delete(deleteTarget.id);
    setDeleteTarget(null);
    toast.success("Prompt post deleted");
    load();
  };

  return (
    <div>
      <PageHeader
        title="Prompt Library"
        description="Add and edit the prompts listed on the public Prompt Library — manually or with AI."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={openNewAi} className="gap-2">
              <Sparkles className="w-4 h-4" /> New with AI
            </Button>
            <Button onClick={openNewManual} className="gap-2">
              <Plus className="w-4 h-4" /> Add manually
            </Button>
          </div>
        }
      />

      <AdminTable
        columns={["", "Title", "Category", "Order", "Featured", "Actions"]}
        rows={prompts}
        loading={loading}
        emptyIcon={Library}
        emptyTitle="No prompt posts yet"
        emptyDescription="Add your first prompt manually or generate one with AI."
        renderRow={(p) => [
          p.imageUrl ? (
            <img src={p.imageUrl} alt="" className="w-12 h-9 rounded object-cover" />
          ) : (
            <div className="w-12 h-9 rounded bg-secondary" />
          ),
          <div>
            <div className="font-medium">{p.title}</div>
            {p.slug && <div className="text-xs text-muted-foreground">/{p.slug}</div>}
          </div>,
          <Badge variant="secondary" className="text-xs">{p.category}</Badge>,
          <span className="text-sm text-muted-foreground">{p.order ?? 0}</span>,
          p.featured ? (
            <Star className="w-4 h-4 fill-primary text-primary" />
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          ),
          <div className="flex items-center gap-1">
            {p.slug && (
              <a href={`/learn/prompt-library/${p.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" title="View post"><ExternalLink className="w-4 h-4" /></Button>
              </a>
            )}
            <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Edit"><Pencil className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => openAiRewrite(p)} title="Rewrite with AI"><Sparkles className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(p)} title="Delete"><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>,
        ]}
      />

      <PromptPostFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prompt={editing}
        onSaved={load}
      />

      <ManualPromptFormDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        prompt={editing}
        onSaved={load}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this prompt post?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be permanently removed from the library. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}