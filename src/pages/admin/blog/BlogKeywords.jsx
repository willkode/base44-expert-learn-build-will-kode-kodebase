import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Plus } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function BlogKeywords() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BlogKeyword.list("-created_date", 1000).then((d) => {
      setRows(d);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Keywords"
        description="Track target keywords, search intent, and content status."
        actions={
          <Button className="gap-2" onClick={() => toast.info("Keyword research workspace is coming soon.")}>
            <Plus className="w-4 h-4" /> Add keyword
          </Button>
        }
      />
      <AdminTable
        columns={["Keyword", "Intent", "Priority", "Status"]}
        rows={rows}
        loading={loading}
        emptyIcon={Search}
        emptyTitle="No keywords yet"
        emptyDescription="Build a list of target keywords to guide your AI content generation and SEO strategy."
        renderRow={(k) => [
          <div className="font-medium">{k.keyword}</div>,
          <span className="text-xs text-muted-foreground capitalize">{k.searchIntent}</span>,
          <Badge variant="secondary" className="text-xs capitalize">{k.priority}</Badge>,
          <span className="text-xs text-muted-foreground capitalize">{(k.status || "idea").replace(/_/g, " ")}</span>,
        ]}
      />
    </div>
  );
}