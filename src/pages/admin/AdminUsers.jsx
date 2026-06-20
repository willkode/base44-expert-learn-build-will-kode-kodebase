import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UserDetailDrawer from "@/components/admin/users/UserDetailDrawer";

const ROLES = ["user", "admin"];
const PLANS = ["free", "pro", "agency"];

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("all");
  const [role, setRole] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedUser, setSelectedUser] = useState(null);

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

  const filtered = rows
    .filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = !q || (u.full_name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
      const matchPlan = plan === "all" || (u.plan || "free") === plan;
      const matchRole = role === "all" || (u.role || "user") === role;
      return matchSearch && matchPlan && matchRole;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === "oldest") return new Date(a.created_date) - new Date(b.created_date);
      if (sortBy === "name") return (a.full_name || "").localeCompare(b.full_name || "");
      if (sortBy === "projects") return (counts[b.id] || 0) - (counts[a.id] || 0);
      return 0;
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
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
            <SelectItem value="projects">Most projects</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <AdminTable
        loading={loading}
        rows={filtered}
        columns={["Name", "Email", "Joined", "Projects", "Role", "Plan"]}
        emptyIcon={Users}
        emptyTitle="No users found"
        onRowClick={(u) => setSelectedUser(u)}
        renderRow={(u) => [
          <span className="font-medium">{u.full_name || "—"}</span>,
          <span className="text-muted-foreground">{u.email}</span>,
          <span className="text-muted-foreground text-sm">{u.created_date ? format(new Date(u.created_date), "MMM d, yyyy") : "—"}</span>,
          <span>{counts[u.id] || 0}</span>,
          <Select value={u.role || "user"} onValueChange={(v) => { v !== u.role && update(u, { role: v }); }} onClick={(e) => e.stopPropagation()}>
            <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
          </Select>,
          <Select value={u.plan || "free"} onValueChange={(v) => { v !== u.plan && update(u, { plan: v }); }} onClick={(e) => e.stopPropagation()}>
            <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>{PLANS.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
          </Select>,
        ]}
      />

      <UserDetailDrawer
        user={selectedUser}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        projectCount={counts[selectedUser?.id] || 0}
        onUpdated={load}
      />
    </div>
  );
}