import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { ScrollText, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import LogFilters from "@/components/admin/social/auditlog/LogFilters";
import LogRow from "@/components/admin/social/auditlog/LogRow";
import { EVENT_GROUPS } from "@/components/admin/social/auditlog/logsConfig";
import { trackEvent } from "@/lib/analytics";

const GROUP_BY_LABEL = EVENT_GROUPS.reduce((acc, g) => { acc[g.label] = g.events; return acc; }, {});

const DEFAULT_FILTERS = {
  dateRange: "all", eventType: "all", platform: "all",
  status: "all", campaign: "all", user: "all", search: "",
};

export default function SocialLogs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const loadLogs = () =>
    base44.entities.SocialAutomationLog.list("-created_date", 1000).then(setLogs);

  useEffect(() => {
    trackEvent("admin_social_logs_view");
    Promise.all([
      base44.entities.SocialAutomationLog.list("-created_date", 1000),
      base44.entities.SocialCampaign.list("-created_date", 200),
      base44.entities.User.list("-created_date", 200).catch(() => []),
    ]).then(([l, c, u]) => {
      setLogs(l);
      setCampaigns(c);
      setUsers(u);
      setLoading(false);
    });
  }, []);

  const campaignMap = useMemo(() => Object.fromEntries(campaigns.map((c) => [c.id, c.name])), [campaigns]);
  const userMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u.full_name || u.email || u.id])),
    [users]
  );

  const rows = useMemo(() => {
    const now = Date.now();
    return logs.filter((l) => {
      // Date range
      if (filters.dateRange !== "all") {
        const days = parseInt(filters.dateRange, 10);
        const cutoff = now - days * 24 * 60 * 60 * 1000;
        if (new Date(l.created_date).getTime() < cutoff) return false;
      }
      // Event type (group-based)
      if (filters.eventType !== "all") {
        const label = filters.eventType.replace("group:", "");
        const groupEvents = GROUP_BY_LABEL[label] || [];
        if (!groupEvents.includes(l.event_type)) return false;
      }
      if (filters.platform !== "all" && l.platform !== filters.platform) return false;
      if (filters.status !== "all" && l.status !== filters.status) return false;
      if (filters.campaign !== "all" && l.related_campaign_id !== filters.campaign) return false;
      if (filters.user !== "all" && l.user_id !== filters.user) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!(l.message || "").toLowerCase().includes(q) && !(l.event_type || "").toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [logs, filters]);

  const handleRetry = async (log) => {
    try {
      const res = await base44.functions.invoke("manageScheduledSocialPost", {
        scheduled_post_id: log.related_scheduled_post_id,
        action: "retry",
      });
      if (res?.data?.error) throw new Error(res.data.error);
      trackEvent("admin_social_log_retry", { event_type: log.event_type });
      toast.success("Post re-queued for publishing.");
      await loadLogs();
    } catch (e) {
      toast.error(e.message || "Retry failed.");
    }
  };

  if (loading) return <LoadingState label="Loading logs..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation Logs"
        description="Full audit trail of every social action: OAuth, AI generation, approvals, scheduling, publishing, analytics and settings changes."
        actions={
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground rounded-lg border border-border bg-card/60 px-3 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> Tokens & secrets are redacted
          </span>
        }
      />

      <LogFilters
        filters={filters}
        setFilters={setFilters}
        campaigns={campaigns}
        users={users}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      <p className="text-xs text-muted-foreground">{rows.length} of {logs.length} entries</p>

      {rows.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No matching log entries"
          description="Adjust the filters above, or wait for social activity to be recorded here."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card/60 overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-3 py-2.5 w-8" />
                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">Time</th>
                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">Event</th>
                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">Platform</th>
                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">Message</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <LogRow
                  key={l.id}
                  log={l}
                  campaignName={campaignMap[l.related_campaign_id]}
                  userName={userMap[l.user_id]}
                  onRetry={handleRetry}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}