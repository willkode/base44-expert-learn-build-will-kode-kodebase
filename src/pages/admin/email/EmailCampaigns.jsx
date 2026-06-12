import React, { useState, useEffect } from "react";
import { Send, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES = {
  draft: "bg-secondary text-secondary-foreground",
  needs_review: "bg-yellow-500/15 text-yellow-400",
  approved: "bg-blue-500/15 text-blue-400",
  scheduled: "bg-blue-500/15 text-blue-400",
  sending: "bg-orange-500/15 text-orange-400",
  sent: "bg-green-500/15 text-green-400",
  partially_sent: "bg-yellow-500/15 text-yellow-400",
  failed: "bg-red-500/15 text-red-400",
  canceled: "bg-secondary text-muted-foreground",
};

export default function EmailCampaigns() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.EmailCampaign.list("-created_date", 200).then((c) => {
      setRows(c);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Create, approve, schedule and send email campaigns."
        actions={
          <Button onClick={() => toast.info("Campaign builder coming next — use Email Studio to draft content")}>
            <Plus className="w-4 h-4 mr-2" /> New Campaign
          </Button>
        }
      />
      <AdminTable
        loading={loading}
        rows={rows}
        columns={["Name", "Type", "Subject", "Status", "Recipients", "Scheduled", "Created"]}
        emptyIcon={Send}
        emptyTitle="No campaigns yet"
        emptyDescription="Create your first campaign or generate one with AI in the Email Studio."
        renderRow={(c) => [
          <span className="font-medium">{c.name}</span>,
          <span className="text-muted-foreground capitalize">{(c.campaignType || "").replace(/_/g, " ")}</span>,
          <span className="text-muted-foreground">{c.subject || "—"}</span>,
          <Badge className={`capitalize ${STATUS_STYLES[c.sendStatus] || ""}`}>{(c.sendStatus || "draft").replace(/_/g, " ")}</Badge>,
          <span>{c.totalRecipients || 0}</span>,
          <span className="text-muted-foreground">{c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : "—"}</span>,
          <span className="text-muted-foreground">{new Date(c.created_date).toLocaleDateString()}</span>,
        ]}
      />
    </div>
  );
}