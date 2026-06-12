import React, { useState, useEffect } from "react";
import { ScrollText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_STYLES = {
  success: "bg-green-500/15 text-green-400",
  warning: "bg-yellow-500/15 text-yellow-400",
  error: "bg-red-500/15 text-red-400",
};

export default function EmailLogs() {
  const [tab, setTab] = useState("activity");
  const [logs, setLogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.EmailAutomationLog.list("-created_date", 300),
      base44.entities.EmailEvent.list("-created_date", 300),
    ]).then(([l, e]) => {
      setLogs(l);
      setEvents(e);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader title="Email Logs" description="Send activity, webhook events and automation audit trail." />
      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook Events</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "activity" ? (
        <AdminTable
          loading={loading}
          rows={logs}
          columns={["Event", "Status", "Message", "Time"]}
          emptyIcon={ScrollText}
          emptyTitle="No activity yet"
          emptyDescription="Sends, failures, suppressions and automation runs will be logged here."
          renderRow={(l) => [
            <span className="font-medium capitalize">{(l.eventType || "").replace(/_/g, " ")}</span>,
            <Badge className={`capitalize ${STATUS_STYLES[l.status] || ""}`}>{l.status}</Badge>,
            <span className="text-muted-foreground">{l.message || "—"}</span>,
            <span className="text-muted-foreground">{new Date(l.created_date).toLocaleString()}</span>,
          ]}
        />
      ) : (
        <AdminTable
          loading={loading}
          rows={events}
          columns={["Event", "Recipient", "URL", "Time"]}
          emptyIcon={ScrollText}
          emptyTitle="No webhook events yet"
          emptyDescription="Delivery, open, click, bounce and complaint events from Resend will appear here."
          renderRow={(e) => [
            <span className="font-medium">{e.eventType}</span>,
            <span className="text-muted-foreground">{e.recipientEmail || "—"}</span>,
            <span className="text-muted-foreground truncate max-w-[200px] inline-block">{e.url || "—"}</span>,
            <span className="text-muted-foreground">{new Date(e.occurredAt || e.created_date).toLocaleString()}</span>,
          ]}
        />
      )}
    </div>
  );
}