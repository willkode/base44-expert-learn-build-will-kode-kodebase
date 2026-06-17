import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ScrollText } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/admin/social/StatusBadge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PLATFORM_MAP, LOG_STATUS_STYLES, prettyLabel, formatDateTime } from "@/components/admin/social/socialConfig";
import { trackEvent } from "@/lib/analytics";

const EVENT_FILTERS = [
  { key: "all", label: "All Events" },
  { key: "content_generated", label: "AI Generation" },
  { key: "scheduled", label: "Scheduling" },
  { key: "post_attempt", label: "Posting" },
  { key: "token_refresh", label: "Token Refresh" },
  { key: "analytics_sync", label: "Analytics Sync" },
  { key: "meta_event", label: "Meta OAuth" },
];

export default function SocialLogs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    trackEvent("admin_social_logs_view");
    base44.entities.SocialAutomationLog.list("-created_date", 500).then((l) => {
      setLogs(l);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState label="Loading logs..." />;

  const rows = logs.filter((l) => filter === "all" || l.event_type === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="Automation Logs" description="Background job history: AI generation, scheduling, posting attempts, token refreshes, analytics syncs and Meta events." />

      <div className="flex flex-wrap gap-2">
        {EVENT_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg border text-sm ${filter === f.key ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No log entries"
          description="Background activity for the social system will appear here as posts are generated, scheduled and published."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((l) => {
                const P = PLATFORM_MAP[l.platform];
                return (
                  <TableRow key={l.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(l.created_date)}</TableCell>
                    <TableCell className="text-sm">{prettyLabel(l.event_type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {P?.icon && <P.icon className="w-4 h-4" />}
                        {P?.label || "—"}
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge value={l.status} styleMap={LOG_STATUS_STYLES} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-md truncate">{l.message}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}