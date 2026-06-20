import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { DollarSign, Search, ExternalLink, CheckCircle2, Clock, XCircle } from "lucide-react";

const STATUS_STYLES = {
  completed: "bg-green-500/15 text-green-400",
  pending: "bg-amber-500/15 text-amber-400",
  failed: "bg-destructive/15 text-destructive",
};

const StatusBadge = ({ status }) => (
  <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${STATUS_STYLES[status] || "bg-secondary text-muted-foreground"}`}>
    {status}
  </span>
);

export default function AdminSales() {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      base44.entities.Payment.list("-created_date", 500),
      base44.entities.User.list("-created_date", 500),
    ]).then(([pmts, userList]) => {
      setPayments(pmts);
      const userMap = {};
      userList.forEach((u) => { userMap[u.id] = u; });
      setUsers(userMap);
      setLoading(false);
    });
  }, []);

  const filtered = payments.filter((p) => {
    const user = users[p.userId] || {};
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (user.full_name || "").toLowerCase().includes(q) ||
      (user.email || "").toLowerCase().includes(q) ||
      (p.userEmail || "").toLowerCase().includes(q) ||
      (p.itemName || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.amountCents || 0), 0);

  const formatCents = (cents) =>
    cents != null ? `$${(cents / 100).toFixed(2)}` : "—";

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Sales & Orders" description="All product and service purchases across users." />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: formatCents(totalRevenue), icon: DollarSign, color: "text-green-400" },
          { label: "Completed Orders", value: payments.filter((p) => p.status === "completed").length, icon: CheckCircle2, color: "text-green-400" },
          { label: "Pending / Failed", value: payments.filter((p) => p.status !== "completed").length, icon: Clock, color: "text-amber-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-card/60 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-sora font-bold text-xl">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or item…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-input bg-background text-sm px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
        >
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card/60 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Date", "Customer", "Item", "Amount", "Status", "Receipt"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground text-sm">No orders found.</td>
              </tr>
            ) : (
              filtered.map((p) => {
                const user = users[p.userId] || {};
                return (
                  <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">
                      {p.created_date ? new Date(p.created_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">{user.full_name || p.userEmail || "—"}</p>
                      <p className="text-xs text-muted-foreground">{user.email || p.userEmail || ""}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">{p.itemName || "—"}</p>
                      {p.planId && <p className="text-xs text-muted-foreground">Plan: {p.planId}</p>}
                      {p.productId && <p className="text-xs text-muted-foreground">Product: {p.productId}</p>}
                    </td>
                    <td className="px-5 py-3.5 font-sora font-semibold whitespace-nowrap">
                      {formatCents(p.amountCents)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      {p.squareReceiptUrl ? (
                        <a href={p.squareReceiptUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline text-xs">
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground mt-3 text-right">{filtered.length} order{filtered.length !== 1 ? "s" : ""} shown</p>
      )}
    </div>
  );
}