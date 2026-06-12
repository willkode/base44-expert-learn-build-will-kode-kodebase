import React, { useState, useEffect } from "react";
import { ListChecks, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EmailLists() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.EmailList.list("-created_date", 200).then((l) => {
      setRows(l);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Lists"
        description="Manage manual and imported contact lists."
        actions={
          <Button onClick={() => toast.info("List creation coming next")}>
            <Plus className="w-4 h-4 mr-2" /> New List
          </Button>
        }
      />
      <AdminTable
        loading={loading}
        rows={rows}
        columns={["Name", "Type", "Contacts", "Active", "Unsubscribed", "Created"]}
        emptyIcon={ListChecks}
        emptyTitle="No lists yet"
        emptyDescription="Create a list to organize your contacts into audiences."
        renderRow={(l) => [
          <span className="font-medium">{l.name}</span>,
          <Badge variant="secondary" className="capitalize">{l.listType}</Badge>,
          <span>{l.contactCount || 0}</span>,
          <span>{l.activeContactCount || 0}</span>,
          <span>{l.unsubscribedCount || 0}</span>,
          <span className="text-muted-foreground">{new Date(l.created_date).toLocaleDateString()}</span>,
        ]}
      />
    </div>
  );
}