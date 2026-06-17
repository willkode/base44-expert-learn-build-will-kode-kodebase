import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  Wrench, RotateCw, Trash2, Pause, Play, RefreshCw, Facebook, Instagram,
  Download, Loader2, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { trackEvent } from "@/lib/analytics";

function ToolButton({ icon: Icon, label, hint, onClick, busy, variant = "outline", danger }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`text-left rounded-xl border p-3.5 transition-colors disabled:opacity-60 ${
        danger
          ? "border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
          : "border-border bg-card/60 hover:bg-secondary/40"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {busy ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Icon className={`w-4 h-4 ${danger ? "text-red-400" : "text-primary"}`} />}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </button>
  );
}

// AdminRecoveryTools: bulk recovery actions for the social system.
// Calls the socialRecoveryTools backend endpoint.
export default function AdminRecoveryTools() {
  const [busy, setBusy] = useState(null);
  const [failedCount, setFailedCount] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignId, setCampaignId] = useState("");

  const refreshCounts = async () => {
    const failed = await base44.entities.ScheduledPost.filter({ status: "failed" }, "-last_attempt_at", 500);
    setFailedCount(failed.length);
  };

  useEffect(() => {
    Promise.all([
      base44.entities.ScheduledPost.filter({ status: "failed" }, "-last_attempt_at", 500),
      base44.entities.SocialCampaign.list("-created_date", 200),
    ]).then(([failed, c]) => {
      setFailedCount(failed.length);
      setCampaigns(c);
    });
  }, []);

  const run = async (action, extra = {}, successMsg) => {
    setBusy(action);
    try {
      const res = await base44.functions.invoke("socialRecoveryTools", { action, ...extra });
      if (res?.data?.error) throw new Error(res.data.error);
      trackEvent("admin_social_recovery_action", { action });
      toast.success(successMsg ? successMsg(res.data) : "Done.");
      await refreshCounts();
      return res.data;
    } catch (e) {
      toast.error(e.message || "Action failed.");
    } finally {
      setBusy(null);
    }
  };

  const requireCampaign = () => {
    if (!campaignId) { toast.error("Select a campaign first."); return false; }
    return true;
  };

  const exportLogs = async () => {
    const data = await run("export_logs", { limit: 2000 });
    if (!data?.logs?.length) { toast.info("No logs to export."); return; }
    const headers = ["created_date", "event_type", "platform", "status", "message", "related_campaign_id", "related_post_id", "related_scheduled_post_id"];
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(","), ...data.logs.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `social-automation-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Wrench className="w-4 h-4 text-primary" />
        <h2 className="font-sora font-semibold">Recovery Tools</h2>
        {failedCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
            {failedCount} failed in queue
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Recover from failures across the system. Tokens and secrets are never exposed by these tools.
      </p>

      {/* Queue actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <ToolButton
          icon={RotateCw} label="Retry failed posts"
          hint="Re-queue every failed scheduled post for another publishing attempt."
          busy={busy === "retry_failed_queue"}
          onClick={() => run("retry_failed_queue", {}, (d) => `Re-queued ${d.requeued} post(s).`)}
        />
        <ToolButton
          icon={Trash2} label="Clear failed queue" danger
          hint="Cancel every failed scheduled post. This cannot be undone."
          busy={busy === "clear_failed_queue"}
          onClick={() => run("clear_failed_queue", {}, (d) => `Cleared ${d.cleared} post(s).`)}
        />
      </div>

      {/* Campaign actions */}
      <div className="rounded-xl border border-border bg-background/40 p-3.5 mb-5">
        <p className="text-xs font-medium text-muted-foreground mb-2">Campaign controls</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={campaignId} onValueChange={setCampaignId}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Select a campaign" /></SelectTrigger>
            <SelectContent>
              {campaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name} · {c.status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={busy === "pause_campaign"}
              onClick={() => requireCampaign() && run("pause_campaign", { campaign_id: campaignId }, () => "Campaign paused.")}>
              {busy === "pause_campaign" ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Pause className="w-3.5 h-3.5 mr-1.5" />} Pause
            </Button>
            <Button variant="outline" size="sm" disabled={busy === "resume_campaign"}
              onClick={() => requireCampaign() && run("resume_campaign", { campaign_id: campaignId }, () => "Campaign resumed.")}>
              {busy === "resume_campaign" ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1.5" />} Resume
            </Button>
          </div>
        </div>
      </div>

      {/* Meta re-sync + export */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ToolButton
          icon={Facebook} label="Re-sync Facebook Pages"
          hint="Refresh the list of Facebook Pages you can publish to."
          busy={busy === "resync_facebook_pages"}
          onClick={() => run("resync_facebook_pages", {}, (d) => `Synced ${d.pages} Page(s).`)}
        />
        <ToolButton
          icon={Instagram} label="Re-sync Instagram accounts"
          hint="Refresh the linked Instagram professional accounts."
          busy={busy === "resync_instagram_accounts"}
          onClick={() => run("resync_instagram_accounts", {}, (d) => `Synced ${d.accounts} account(s).`)}
        />
        <ToolButton
          icon={Download} label="Export logs"
          hint="Download recent automation logs as a CSV file."
          busy={busy === "export_logs"}
          onClick={exportLogs}
        />
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-4">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        Reconnecting accounts is done from the Connections page.
      </p>
    </div>
  );
}