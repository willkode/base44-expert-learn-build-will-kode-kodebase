import React, { useState, useEffect } from "react";
import { Users, Upload, UserPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import ContactFilters from "@/components/admin/email/contacts/ContactFilters";
import ContactFormDialog from "@/components/admin/email/contacts/ContactFormDialog";
import ImportContactsDialog from "@/components/admin/email/contacts/ImportContactsDialog";
import ContactRowActions from "@/components/admin/email/contacts/ContactRowActions";
import BulkActionsBar from "@/components/admin/email/contacts/BulkActionsBar";

const STATUS_STYLES = {
  subscribed: "bg-green-500/15 text-green-400",
  unsubscribed: "bg-yellow-500/15 text-yellow-400",
  bounced: "bg-red-500/15 text-red-400",
  complained: "bg-red-500/15 text-red-400",
  suppressed: "bg-secondary text-muted-foreground",
  pending: "bg-blue-500/15 text-blue-400",
};

export default function EmailContacts() {
  const urlParams = new URLSearchParams(window.location.search);
  const [rows, setRows] = useState([]);
  const [lists, setLists] = useState([]);
  const [listMembers, setListMembers] = useState(null); // Set of contactIds for the selected list
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "", status: "all", tag: "all", source: "all",
    list: urlParams.get("list") || "all", activity: "any",
  });
  const [selected, setSelected] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  const load = () => {
    Promise.all([
      base44.entities.EmailContact.list("-created_date", 1000),
      base44.entities.EmailList.list("-created_date", 200),
    ]).then(([c, l]) => {
      setRows(c);
      setLists(l);
      setLoading(false);
    });
  };
  useEffect(load, []);

  // Load memberships when filtering by list
  useEffect(() => {
    if (filters.list === "all") { setListMembers(null); return; }
    base44.entities.EmailListMembership.filter({ listId: filters.list }, "-created_date", 5000)
      .then((m) => setListMembers(new Set(m.map((x) => x.contactId))));
  }, [filters.list]);

  const allTags = [...new Set(rows.flatMap((c) => c.tags || []))].sort();
  const allSources = [...new Set(rows.map((c) => c.source).filter(Boolean))].sort();

  const filtered = rows.filter((c) => {
    const q = filters.search.toLowerCase();
    if (q && !(c.email?.toLowerCase().includes(q) || (c.fullName || "").toLowerCase().includes(q) ||
      (c.firstName || "").toLowerCase().includes(q) || (c.lastName || "").toLowerCase().includes(q) ||
      (c.company || "").toLowerCase().includes(q))) return false;
    if (filters.status !== "all" && c.status !== filters.status) return false;
    if (filters.tag !== "all" && !(c.tags || []).includes(filters.tag)) return false;
    if (filters.source !== "all" && c.source !== filters.source) return false;
    if (filters.list !== "all" && listMembers && !listMembers.has(c.id)) return false;
    if (filters.activity === "opened" && !(c.totalOpens > 0)) return false;
    if (filters.activity === "clicked" && !(c.totalClicks > 0)) return false;
    if (filters.activity === "never_opened" && c.totalOpens > 0) return false;
    return true;
  });

  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const runAction = async (fnName, payload, successMsg) => {
    try {
      const res = await base44.functions.invoke(fnName, payload);
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(successMsg);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Action failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="Contacts"
        description={`${rows.length} contact${rows.length === 1 ? "" : "s"} total`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="w-4 h-4 mr-2" /> Import CSV
            </Button>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <UserPlus className="w-4 h-4 mr-2" /> Add Contact
            </Button>
          </div>
        }
      />

      <ContactFilters filters={filters} setFilters={setFilters} allTags={allTags} allSources={allSources} lists={lists} />

      {selected.length > 0 && (
        <BulkActionsBar
          selectedIds={selected}
          lists={lists}
          onDone={() => { setSelected([]); load(); }}
          onClear={() => setSelected([])}
        />
      )}

      <AdminTable
        loading={loading}
        rows={filtered}
        columns={["", "Email", "Name", "Status", "Tags", "Source", "Last sent", "Opens", "Clicks", "Created", ""]}
        emptyIcon={Users}
        emptyTitle="No contacts found"
        emptyDescription="Add a contact or import a CSV to get started."
        renderRow={(c) => [
          <Checkbox checked={selected.includes(c.id)} onCheckedChange={() => toggleSelect(c.id)} />,
          <span className="font-medium">{c.email}</span>,
          <span className="text-muted-foreground">{c.fullName || "—"}</span>,
          <Badge className={`capitalize ${STATUS_STYLES[c.status] || ""}`}>{c.status}</Badge>,
          <span className="text-muted-foreground text-xs">{(c.tags || []).slice(0, 3).join(", ") || "—"}{(c.tags || []).length > 3 ? "…" : ""}</span>,
          <span className="text-muted-foreground">{c.source || "—"}</span>,
          <span className="text-muted-foreground">{c.lastEmailSentAt ? new Date(c.lastEmailSentAt).toLocaleDateString() : "—"}</span>,
          <span>{c.totalOpens || 0}</span>,
          <span>{c.totalClicks || 0}</span>,
          <span className="text-muted-foreground">{new Date(c.created_date).toLocaleDateString()}</span>,
          <ContactRowActions
            contact={c}
            onEdit={(ct) => { setEditing(ct); setFormOpen(true); }}
            onUnsubscribe={(ct) => runAction("unsubscribeContact", { contactId: ct.id }, `${ct.email} unsubscribed`)}
            onSuppress={(ct) => runAction("suppressContact", { contactId: ct.id }, `${ct.email} suppressed`)}
            onDelete={(ct) => {
              if (window.confirm(`Delete ${ct.email}? This cannot be undone. Suppression records are kept.`)) {
                runAction("deleteEmailContact", { contactId: ct.id }, `${ct.email} deleted`);
              }
            }}
          />,
        ]}
      />

      <ContactFormDialog open={formOpen} onOpenChange={setFormOpen} contact={editing} onSaved={load} />
      <ImportContactsDialog open={importOpen} onOpenChange={setImportOpen} lists={lists} onImported={load} />
    </div>
  );
}