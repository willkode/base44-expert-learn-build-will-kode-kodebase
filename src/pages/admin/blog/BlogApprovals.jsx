import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Pencil, ExternalLink } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { APPROVAL_FILTERS, ApprovalBadge } from "@/components/admin/blog/approval/approvalConfig";
import ApprovalActions from "@/components/admin/blog/approval/ApprovalActions";
import ApprovalMeta from "@/components/admin/blog/approval/ApprovalMeta";

export default function BlogApprovals() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("needs_review");

  useEffect(() => {
    trackEvent("blog_approvals_viewed");
    base44.entities.BlogPost.list("-updated_date", 1000).then((d) => {
      setPosts(d);
      setLoading(false);
    });
  }, []);

  const applyUpdate = (updated) =>
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));

  const counts = posts.reduce((acc, p) => {
    const s = p.approvalStatus || "draft";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const filtered = posts.filter((p) =>
    filter === "all" ? true : (p.approvalStatus || "draft") === filter
  );

  return (
    <div>
      <PageHeader
        title="Approval Queue"
        description="Review, approve, reject, or request changes before posts can be scheduled or published."
      />

      <div className="flex flex-wrap gap-2 mb-5">
        {APPROVAL_FILTERS.map((f) => {
          const count = f.value === "all" ? posts.length : counts[f.value] || 0;
          const active = filter === f.value;
          return (
            <Button
              key={f.value}
              size="sm"
              variant={active ? "default" : "outline"}
              onClick={() => setFilter(f.value)}
              className="gap-1.5"
            >
              {f.label}
              <span className={`text-xs ${active ? "opacity-80" : "text-muted-foreground"}`}>{count}</span>
            </Button>
          );
        })}
      </div>

      <AdminTable
        columns={["Title", "Approval", "Details", "Actions", ""]}
        rows={filtered}
        loading={loading}
        emptyIcon={ShieldCheck}
        emptyTitle="Nothing here"
        emptyDescription="No posts match this filter."
        renderRow={(p) => [
          <div>
            <div className="font-medium">{p.title}</div>
            {p.slug && <div className="text-xs text-muted-foreground">/{p.slug}</div>}
          </div>,
          <ApprovalBadge status={p.approvalStatus || "draft"} />,
          <div className="max-w-xs"><ApprovalMeta post={p} compact /></div>,
          <ApprovalActions post={p} onChange={applyUpdate} />,
          <div className="flex items-center gap-1">
            <Link to={`/admin/marketing/blog/posts/${p.id}/edit`}>
              <Button variant="ghost" size="icon" title="Edit post"><Pencil className="w-4 h-4" /></Button>
            </Link>
            {p.slug && (
              <a href={`/learn/blog/${p.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" title="View post"><ExternalLink className="w-4 h-4" /></Button>
              </a>
            )}
          </div>,
        ]}
      />
    </div>
  );
}