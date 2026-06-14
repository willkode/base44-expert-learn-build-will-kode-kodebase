import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ScrollText, Download, RefreshCw, Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { trackEvent } from "@/lib/analytics";
import LogDetailDialog from "@/components/admin/blog/auditlog/LogDetailDialog";
import { eventLabel, STATUS_VARIANT, STATUS_FILTERS } from "@/components/admin/blog/auditlog/logConfig";

function toCsv(rows) {
  const head = ["timestamp", "event", "status", "message", "relatedPostId"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [
    r.created_date ? new Date(r.created_date).toISOString() : "",
    r.eventType || "", r.status || "", r.message || "", r.relatedPostId || "",
  ].map(esc).join(","));
  return [head.join(","), ...lines].join("\n");
}

export default function BlogLogs() {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    const d = await base44.entities.BlogAutomationLog.list("-created_date", 500);
    setRows(d);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    trackEvent("admin_view_blog_logs", {});
  }, [load]);

  const eventOptions = useMemo(() => {
    const set = new Set(rows.map((r) => r.eventType).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      (statusFilter === "all" || r.status === statusFilter) &&
      (eventFilter === "all" || r.eventType === eventFilter) &&
      (!q || (r.message || "").toLowerCase().includes(q) || eventLabel(r.eventType).toLowerCase().includes(q))
    );
  }, [rows, statusFilter, eventFilter, search]);

  const handleExport = () => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blog-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent("admin_export_blog_logs", { count: filtered.length });
  };

  const handleRecover = async (tool, blogPostId) => {
    setRecovering(true);
    trackEvent("admin_blog_recovery_tool", { tool });
    const res = await base44.functions.invoke("runBlogRecoveryTool", { tool, blog_post_id: blogPostId });
    const data = res.data || {};
    if (data.success) {
      toast({ title: "Recovery complete", description: data.message || "Action completed." });
      setDetailOpen(false);
      await load();
    } else {
      toast({ title: "Recovery failed", description: data.error || "Could not complete.", variant: "destructive" });
    }
    setRecovering(false);
  };

  const handleAnalyticsSync = async () => {
    setSyncing(true);
    await handleRecover("rerun_analytics_sync", null);
    setSyncing(false);
  };

  const openLog = (log) => { setSelected(log); setDetailOpen(true); };

  return (
    <div>
      <PageHeader
        title="Automation Logs"
        description="Audit trail and recovery tools for generation, scheduling, publishing, SEO, and sync tasks."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAnalyticsSync} disabled={syncing}>
              {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Re-run analytics sync
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
              <Download className="w-4 h-4 mr-2" /> Export logs
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="All events" /></SelectTrigger>
          <SelectContent>
            {eventOptions.map((e) => <SelectItem key={e} value={e}>{e === "all" ? "All events" : eventLabel(e)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <AdminTable
        columns={["Event", "Status", "Message", "When"]}
        rows={filtered}
        loading={loading}
        emptyIcon={ScrollText}
        emptyTitle="No logs match your filters"
        emptyDescription="Blog automation activity is recorded here for auditing and recovery."
        renderRow={(l) => [
          <button onClick={() => openLog(l)} className="text-sm font-medium text-left hover:text-primary">{eventLabel(l.eventType)}</button>,
          <Badge variant={STATUS_VARIANT[l.status] || "outline"} className="text-xs capitalize">{l.status}</Badge>,
          <button onClick={() => openLog(l)} className="text-xs text-muted-foreground line-clamp-1 text-left hover:text-foreground">{l.message || "—"}</button>,
          <span className="text-xs text-muted-foreground">{l.created_date ? format(new Date(l.created_date), "MMM d, HH:mm") : "—"}</span>,
        ]}
      />

      <LogDetailDialog
        log={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onRecover={handleRecover}
        recovering={recovering}
      />
    </div>
  );
}