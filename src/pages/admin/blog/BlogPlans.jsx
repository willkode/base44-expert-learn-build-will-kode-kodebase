import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ClipboardList, Plus } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function BlogPlans() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BlogContentPlan.list("-created_date", 500).then((d) => {
      setRows(d);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Content Plans"
        description="Create and manage editorial plans and SEO topic campaigns."
        actions={
          <Button className="gap-2" onClick={() => toast.info("Content plan builder is coming soon.")}>
            <Plus className="w-4 h-4" /> New plan
          </Button>
        }
      />
      <AdminTable
        columns={["Name", "Goal", "Status", "Dates"]}
        rows={rows}
        loading={loading}
        emptyIcon={ClipboardList}
        emptyTitle="No content plans yet"
        emptyDescription="Plan out topic clusters and publishing campaigns to drive consistent SEO growth."
        renderRow={(p) => [
          <div className="font-medium">{p.name}</div>,
          <span className="text-xs text-muted-foreground capitalize">{(p.goal || "").replace(/_/g, " ")}</span>,
          <Badge variant="secondary" className="text-xs capitalize">{(p.status || "draft").replace(/_/g, " ")}</Badge>,
          <span className="text-xs text-muted-foreground">{p.startDate || "—"} → {p.endDate || "—"}</span>,
        ]}
      />
    </div>
  );
}