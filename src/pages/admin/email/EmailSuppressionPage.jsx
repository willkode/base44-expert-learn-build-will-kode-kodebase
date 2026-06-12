import React, { useState, useEffect } from "react";
import { Ban, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function EmailSuppressionPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.entities.EmailSuppression.list("-created_date", 500).then((s) => {
      setRows(s);
      setLoading(false);
    });
  }, []);

  const filtered = rows.filter((s) => !search || s.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Suppression List"
        description="Emails that will never receive marketing messages."
        actions={
          <Button variant="outline" onClick={() => toast.info("Manual suppression coming next")}>
            <Plus className="w-4 h-4 mr-2" /> Suppress Email
          </Button>
        }
      />
      <div className="mb-5">
        <Input placeholder="Search email..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>
      <AdminTable
        loading={loading}
        rows={filtered}
        columns={["Email", "Reason", "Source", "Added"]}
        emptyIcon={Ban}
        emptyTitle="Suppression list is empty"
        emptyDescription="Unsubscribes, bounces and complaints will be added here automatically and excluded from all sends."
        renderRow={(s) => [
          <span className="font-medium">{s.email}</span>,
          <Badge variant="secondary" className="capitalize">{(s.reason || "").replace(/_/g, " ")}</Badge>,
          <span className="text-muted-foreground capitalize">{(s.source || "").replace(/_/g, " ")}</span>,
          <span className="text-muted-foreground">{new Date(s.created_date).toLocaleDateString()}</span>,
        ]}
      />
    </div>
  );
}