import React, { useState, useEffect } from "react";
import { FolderKanban } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";

export default function AdminProjects() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Project.list("-created_date", 200).then((d) => { setRows(d); setLoading(false); });
  }, []);

  return (
    <div>
      <PageHeader title="Projects" description="All projects across the platform." />
      <AdminTable
        loading={loading}
        rows={rows}
        columns={["Name", "Platform", "Status", "Type"]}
        emptyIcon={FolderKanban}
        emptyTitle="No projects yet"
        renderRow={(p) => [
          <span className="font-medium">{p.name}</span>,
          <span className="capitalize text-muted-foreground">{p.platform || "base44"}</span>,
          <span className="capitalize">{p.status}</span>,
          <span className="text-muted-foreground">{p.app_type || "—"}</span>,
        ]}
      />
    </div>
  );
}