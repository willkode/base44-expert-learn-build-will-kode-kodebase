import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Users, UserCheck, UserMinus, Send, CalendarClock, MailOpen,
  MousePointerClick, AlertTriangle, ShieldAlert, XCircle, Plug,
  Sparkles, Upload, Filter, Workflow, BarChart3, Cog,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import StatCard from "@/components/shared/StatCard";
import { Badge } from "@/components/ui/badge";

const quickActions = [
  { label: "Create Campaign", to: "/admin/marketing/email/campaigns", icon: Send },
  { label: "Generate with AI", to: "/admin/marketing/email/studio", icon: Sparkles },
  { label: "Import Contacts", to: "/admin/marketing/email/contacts", icon: Upload },
  { label: "Create Segment", to: "/admin/marketing/email/segments", icon: Filter },
  { label: "Create Automation", to: "/admin/marketing/email/automations", icon: Workflow },
  { label: "View Analytics", to: "/admin/marketing/email/analytics", icon: BarChart3 },
  { label: "Configure Resend", to: "/admin/marketing/email/settings", icon: Cog },
];

export default function EmailDashboard() {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [sends, setSends] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.EmailContact.list("-created_date", 1000),
      base44.entities.EmailCampaign.list("-created_date", 200),
      base44.entities.EmailSend.list("-created_date", 1000),
      base44.entities.EmailSettings.filter({ key: "global" }, "-created_date", 1),
    ]).then(([c, cam, s, set]) => {
      setContacts(c);
      setCampaigns(cam);
      setSends(s);
      setSettings(set[0] || null);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState label="Loading email dashboard..." />;

  const subscribed = contacts.filter((c) => c.status === "subscribed").length;
  const unsubscribed = contacts.filter((c) => c.status === "unsubscribed").length;
  const now = new Date();
  const sentThisMonth = campaigns.filter((c) => {
    if (c.sendStatus !== "sent" && c.sendStatus !== "partially_sent") return false;
    const d = new Date(c.updated_date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const scheduled = campaigns.filter((c) => c.sendStatus === "scheduled").length;
  const delivered = sends.filter((s) => ["delivered", "opened", "clicked"].includes(s.status)).length;
  const opened = sends.filter((s) => s.openCount > 0 || ["opened", "clicked"].includes(s.status)).length;
  const clicked = sends.filter((s) => s.clickCount > 0 || s.status === "clicked").length;
  const bounced = sends.filter((s) => s.status === "bounced").length;
  const complained = sends.filter((s) => s.status === "complained").length;
  const failed = sends.filter((s) => s.status === "failed").length;
  const pct = (n, d) => (d === 0 ? "—" : `${Math.round((n / d) * 100)}%`);
  const configured = !!settings?.resendApiKeyConfigured;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Marketing"
        description="Overview of your email marketing health and activity."
        actions={
          <Badge variant={configured ? "default" : "secondary"} className="flex items-center gap-1.5 px-3 py-1.5">
            <Plug className="w-3.5 h-3.5" />
            {configured ? "Resend connected" : "Resend not configured"}
          </Badge>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Contacts" value={contacts.length} />
        <StatCard icon={UserCheck} label="Subscribed" value={subscribed} />
        <StatCard icon={UserMinus} label="Unsubscribed" value={unsubscribed} />
        <StatCard icon={Send} label="Sent This Month" value={sentThisMonth} />
        <StatCard icon={CalendarClock} label="Scheduled" value={scheduled} />
        <StatCard icon={MailOpen} label="Avg Open Rate" value={pct(opened, delivered)} />
        <StatCard icon={MousePointerClick} label="Avg Click Rate" value={pct(clicked, delivered)} />
        <StatCard icon={AlertTriangle} label="Bounce Rate" value={pct(bounced, sends.length)} />
        <StatCard icon={ShieldAlert} label="Complaint Rate" value={pct(complained, sends.length)} />
        <StatCard icon={XCircle} label="Failed Sends" value={failed} />
      </div>

      <section>
        <h2 className="font-sora font-semibold text-lg mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, to, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4 hover:border-primary/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#f87171]/15 via-[#fb923c]/15 to-[#facc15]/15 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}