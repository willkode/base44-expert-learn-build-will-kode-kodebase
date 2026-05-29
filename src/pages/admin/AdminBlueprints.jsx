import React, { useState, useEffect } from "react";
import { Boxes } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";

export default function AdminBlueprints() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Blueprint.list("-created_date", 200).then((d) => { setRows(d); setLoading(false); });
  }, []);

  return (
    <div>
      <PageHeader title="Generated Blueprints" description="All blueprints produced by the platform." />
      <AdminTable
        loading={loading}
        rows={rows}
        columns={["Title", "Project ID", "Status", "Created"]}
        emptyIcon={Boxes}
        emptyTitle="No blueprints yet"
        renderRow={(b) => [
          <span className="font-medium">{b.title || "Untitled"}</span>,
          <span className="font-mono text-xs text-muted-foreground">{b.projectId}</span>,
          <span className="capitalize">{b.status}</span>,
          <span className="text-muted-foreground">{b.created_date ? new Date(b.created_date).toLocaleDateString() : "—"}</span>,
        ]}
      />
    </div>
  );
}