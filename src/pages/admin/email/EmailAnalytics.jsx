import React, { useState, useEffect } from "react";
import { BarChart3, MailOpen, MousePointerClick, Send, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import StatCard from "@/components/shared/StatCard";

export default function EmailAnalytics() {
  const [loading, setLoading] = useState(true);
  const [sends, setSends] = useState([]);

  useEffect(() => {
    base44.entities.EmailSend.list("-created_date", 1000).then((s) => {
      setSends(s);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState label="Loading analytics..." />;

  if (sends.length === 0) {
    return (
      <div>
        <PageHeader title="Analytics" description="Campaign, sequence and contact performance reporting." />
        <EmptyState
          icon={BarChart3}
          title="No email activity yet"
          description="Once you send your first campaign, delivery, open, click and bounce analytics will appear here."
        />
      </div>
    );
  }

  const delivered = sends.filter((s) => ["delivered", "opened", "clicked"].includes(s.status)).length;
  const opened = sends.filter((s) => s.openCount > 0 || ["opened", "clicked"].includes(s.status)).length;
  const clicked = sends.filter((s) => s.clickCount > 0 || s.status === "clicked").length;
  const bounced = sends.filter((s) => s.status === "bounced").length;
  const pct = (n, d) => (d === 0 ? "—" : `${Math.round((n / d) * 100)}%`);

  return (
    <div>
      <PageHeader title="Analytics" description="Campaign, sequence and contact performance reporting." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Send} label="Total Sends" value={sends.length} />
        <StatCard icon={MailOpen} label="Open Rate" value={pct(opened, delivered)} />
        <StatCard icon={MousePointerClick} label="Click Rate" value={pct(clicked, delivered)} />
        <StatCard icon={AlertTriangle} label="Bounces" value={bounced} />
      </div>
    </div>
  );
}