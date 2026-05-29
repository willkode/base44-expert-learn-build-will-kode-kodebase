import React, { useState, useEffect } from "react";
import { Boxes } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminBlueprints() {
  const [rows, setRows] = useState([]);
  const [owners, setOwners] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      base44.entities.Blueprint.list("-created_date", 300),
      base44.entities.User.list("-created_date", 500),
    ]).then(([blueprints, users]) => {
      const o = {};
      users.forEach((u) => { o[u.id] = u.full_name || u.email; });
      setRows(blueprints);
      setOwners(o);
      setLoading(false);
    });
  }, []);

  const filtered = rows.filter((b) => {
    const q = search.toLowerCase();
    return !q || (b.title || "").toLowerCase().includes(q) || (owners[b.created_by_id] || "").toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader title="Generated Blueprints" description="All blueprints produced by the platform." />
      <div className="flex flex-wrap gap-3 mb-5">
        <Input placeholder="Search by title or owner..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>
      <AdminTable
        loading={loading}
        rows={filtered}
        columns={["Title", "Owner", "Status", "Created", ""]}
        emptyIcon={Boxes}
        emptyTitle="No blueprints found"
        renderRow={(b) => [
          <span className="font-medium">{b.title || "Untitled"}</span>,
          <span className="text-muted-foreground">{owners[b.created_by_id] || "—"}</span>,
          <span className="capitalize">{b.status}</span>,
          <span className="text-muted-foreground">{b.created_date ? new Date(b.created_date).toLocaleDateString() : "—"}</span>,
          <Button asChild variant="outline" size="sm"><Link to={`/projects/${b.projectId}/blueprint`}>Open</Link></Button>,
        ]}
      />
    </div>
  );
}