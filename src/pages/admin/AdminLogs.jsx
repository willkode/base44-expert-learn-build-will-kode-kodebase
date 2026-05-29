import React, { useState, useEffect } from "react";
import { ScrollText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["pending", "success", "failed"];

export default function AdminLogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    base44.entities.AgentRun.list("-created_date", 300).then((d) => { setRows(d); setLoading(false); });
  }, []);

  const agents = ["all", ...Array.from(new Set(rows.map((r) => r.agentName).filter(Boolean)))];

  const filtered = rows.filter((l) =>
    (agent === "all" || l.agentName === agent) && (status === "all" || l.status === status)
  );

  return (
    <div>
      <PageHeader title="AI Usage Logs" description="Track agent executions, outcomes, and errors." />
      <div className="flex flex-wrap gap-3 mb-5">
        <Select value={agent} onValueChange={setAgent}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Agent" /></SelectTrigger>
          <SelectContent>
            {agents.map((a) => <SelectItem key={a} value={a}>{a === "all" ? "All agents" : a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <AdminTable
        loading={loading}
        rows={filtered}
        columns={["Agent", "Input", "Status", "Error", "Date"]}
        emptyIcon={ScrollText}
        emptyTitle="No agent runs found"
        renderRow={(l) => [
          <span className="font-medium">{l.agentName}</span>,
          <span className="text-muted-foreground line-clamp-1 max-w-xs">{l.inputSummary || "—"}</span>,
          <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${
            l.status === "success" ? "bg-green-500/15 text-green-400"
            : l.status === "failed" ? "bg-destructive/15 text-destructive"
            : "bg-secondary text-muted-foreground"
          }`}>{l.status}</span>,
          <span className="text-destructive/90 line-clamp-1 max-w-xs">{l.errorMessage || "—"}</span>,
          <span className="text-muted-foreground">{l.created_date ? new Date(l.created_date).toLocaleDateString() : "—"}</span>,
        ]}
      />
    </div>
  );
}