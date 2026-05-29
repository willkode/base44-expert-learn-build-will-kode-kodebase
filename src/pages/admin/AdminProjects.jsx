import React, { useState, useEffect } from "react";
import { FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import StatusBadge from "@/components/project/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["draft", "generating", "completed", "archived"];

export default function AdminProjects() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    base44.entities.Project.list("-created_date", 300).then((d) => { setRows(d); setLoading(false); });
  }, []);

  const filtered = rows.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (p.projectName || "").toLowerCase().includes(q);
    const matchStatus = status === "all" || p.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <PageHeader title="Projects" description="All projects across the platform." />
      <div className="flex flex-wrap gap-3 mb-5">
        <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
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
        columns={["Name", "Platform", "Status", "Type", ""]}
        emptyIcon={FolderKanban}
        emptyTitle="No projects found"
        renderRow={(p) => [
          <span className="font-medium">{p.projectName}</span>,
          <span className="capitalize text-muted-foreground">{p.platformFocus || "Base44"}</span>,
          <StatusBadge status={p.status} />,
          <span className="text-muted-foreground">{p.appType || "—"}</span>,
          <Button asChild variant="outline" size="sm"><Link to={`/projects/${p.id}/overview`}>Open</Link></Button>,
        ]}
      />
    </div>
  );
}