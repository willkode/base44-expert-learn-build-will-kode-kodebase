import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminTable from "@/components/admin/AdminTable";
import SendQuoteLinkDialog from "@/components/admin/migration/SendQuoteLinkDialog";
import { Inbox, Send, Copy } from "lucide-react";

const money = (c) => `$${((c || 0) / 100).toLocaleString()}`;

export default function AdminQuoteLeadsTab() {
  const [leads, setLeads] = useState(null);
  const [active, setActive] = useState(null);

  const load = useCallback(async () => {
    const res = await base44.functions.invoke("migrationAdmin", { action: "quote_leads" });
    setLeads(res.data?.leads || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <AdminTable
        loading={leads === null}
        rows={leads || []}
        columns={["Received", "Name", "Email", "Request", "Quote sent", "Status", "Actions"]}
        emptyIcon={Inbox}
        emptyTitle="No migration quote requests yet"
        emptyDescription="Submissions from the migration quote tool will show up here."
        renderRow={(lead) => [
          <span className="text-xs text-muted-foreground">{new Date(lead.created_date).toLocaleDateString()}</span>,
          <span className="font-medium">{lead.name}</span>,
          <a href={`mailto:${lead.email}`} className="text-primary text-sm">{lead.email}</a>,
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-w-sm font-inter">{lead.message}</pre>,
          lead.quoteSentAt ? (
            <span className="text-xs">{money(lead.quoteAmountCents)}<br />{new Date(lead.quoteSentAt).toLocaleDateString()}</span>
          ) : "—",
          <Badge variant={lead.status === "replied" ? "default" : "secondary"}>{lead.status}</Badge>,
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={() => setActive(lead)}>
              <Send className="w-3.5 h-3.5 mr-1" /> {lead.quoteSentAt ? "Resend" : "Send payment link"}
            </Button>
            {lead.quotePaymentLinkUrl && (
              <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(lead.quotePaymentLinkUrl)}>
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy link
              </Button>
            )}
          </div>,
        ]}
      />
      {active && <SendQuoteLinkDialog lead={active} onClose={() => setActive(null)} onSent={load} />}
    </div>
  );
}