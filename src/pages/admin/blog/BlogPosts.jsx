import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { FileText, Plus, ExternalLink, Sparkles } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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

  useEffect(() => {
    base44.entities.BlogPost.list("-created_date", 1000).then((d) => {
      setPosts(d);
      setLoading(false);
    });
  }, []);

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
              <Link to="/admin/marketing/blog/generator"><Plus className="w-4 h-4" /> New post</Link>
            </Button>
          </div>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <AdminTable
        columns={["", "Title", "Status", "Type", "SEO", "Actions"]}
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
            <span className="text-xs text-muted-foreground capitalize">{(p.postType || "blog_post").replace(/_/g, " ")}</span>,
            <span className="text-xs text-muted-foreground">{typeof p.seoScore === "number" ? p.seoScore : "—"}</span>,
            <div className="flex items-center gap-1">
              {p.slug && (
                <a href={`/learn/blog/${p.slug}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" title="View post"><ExternalLink className="w-4 h-4" /></Button>
                </a>
              )}
            </div>,
          ];
        }}
      />
    </div>
  );
}