import React, { useState, useEffect } from "react";
import { Send, Plus, AlertTriangle, Pencil } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
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
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingEnabled, setSendingEnabled] = useState(true);

  useEffect(() => {
    base44.entities.EmailCampaign.list("-created_date", 200).then((c) => {
      setRows(c);
      setLoading(false);
    });
    base44.functions.invoke("checkResendConfiguration", {}).then((res) => {
      if (!res.data?.error) setSendingEnabled(!!res.data.sendingEnabled);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Create, approve, schedule and send email campaigns."
        actions={
          <Button onClick={() => navigate("/admin/marketing/email/studio")}>
            <Plus className="w-4 h-4 mr-2" /> New Campaign
          </Button>
        }
      />
      {!sendingEnabled && (
        <div className="flex items-start gap-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-5">
          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-200">
            Campaign sending is disabled — Resend is not fully configured (API key and from email required).{" "}
            <Link to="/admin/marketing/email/settings" className="underline font-medium">Configure Resend</Link>
          </p>
        </div>
      )}
      <AdminTable
        loading={loading}
        rows={rows}
        columns={["Name", "Type", "Subject", "Status", "Recipients", "Scheduled", "Created", ""]}
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
          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/marketing/email/studio?id=${c.id}`)}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Button>,
        ]}
      />
    </div>
  );
}