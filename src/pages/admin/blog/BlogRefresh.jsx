import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";

const PRIORITY_VARIANT = { high: "destructive", medium: "secondary", low: "outline" };

export default function BlogRefresh() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BlogContentRefreshRecommendation.list("-created_date", 500).then((d) => {
      setRows(d);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Content Refresh"
        description="Recommended updates to keep old or underperforming posts ranking."
      />
      <AdminTable
        columns={["Type", "Reason", "Priority", "Status"]}
        rows={rows}
        loading={loading}
        emptyIcon={RefreshCw}
        emptyTitle="No refresh recommendations yet"
        emptyDescription="When posts start to decay or underperform, AI will recommend specific updates here."
        renderRow={(r) => [
          <span className="text-sm font-medium capitalize">{(r.recommendationType || "").replace(/_/g, " ")}</span>,
          <span className="text-xs text-muted-foreground line-clamp-1">{r.reason || "—"}</span>,
          <Badge variant={PRIORITY_VARIANT[r.priority] || "outline"} className="text-xs capitalize">{r.priority}</Badge>,
          <span className="text-xs text-muted-foreground capitalize">{(r.status || "open").replace(/_/g, " ")}</span>,
        ]}
      />
    </div>
  );
}