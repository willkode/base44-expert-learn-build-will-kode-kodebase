import React, { useState, useEffect } from "react";
import { DownloadCloud } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Input } from "@/components/ui/input";

export default function AdminDownloadLogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.entities.DownloadLog.list("-created_date", 500).then((d) => {
      setRows(d);
      setLoading(false);
    });
  }, []);

  const filtered = rows.filter((l) => {
    const q = search.toLowerCase();
    return !q
      || (l.userEmail || "").toLowerCase().includes(q)
      || (l.productName || "").toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader
        title="Download Logs"
        description="Every product download by a buyer — who, what, and when."
      />
      <div className="mb-5 max-w-sm">
        <Input
          placeholder="Search by email or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <AdminTable
        loading={loading}
        rows={filtered}
        columns={["User", "Product", "Files", "Emailed", "IP", "Date"]}
        emptyIcon={DownloadCloud}
        emptyTitle="No downloads yet"
        renderRow={(l) => [
          <span className="font-medium">{l.userEmail || "—"}</span>,
          <span className="text-muted-foreground line-clamp-1 max-w-xs">{l.productName || "—"}</span>,
          <span className="text-muted-foreground">{l.fileCount ?? 1}</span>,
          <span className={`text-xs px-2.5 py-1 rounded-full ${
            l.emailed ? "bg-green-500/15 text-green-400" : "bg-secondary text-muted-foreground"
          }`}>{l.emailed ? "Yes" : "No"}</span>,
          <span className="text-muted-foreground text-xs">{l.ip || "—"}</span>,
          <span className="text-muted-foreground">
            {l.created_date ? new Date(l.created_date).toLocaleString() : "—"}
          </span>,
        ]}
      />
    </div>
  );
}