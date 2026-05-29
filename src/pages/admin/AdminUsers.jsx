import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.User.list("-created_date", 200).then((d) => { setRows(d); setLoading(false); });
  }, []);

  return (
    <div>
      <PageHeader title="Users" description="Manage platform users and roles." />
      <AdminTable
        loading={loading}
        rows={rows}
        columns={["Name", "Email", "Role", "Plan"]}
        emptyIcon={Users}
        emptyTitle="No users yet"
        renderRow={(u) => [
          <span className="font-medium">{u.full_name || "—"}</span>,
          <span className="text-muted-foreground">{u.email}</span>,
          <span className="capitalize">{u.role || "user"}</span>,
          <span className="capitalize">{u.plan || "free"}</span>,
        ]}
      />
    </div>
  );
}