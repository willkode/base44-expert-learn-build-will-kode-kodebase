import React, { useState, useEffect } from "react";
import { Inbox } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CrmStatCards from "@/components/admin/crm/CrmStatCards";
import { loadCrmSubmissions, SOURCE_LABELS } from "@/components/admin/crm/crmSources";
import { base44 } from "@/api/base44Client";

const SOURCE_STYLES = {
  contact: "bg-primary/15 text-primary",
  newsletter: "bg-blue-500/15 text-blue-400",
  early_access: "bg-amber-500/15 text-amber-400",
};

export default function AdminCrm() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");

  useEffect(() => {
    base44.analytics.track({ eventName: "admin_crm_view" });
    loadCrmSubmissions().then((d) => {
      setRows(d);
      setLoading(false);
    });
  }, []);

  const filtered = rows.filter((r) => {
    if (source !== "all" && r.source !== source) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [r.name, r.email, r.phone, r.subject, r.message]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  return (
    <div>
      <PageHeader
        title="CRM — Contact Submissions"
        description="Every contact form, newsletter and early-access submission across the site in one list."
      />

      <CrmStatCards rows={rows} />

      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search name, email, subject or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {Object.entries(SOURCE_LABELS).map(([k, label]) => (
              <SelectItem key={k} value={k}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AdminTable
        loading={loading}
        rows={filtered}
        columns={["Source", "Name", "Email", "Phone", "Subject", "Message", "Status", "Date"]}
        emptyIcon={Inbox}
        emptyTitle="No submissions yet"
        renderRow={(r) => [
          <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${SOURCE_STYLES[r.source]}`}>
            {SOURCE_LABELS[r.source]}
          </span>,
          <span className="font-medium">{r.name || "—"}</span>,
          <span className="text-muted-foreground">{r.email || "—"}</span>,
          <span className="text-muted-foreground">{r.phone || "—"}</span>,
          <span className="text-muted-foreground line-clamp-1 max-w-[14rem]">{r.subject || "—"}</span>,
          <span className="text-muted-foreground line-clamp-2 max-w-xs">{r.message || "—"}</span>,
          <span className="text-muted-foreground capitalize">{r.status || "—"}</span>,
          <span className="text-muted-foreground text-xs">
            {r.created_date ? new Date(r.created_date).toLocaleString() : "—"}
          </span>,
        ]}
      />
    </div>
  );
}