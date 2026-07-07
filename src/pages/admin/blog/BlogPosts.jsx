import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { FileText, Plus, ExternalLink, Sparkles, Pencil, Share2, Trash2 } from "lucide-react";
import ShareToOcoyaDialog from "@/components/admin/blog/ShareToOcoyaDialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ScheduleActions from "@/components/admin/blog/scheduling/ScheduleActions";
import { formatScheduled } from "@/lib/blogSchedule";
import { ApprovalBadge } from "@/components/admin/blog/approval/approvalConfig";

const STATUS_VARIANT = {
  published: "default",
  scheduled: "secondary",
  needs_review: "secondary",
  draft: "outline",
  archived: "outline",
  failed: "destructive",
};

export default function BlogPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sharePost, setSharePost] = useState(null);
  const [deletePost, setDeletePost] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletePost) return;
    setDeleting(true);
    await base44.entities.BlogPost.delete(deletePost.id);
    setPosts((prev) => prev.filter((p) => p.id !== deletePost.id));
    setDeleting(false);
    setDeletePost(null);
  };

  useEffect(() => {
    base44.entities.BlogPost.list("-created_date", 1000).then((d) => {
      setPosts(d);
      setLoading(false);
    });
  }, []);

  const applyUpdate = (updated) =>
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));

  const filtered = posts.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Blog Posts"
        description="Search, edit, approve, schedule, publish, and archive your posts."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/marketing/blog/generator"><Sparkles className="w-4 h-4" /> Generate</Link>
            </Button>
            <Button asChild className="gap-2">
              <Link to="/admin/marketing/blog/posts/new"><Plus className="w-4 h-4" /> New post</Link>
            </Button>
          </div>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <AdminTable
        columns={["", "Title", "Status", "Approval", "Schedule", "SEO", "Actions"]}
        rows={filtered}
        loading={loading}
        emptyIcon={FileText}
        emptyTitle="No posts yet"
        emptyDescription="Generate your first AI blog post or create one manually."
        renderRow={(p) => {
          const status = p.status || (p.published ? "published" : "draft");
          return [
            p.coverImageUrl ? (
              <img src={p.coverImageUrl} alt="" className="w-12 h-9 rounded object-cover" />
            ) : (
              <div className="w-12 h-9 rounded bg-secondary" />
            ),
            <div>
              <div className="font-medium">{p.title}</div>
              {p.slug && <div className="text-xs text-muted-foreground">/{p.slug}</div>}
            </div>,
            <Badge variant={STATUS_VARIANT[status] || "outline"} className="text-xs capitalize">
              {status.replace(/_/g, " ")}
            </Badge>,
            <ApprovalBadge status={p.approvalStatus || "draft"} />,
            ["approved", "scheduled", "failed", "needs_review", "draft"].includes(status) ? (
              <ScheduleActions
                post={{ id: p.id, status, scheduledAt: p.scheduledAt, scheduledTimezone: p.scheduledTimezone }}
                onChange={applyUpdate}
              />
            ) : status === "published" ? (
              <span className="text-xs text-green-500">{p.publishedAt ? formatScheduled(p.publishedAt) : "Published"}</span>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            ),
            <span className="text-xs text-muted-foreground">{typeof p.seoScore === "number" ? p.seoScore : "—"}</span>,
            <div className="flex items-center gap-1">
              <Link to={`/admin/marketing/blog/posts/${p.id}/edit`}>
                <Button variant="ghost" size="icon" title="Edit post"><Pencil className="w-4 h-4" /></Button>
              </Link>
              {p.slug && (
                <a href={`/learn/blog/${p.slug}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" title="View post"><ExternalLink className="w-4 h-4" /></Button>
                </a>
              )}
              {p.slug && (
                <Button variant="ghost" size="icon" title="Send to Ocoya" onClick={() => setSharePost(p)}>
                  <Share2 className="w-4 h-4 text-primary" />
                </Button>
              )}
              <Button variant="ghost" size="icon" title="Delete post" onClick={() => setDeletePost(p)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>,
          ];
        }}
      />

      <ShareToOcoyaDialog post={sharePost} open={!!sharePost} onOpenChange={(o) => !o && setSharePost(null)} />

      <AlertDialog open={!!deletePost} onOpenChange={(o) => !o && setDeletePost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deletePost?.title}" will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}