import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ScrollText } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT = { success: "default", warning: "secondary", error: "destructive" };

export default function BlogLogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BlogAutomationLog.list("-created_date", 500).then((d) => {
      setRows(d);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Automation Logs"
        description="Audit trail for generation, scheduling, publishing, and refresh tasks."
      />
      <AdminTable
        columns={["Event", "Status", "Message", "When"]}
        rows={rows}
        loading={loading}
        emptyIcon={ScrollText}
        emptyTitle="No logs yet"
        emptyDescription="Blog automation activity will be recorded here for auditing."
        renderRow={(l) => [
          <span className="text-sm font-medium capitalize">{(l.eventType || "").replace(/_/g, " ")}</span>,
          <Badge variant={STATUS_VARIANT[l.status] || "outline"} className="text-xs capitalize">{l.status}</Badge>,
          <span className="text-xs text-muted-foreground line-clamp-1">{l.message || "—"}</span>,
          <span className="text-xs text-muted-foreground">{l.created_date ? format(new Date(l.created_date), "MMM d, HH:mm") : "—"}</span>,
        ]}
      />
    </div>
  );
}