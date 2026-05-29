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
        columns={["Title", "Category", "Public", "Created"]}
        emptyIcon={LayoutTemplate}
        emptyTitle="No templates yet"
        emptyDescription="Templates let users start projects from proven architecture patterns."
        renderRow={(t) => [
          <span className="font-medium">{t.title}</span>,
          <span className="text-muted-foreground">{t.category || "—"}</span>,
          <span>{t.isPublic ? "Yes" : "No"}</span>,
          <span className="text-muted-foreground">{t.created_date ? new Date(t.created_date).toLocaleDateString() : "—"}</span>,
        ]}
      />
    </div>
  );
}