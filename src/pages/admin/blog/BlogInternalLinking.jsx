import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";

export default function BlogInternalLinking() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BlogInternalLink.list("-created_date", 1000).then((d) => {
      setRows(d);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Internal Linking"
        description="Review and apply AI-suggested internal links between your posts."
      />
      <AdminTable
        columns={["Anchor text", "Context", "Status"]}
        rows={rows}
        loading={loading}
        emptyIcon={Link2}
        emptyTitle="No link suggestions yet"
        emptyDescription="As you publish posts, AI will suggest internal links to strengthen your topic clusters and SEO."
        renderRow={(l) => [
          <div className="font-medium">{l.anchorText || "—"}</div>,
          <span className="text-xs text-muted-foreground line-clamp-1">{l.contextSnippet || "—"}</span>,
          <Badge variant="secondary" className="text-xs capitalize">{l.status}</Badge>,
        ]}
      />
    </div>
  );
}