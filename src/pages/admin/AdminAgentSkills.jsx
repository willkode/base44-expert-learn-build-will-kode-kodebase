import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Sparkles, Plus, Pencil, Trash2, Eye, EyeOff, Tag } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AgentSkillFormDialog from "@/components/admin/skills/AgentSkillFormDialog";

export default function AdminAgentSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.AgentSkill.list("order");
    setSkills(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (s) => { setEditing(s); setDialogOpen(true); };

  const confirmDelete = async () => {
    await base44.entities.AgentSkill.delete(deleteTarget.id);
    setDeleteTarget(null);
    toast.success("Skill deleted");
    load();
  };

  const togglePublished = async (s) => {
    await base44.entities.AgentSkill.update(s.id, { published: !s.published });
    toast.success(s.published ? "Skill hidden" : "Skill published");
    load();
  };

  const categories = ["all", ...Array.from(new Set(skills.map((s) => s.category).filter(Boolean)))];

  const filtered = skills.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.title.toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q) || (s.tags || []).some((t) => t.toLowerCase().includes(q));
    const matchCat = filterCat === "all" || s.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <PageHeader
        title="Agent Skills"
        description={`${skills.length} skill${skills.length !== 1 ? "s" : ""} · shown on the public Agent Skills page`}
        actions={
          <Button onClick={openNew} className="gap-2">
            <Plus className="w-4 h-4" /> Add Skill
          </Button>
        }
      />

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 mb-5">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card/60 text-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold">{skills.length}</span>
          <span className="text-muted-foreground">total</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card/60 text-sm">
          <Eye className="w-4 h-4 text-primary" />
          <span className="font-semibold">{skills.filter((s) => s.published).length}</span>
          <span className="text-muted-foreground">published</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card/60 text-sm">
          <Tag className="w-4 h-4 text-primary" />
          <span className="font-semibold">{categories.length - 1}</span>
          <span className="text-muted-foreground">categories</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Input placeholder="Search skills…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                filterCat === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      <AdminTable
        columns={["#", "Title", "Category", "Tags", "Model", "Status", "Actions"]}
        rows={filtered}
        loading={loading}
        emptyIcon={Sparkles}
        emptyTitle="No skills yet"
        emptyDescription="Add your first agent skill — or paste the details and let AI fill the fields."
        renderRow={(s) => [
          <span className="text-muted-foreground text-sm font-mono">{s.order ?? "—"}</span>,
          <div>
            <div className="font-medium">{s.title}</div>
            {s.description && <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{s.description}</div>}
          </div>,
          <Badge variant="secondary" className="text-xs">{s.category || "—"}</Badge>,
          <div className="flex flex-wrap gap-1 max-w-[180px]">
            {(s.tags || []).slice(0, 3).map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
            ))}
            {(s.tags || []).length > 3 && <span className="text-[10px] text-muted-foreground">+{s.tags.length - 3}</span>}
          </div>,
          <span className="text-xs text-muted-foreground">{s.recommended_model || "—"}</span>,
          s.published
            ? <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs">Published</Badge>
            : <Badge variant="outline" className="text-muted-foreground text-xs">Hidden</Badge>,
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" title={s.published ? "Hide" : "Publish"} onClick={() => togglePublished(s)}>
              {s.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => openEdit(s)} title="Edit">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(s)} title="Delete">
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>,
        ]}
      />

      <AgentSkillFormDialog open={dialogOpen} onOpenChange={setDialogOpen} skill={editing} onSaved={load} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this skill?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be permanently deleted. This can't be undone.
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