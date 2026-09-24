import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Hammer, Plus, Pencil, Trash2, ExternalLink, Star, Search, Eye, EyeOff, PlayCircle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import BuildTutorialFormDialog from "@/components/admin/BuildTutorialFormDialog";
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

export default function AdminBuildYourOwn() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.BuildTutorial.list("title", 2000);
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category).filter(Boolean))).sort(),
    [rows]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      (category === "All" || r.category === category) &&
      (!q || [r.title, r.url, r.category, ...(r.languages || [])]
        .some((v) => String(v || "").toLowerCase().includes(q)))
    );
  }, [rows, search, category]);

  const publishedCount = rows.filter((r) => r.published !== false).length;

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (r) => { setEditing(r); setDialogOpen(true); };

  const togglePublished = async (r) => {
    const published = r.published === false;
    await base44.entities.BuildTutorial.update(r.id, { published });
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, published } : x)));
    toast.success(published ? "Guide published" : "Guide hidden");
  };

  const confirmDelete = async () => {
    await base44.entities.BuildTutorial.delete(deleteTarget.id);
    setDeleteTarget(null);
    toast.success("Guide deleted");
    load();
  };

  return (
    <div>
      <PageHeader
        title="Build Your Own"
        description={`Guides listed on /learn/build-your-own — ${publishedCount} published of ${rows.length}.`}
        actions={
          <div className="flex gap-2">
            <a href="/learn/build-your-own" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2"><ExternalLink className="w-4 h-4" /> View page</Button>
            </a>
            <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Add guide</Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, link, category, language..." className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <AdminTable
        columns={["Title", "Category", "Languages", "Status", "Actions"]}
        rows={visible}
        loading={loading}
        emptyIcon={search.trim() || category !== "All" ? Search : Hammer}
        emptyTitle={search.trim() || category !== "All" ? "No matching guides" : "No guides yet"}
        emptyDescription={search.trim() || category !== "All" ? "Try a different search or category." : "Add a guide manually, or import them in bulk."}
        renderRow={(r) => [
          <div className="max-w-md">
            <div className="font-medium flex items-center gap-1.5">
              {r.featured && <Star className="w-3.5 h-3.5 shrink-0 fill-primary text-primary" />}
              {r.isVideo && <PlayCircle className="w-3.5 h-3.5 shrink-0 text-primary" />}
              <span className="truncate">{r.title}</span>
            </div>
            <div className="text-xs text-muted-foreground truncate">{r.url}</div>
          </div>,
          <Badge variant="secondary" className="text-xs whitespace-nowrap">{r.category}</Badge>,
          <span className="text-xs text-muted-foreground">{(r.languages || []).join(", ") || "—"}</span>,
          r.published === false
            ? <span className="text-xs text-muted-foreground">Hidden</span>
            : <span className="text-xs text-green-500">Published</span>,
          <div className="flex items-center gap-1">
            <a href={r.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" title="Open link"><ExternalLink className="w-4 h-4" /></Button>
            </a>
            <Button variant="ghost" size="icon" onClick={() => togglePublished(r)} title={r.published === false ? "Publish" : "Hide"}>
              {r.published === false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => openEdit(r)} title="Edit"><Pencil className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(r)} title="Delete"><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>,
        ]}
      />

      <BuildTutorialFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tutorial={editing}
        categories={categories}
        onSaved={load}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this guide?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be permanently removed. To keep it but take it off the page, use Hide instead.
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
