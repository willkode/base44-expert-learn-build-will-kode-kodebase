import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Ban } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import ContactTimeline from "@/components/admin/email/contacts/ContactTimeline";

const STATUS_STYLES = {
  subscribed: "bg-green-500/15 text-green-400",
  unsubscribed: "bg-yellow-500/15 text-yellow-400",
  suppressed: "bg-secondary text-muted-foreground",
  bounced: "bg-red-500/15 text-red-400",
  complained: "bg-red-500/15 text-red-400",
};

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-border/60 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-right">{value || "—"}</span>
    </div>
  );
}

export default function EmailContactProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.functions.invoke("getContactTimeline", { contactId: id })
      .then((res) => {
        if (res.data?.error) setError(res.data.error);
        else setData(res.data);
      })
      .catch((err) => setError(err?.response?.data?.error || err.message));
  }, [id]);

  if (error) return <EmptyState icon={Mail} title="Contact not found" description={error} />;
  if (!data) return <LoadingState label="Loading contact..." />;

  const { contact, lists, suppression, timeline } = data;
  const custom = contact.customFields || {};

  return (
    <div>
      <Link to="/admin/marketing/email/contacts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Contacts
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-sora font-bold text-2xl">{contact.fullName || contact.email}</h1>
          <p className="text-muted-foreground text-sm">{contact.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`capitalize ${STATUS_STYLES[contact.status] || ""}`}>{contact.status}</Badge>
          {suppression && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Ban className="w-3 h-3" /> Suppressed: {suppression.reason.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <h3 className="font-sora font-semibold mb-3">Details</h3>
            <DetailRow label="Company" value={contact.company} />
            <DetailRow label="Phone" value={contact.phone} />
            <DetailRow label="Source" value={contact.source} />
            <DetailRow label="Added" value={new Date(contact.created_date).toLocaleDateString()} />
            <DetailRow label="Emails sent" value={String(contact.totalEmailsSent || 0)} />
            <DetailRow label="Opens" value={String(contact.totalOpens || 0)} />
            <DetailRow label="Clicks" value={String(contact.totalClicks || 0)} />
            <DetailRow label="Last opened" value={contact.lastOpenedAt ? new Date(contact.lastOpenedAt).toLocaleString() : null} />
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <h3 className="font-sora font-semibold mb-3">Consent</h3>
            <DetailRow label="Status" value={(contact.consentStatus || "unknown").replace(/_/g, " ")} />
            <DetailRow label="Source" value={contact.consentSource} />
            <DetailRow label="Timestamp" value={contact.consentTimestamp ? new Date(contact.consentTimestamp).toLocaleString() : null} />
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <h3 className="font-sora font-semibold mb-3">Tags & Lists</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(contact.tags || []).length > 0
                ? contact.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)
                : <span className="text-sm text-muted-foreground">No tags</span>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lists.length > 0
                ? lists.map((l) => <Badge key={l.id} variant="outline">{l.name}</Badge>)
                : <span className="text-sm text-muted-foreground">Not in any list</span>}
            </div>
          </div>

          {Object.keys(custom).length > 0 && (
            <div className="rounded-2xl border border-border bg-card/60 p-6">
              <h3 className="font-sora font-semibold mb-3">Custom Fields</h3>
              {Object.entries(custom).map(([k, v]) => <DetailRow key={k} label={k} value={String(v)} />)}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <ContactTimeline timeline={timeline} />
        </div>
      </div>
    </div>
  );
}