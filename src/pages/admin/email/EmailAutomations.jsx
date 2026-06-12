import React, { useState, useEffect } from "react";
import { Workflow, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EmailAutomations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.EmailSequence.list("-created_date", 200).then((s) => {
      setRows(s);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Automations"
        description="Drip sequences, onboarding flows and reactivation campaigns."
        actions={
          <Button onClick={() => toast.info("Sequence builder coming next")}>
            <Plus className="w-4 h-4 mr-2" /> New Sequence
          </Button>
        }
      />
      <AdminTable
        loading={loading}
        rows={rows}
        columns={["Name", "Trigger", "Status", "Created"]}
        emptyIcon={Workflow}
        emptyTitle="No automations yet"
        emptyDescription="Build drip sequences that automatically send emails when contacts are added, tagged, or join a list."
        renderRow={(s) => [
          <span className="font-medium">{s.name}</span>,
          <span className="text-muted-foreground capitalize">{(s.triggerType || "").replace(/_/g, " ")}</span>,
          <Badge variant="secondary" className="capitalize">{s.status}</Badge>,
          <span className="text-muted-foreground">{new Date(s.created_date).toLocaleDateString()}</span>,
        ]}
      />
    </div>
  );
}