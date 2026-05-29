import React, { useState, useEffect } from "react";
import { ScrollText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";

export default function AdminLogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AIUsageLog.list("-created_date", 200).then((d) => { setRows(d); setLoading(false); });
  }, []);

  return (
    <div>
      <PageHeader title="AI Usage Logs" description="Track architect agent runs and token usage." />
      <AdminTable
        loading={loading}
        rows={rows}
        columns={["Agent", "Action", "Tokens", "Status"]}
        emptyIcon={ScrollText}
        emptyTitle="No usage logs yet"
        renderRow={(l) => [
          <span className="font-medium">{l.agent}</span>,
          <span className="text-muted-foreground">{l.action || "—"}</span>,
          <span>{l.tokens_used || 0}</span>,
          <span className="capitalize">{l.status}</span>,
        ]}
      />
    </div>
  );
}