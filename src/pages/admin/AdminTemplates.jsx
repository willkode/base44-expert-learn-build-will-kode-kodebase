import React, { useState, useEffect } from "react";
import { LayoutTemplate } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";

export default function AdminTemplates() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Template.list("-created_date", 200).then((d) => { setRows(d); setLoading(false); });
  }, []);

  return (
    <div>
      <PageHeader title="Templates" description="Reusable architecture templates." />
      <AdminTable
        loading={loading}
        rows={rows}
        columns={["Name", "Category", "App Type", "Active"]}
        emptyIcon={LayoutTemplate}
        emptyTitle="No templates yet"
        emptyDescription="Templates let users start projects from proven architecture patterns."
        renderRow={(t) => [
          <span className="font-medium">{t.name}</span>,
          <span className="text-muted-foreground">{t.category || "—"}</span>,
          <span className="text-muted-foreground">{t.app_type || "—"}</span>,
          <span>{t.is_active ? "Yes" : "No"}</span>,
        ]}
      />
    </div>
  );
}