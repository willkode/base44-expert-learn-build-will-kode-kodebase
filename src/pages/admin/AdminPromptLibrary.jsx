import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Library, Plus, Pencil, Trash2, ExternalLink, Star, Sparkles, Search } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PromptPostFormDialog from "@/components/admin/marketing/PromptPostFormDialog";
import ManualPromptFormDialog from "@/components/admin/marketing/ManualPromptFormDialog";
import { publishedTime, byFeaturedThenNewest } from "@/lib/promptSort";
import PromptMedia from "@/components/learn/PromptMedia";

const SORTS = {
  newest: { label: "Newest first", fn: (a, b) => publishedTime(b) - publishedTime(a) },
  oldest: { label: "Oldest first", fn: (a, b) => publishedTime(a) - publishedTime(b) },
  public: { label: "Public order (featured first)", fn: byFeaturedThenNewest },
};

export default function AdminPromptLibrary() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.LibraryPrompt.list("-created_date", 1000);
    setPrompts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = q
      ? prompts.filter((p) =>
          [p.title, p.slug, p.category, p.description, ...(p.tags || [])]
            .some((v) => String(v || "").toLowerCase().includes(q))
        )
      : prompts;
    return [...matches].sort(SORTS[sort].fn);
  }, [prompts, search, sort]);

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

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, slug, category, tags..."
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(SORTS).map(([k, s]) => <SelectItem key={k} value={k}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <AdminTable
        columns={["", "Title", "Category", "Published", "Views", "Copies", "Featured", "Actions"]}
        rows={visible}
        loading={loading}
        emptyIcon={search.trim() ? Search : Library}
        emptyTitle={search.trim() ? "No matching prompts" : "No prompt posts yet"}
        emptyDescription={search.trim() ? `Nothing matches "${search.trim()}".` : "Add your first prompt manually or generate one with AI."}
        renderRow={(p) => [
          p.imageUrl || p.videoUrl ? (
            <PromptMedia prompt={p} variant="thumb" alt="" className="w-12 h-9 rounded object-cover" />
          ) : (
            <div className="w-12 h-9 rounded bg-secondary" />
          ),
          <div>
            <div className="font-medium">{p.title}</div>
            {p.slug && <div className="text-xs text-muted-foreground">/{p.slug}</div>}
          </div>,
          <Badge variant="secondary" className="text-xs">{p.category}</Badge>,
          <span className="text-sm whitespace-nowrap">
            {p.publishedAt || p.created_date ? format(new Date(p.publishedAt || p.created_date), "MMM d, yyyy") : "—"}
          </span>,
          <span className="text-sm tabular-nums">{(p.viewCount || 0).toLocaleString()}</span>,
          <span className="text-sm tabular-nums">{(p.copyCount || 0).toLocaleString()}</span>,
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