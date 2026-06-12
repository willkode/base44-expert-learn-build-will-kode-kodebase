import React, { useState, useEffect } from "react";
import { Users, Upload, UserPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["subscribed", "unsubscribed", "bounced", "complained", "suppressed", "pending"];

export default function EmailContacts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    base44.entities.EmailContact.list("-created_date", 1000).then((c) => {
      setRows(c);
      setLoading(false);
    });
  }, []);

  const filtered = rows.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.email?.toLowerCase().includes(q) || (c.fullName || "").toLowerCase().includes(q);
    const matchStatus = status === "all" || c.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="View, search, tag and manage your email contacts."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info("Contact import coming next")}>
              <Upload className="w-4 h-4 mr-2" /> Import
            </Button>
            <Button onClick={() => toast.info("Add contact coming next")}>
              <UserPlus className="w-4 h-4 mr-2" /> Add Contact
            </Button>
          </div>
        }
      />
      <div className="flex flex-wrap gap-3 mb-5">
        <Input placeholder="Search by email or name..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <AdminTable
        loading={loading}
        rows={filtered}
        columns={["Email", "Name", "Status", "Source", "Tags", "Added"]}
        emptyIcon={Users}
        emptyTitle="No contacts yet"
        emptyDescription="Import contacts or sync your newsletter subscribers to get started."
        renderRow={(c) => [
          <span className="font-medium">{c.email}</span>,
          <span className="text-muted-foreground">{c.fullName || "—"}</span>,
          <Badge variant="secondary" className="capitalize">{c.status}</Badge>,
          <span className="text-muted-foreground">{c.source || "—"}</span>,
          <span className="text-muted-foreground">{(c.tags || []).join(", ") || "—"}</span>,
          <span className="text-muted-foreground">{new Date(c.created_date).toLocaleDateString()}</span>,
        ]}
      />
    </div>
  );
}