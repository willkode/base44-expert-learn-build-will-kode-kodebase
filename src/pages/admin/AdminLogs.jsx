import React, { useState, useEffect } from "react";
import { ScrollText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";

export default function AdminLogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AgentRun.list("-created_date", 200).then((d) => { setRows(d); setLoading(false); });
  }, []);

  return (
    <div>
      <PageHeader title="AI Agent Runs" description="Track architect agent executions and outcomes." />
      <AdminTable
        loading={loading}
        rows={rows}
        columns={["Agent", "Input", "Status", "Error"]}
        emptyIcon={ScrollText}
        emptyTitle="No agent runs yet"
        renderRow={(l) => [
          <span className="font-medium">{l.agentName}</span>,
          <span className="text-muted-foreground line-clamp-1">{l.inputSummary || "—"}</span>,
          <span className="capitalize">{l.status}</span>,
          <span className="text-muted-foreground line-clamp-1">{l.errorMessage || "—"}</span>,
        ]}
      />
    </div>
  );
}