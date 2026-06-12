import React, { useState, useEffect } from "react";
import { Filter, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EmailSegments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.EmailSegment.list("-created_date", 200).then((s) => {
      setRows(s);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Segments"
        description="Dynamic targeting rules for your contacts."
        actions={
          <Button onClick={() => toast.info("Segment builder coming next")}>
            <Plus className="w-4 h-4 mr-2" /> New Segment
          </Button>
        }
      />
      <AdminTable
        loading={loading}
        rows={rows}
        columns={["Name", "Logic", "Rules", "Est. Contacts", "Created"]}
        emptyIcon={Filter}
        emptyTitle="No segments yet"
        emptyDescription="Build segments to target contacts by tags, activity, source and more."
        renderRow={(s) => [
          <span className="font-medium">{s.name}</span>,
          <Badge variant="secondary" className="uppercase">{s.ruleLogic || "all"}</Badge>,
          <span>{(s.rules || []).length}</span>,
          <span>{s.estimatedContactCount || 0}</span>,
          <span className="text-muted-foreground">{new Date(s.created_date).toLocaleDateString()}</span>,
        ]}
      />
    </div>
  );
}