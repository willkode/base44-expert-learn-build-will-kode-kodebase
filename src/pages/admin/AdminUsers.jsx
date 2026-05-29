import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLES = ["user", "admin"];
const PLANS = ["free", "pro", "agency"];

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("all");

  const load = () => {
    Promise.all([
      base44.entities.User.list("-created_date", 200),
      base44.entities.Project.list("-created_date", 1000),
    ]).then(([users, projects]) => {
      const c = {};
      projects.forEach((p) => { c[p.created_by_id] = (c[p.created_by_id] || 0) + 1; });
      setRows(users);
      setCounts(c);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const update = async (u, data) => {
    await base44.entities.User.update(u.id, data);
    toast.success("User updated");
    load();
  };

  const filtered = rows.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (u.full_name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
    const matchPlan = plan === "all" || (u.plan || "free") === plan;
    return matchSearch && matchPlan;
  });

  return (
    <div>
      <PageHeader title="Users" description="Manage platform users, roles, and plans." />
      <div className="flex flex-wrap gap-3 mb-5">
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={plan} onValueChange={setPlan}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Plan" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            {PLANS.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <AdminTable
        loading={loading}
        rows={filtered}
        columns={["Name", "Email", "Projects", "Role", "Plan"]}
        emptyIcon={Users}
        emptyTitle="No users found"
        renderRow={(u) => [
          <span className="font-medium">{u.full_name || "—"}</span>,
          <span className="text-muted-foreground">{u.email}</span>,
          <span>{counts[u.id] || 0}</span>,
          <Select value={u.role || "user"} onValueChange={(v) => update(u, { role: v })}>
            <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
          </Select>,
          <Select value={u.plan || "free"} onValueChange={(v) => update(u, { plan: v })}>
            <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>{PLANS.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
          </Select>,
        ]}
      />
    </div>
  );
}