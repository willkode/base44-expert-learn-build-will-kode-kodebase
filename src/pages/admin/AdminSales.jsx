import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { DollarSign, Search, ExternalLink, CheckCircle2, Clock, XCircle, Send, X, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_STYLES = {
  completed: "bg-green-500/15 text-green-400",
  pending: "bg-amber-500/15 text-amber-400",
  failed: "bg-destructive/15 text-destructive",
};

// Classify how access was obtained — several legitimate $0 record types exist.
const getOrderType = (p) => {
  if (p.errorMessage === "Access granted by admin") return "admin_grant";
  if ((p.squarePaymentId || "").startsWith("free-")) return "free_claim";
  if ((p.squarePaymentId || "").includes("-bundle-")) return "bundle_item";
  if ((p.amountCents || 0) > 0) return "paid";
  return "other";
};

const TYPE_LABELS = {
  paid: { label: "Paid", cls: "bg-green-500/15 text-green-400" },
  admin_grant: { label: "Admin grant", cls: "bg-blue-500/15 text-blue-400" },
  free_claim: { label: "Free claim", cls: "bg-secondary text-muted-foreground" },
  bundle_item: { label: "Bundle item", cls: "bg-purple-500/15 text-purple-400" },
  other: { label: "Other", cls: "bg-secondary text-muted-foreground" },
};

const TypeBadge = ({ type }) => {
  const t = TYPE_LABELS[type] || TYPE_LABELS.other;
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${t.cls}`}>{t.label}</span>;
};

const StatusBadge = ({ status }) => (
  <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${STATUS_STYLES[status] || "bg-secondary text-muted-foreground"}`}>
    {status}
  </span>
);

function SendPdfsModal({ onClose }) {
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    base44.entities.Product.filter({ deliversPdf: true }).then(setProducts);
  }, []);

  const toggle = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSend = async () => {
    if (!email || selected.length === 0) return;
    setSending(true);
    try {
      const res = await base44.functions.invoke("sendProductPdfs", { email, productIds: selected });
      setResult({ success: true, message: `Sent ${res.data.sent} PDF${res.data.sent !== 1 ? "s" : ""} to ${email}` });
    } catch (e) {
      setResult({ success: false, message: e.message || "Failed to send" });
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-sora font-bold text-lg">Send Product PDFs</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          <div className="p-6 text-center">
            <div className={`text-4xl mb-3`}>{result.success ? "✅" : "❌"}</div>
            <p className={`font-semibold ${result.success ? "text-green-400" : "text-destructive"}`}>{result.message}</p>
            <Button className="mt-6 w-full" variant="outline" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Customer Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Select Products to Send</label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {products.map((p) => (
                  <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selected.includes(p.id) ? "border-primary bg-primary/10" : "border-border bg-secondary/30 hover:border-primary/40"}`}>
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggle(p.id)}
                      className="accent-primary w-4 h-4 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.pdfFileName}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSend}
              disabled={!email || selected.length === 0 || sending}
              className="w-full"
            >
              {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : <><Send className="w-4 h-4 mr-2" /> Send {selected.length > 0 ? `${selected.length} PDF${selected.length !== 1 ? "s" : ""}` : "PDFs"}</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSales() {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showSendModal, setShowSendModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const loadData = () =>
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

  useEffect(() => { loadData(); }, []);

  const syncFromSquare = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke("syncSquarePayments", {});
      if (res.data?.success) {
        setSyncResult(`Synced — ${res.data.created} new order${res.data.created !== 1 ? "s" : ""} imported, ${res.data.alreadyRecorded} already recorded.`);
        await loadData();
      } else {
        setSyncResult(res.data?.error || "Sync failed.");
      }
    } catch (e) {
      setSyncResult(e?.response?.data?.error || "Sync failed.");
    }
    setSyncing(false);
  };

  // Date-range scoping — applied to both the summary cards and the table.
  const inRange = (p) => {
    if (!p.created_date) return !fromDate && !toDate;
    const d = new Date(p.created_date);
    if (fromDate && d < new Date(`${fromDate}T00:00:00`)) return false;
    if (toDate && d > new Date(`${toDate}T23:59:59.999`)) return false;
    return true;
  };
  const rangedPayments = payments.filter(inRange);

  const setPreset = (days) => {
    const now = new Date();
    const toIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (days === "all") { setFromDate(""); setToDate(""); return; }
    if (days === "month") {
      setFromDate(toIso(new Date(now.getFullYear(), now.getMonth(), 1)));
      setToDate(toIso(now));
      return;
    }
    const from = new Date(now);
    from.setDate(now.getDate() - (days - 1));
    setFromDate(toIso(from));
    setToDate(toIso(now));
  };

  const filtered = rangedPayments.filter((p) => {
    const user = users[p.userId] || {};
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (user.full_name || "").toLowerCase().includes(q) ||
      (user.email || "").toLowerCase().includes(q) ||
      (p.userEmail || "").toLowerCase().includes(q) ||
      (p.itemName || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesType = typeFilter === "all" || getOrderType(p) === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRevenue = rangedPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.amountCents || 0), 0);

  const formatCents = (cents) =>
    cents != null ? `$${(cents / 100).toFixed(2)}` : "—";

  if (loading) return <LoadingState />;

  return (
    <div>
      {showSendModal && <SendPdfsModal onClose={() => setShowSendModal(false)} />}
      <div className="flex items-start justify-between gap-4 mb-6">
        <PageHeader title="Sales & Orders" description="All product and service purchases across users." />
        <div className="flex gap-2 shrink-0 mt-1">
          <Button variant="outline" onClick={syncFromSquare} disabled={syncing}>
            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {syncing ? "Syncing…" : "Sync from Square"}
          </Button>
          <Button onClick={() => setShowSendModal(true)}>
            <Send className="w-4 h-4 mr-2" /> Send PDFs
          </Button>
        </div>
      </div>
      {syncResult && <p className="text-sm text-primary mb-4">{syncResult}</p>}

      {/* Summary cards - note: PageHeader is now inside the flex row above */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: fromDate || toDate ? "Revenue (selected range)" : "Total Revenue", value: formatCents(totalRevenue), icon: DollarSign, color: "text-green-400" },
          { label: "Paid Orders", value: rangedPayments.filter((p) => p.status === "completed" && getOrderType(p) === "paid").length, icon: CheckCircle2, color: "text-green-400" },
          { label: "Pending / Failed", value: rangedPayments.filter((p) => p.status !== "completed").length, icon: Clock, color: "text-amber-400" },
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

      {/* Date range */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="rounded-lg border border-input bg-background text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
          aria-label="From date"
        />
        <span className="text-muted-foreground text-sm">to</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="rounded-lg border border-input bg-background text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
          aria-label="To date"
        />
        <div className="flex flex-wrap gap-1.5 sm:ml-2">
          {[
            { label: "Today", v: 1 },
            { label: "7 days", v: 7 },
            { label: "30 days", v: 30 },
            { label: "This month", v: "month" },
            { label: "All time", v: "all" },
          ].map(({ label, v }) => (
            <button
              key={label}
              onClick={() => setPreset(v)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-input bg-background text-sm px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
        >
          <option value="all">All types</option>
          <option value="paid">Paid</option>
          <option value="admin_grant">Admin grants</option>
          <option value="free_claim">Free claims</option>
          <option value="bundle_item">Bundle items</option>
        </select>
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
              {["Date", "Customer", "Item", "Amount", "Type", "Status", "Receipt"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground text-sm">No orders found.</td>
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
                      <TypeBadge type={getOrderType(p)} />
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